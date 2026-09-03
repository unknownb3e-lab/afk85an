const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const app = express();

const SHARED_SECRET = process.env.MCP_SECRET_KEY;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';
const PORT = process.env.PORT || 3001;
const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash';
const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';

if (!SHARED_SECRET) {
    console.error('FATAL: MCP_SECRET_KEY is not set');
    process.exit(1);
}

if (!process.env.GEMINI_API_KEY) {
    console.error('FATAL: GEMINI_API_KEY is not set');
    process.exit(1);
}

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.use(express.json({ limit: '20mb' }));
app.use(cors({
    origin: ALLOWED_ORIGIN === '*' ? true : ALLOWED_ORIGIN,
    credentials: true
}));

const authMiddleware = (req, res, next) => {
    const origin = req.headers.origin;
    if (ALLOWED_ORIGIN !== '*' && origin !== ALLOWED_ORIGIN) {
        return res.status(403).json({ error: 'Origin not allowed' });
    }
    const provided = req.headers['x-mcp-secret'];
    if (provided !== SHARED_SECRET) {
        return res.status(401).json({ error: 'Invalid secret key' });
    }
    next();
};

function fileToPart(imageDataUrl) {
    const match = /^data:(image\/\w+);base64,(.+)$/.exec(imageDataUrl || '');
    if (!match) return null;
    return { inlineData: { mimeType: match[1], data: match[2] } };
}

function buildContents(messages, systemPrompt) {
    const contents = [];
    if (systemPrompt) {
        contents.push({ role: 'user', parts: [{ text: systemPrompt }] });
        contents.push({ role: 'model', parts: [{ text: 'Understood. I will follow these instructions.' }] });
    }
    for (const msg of (messages || [])) {
        const role = msg.role === 'assistant' ? 'model' : 'user';
        const parts = [];
        if (Array.isArray(msg.images)) {
            for (const img of msg.images) {
                const part = fileToPart(img);
                if (part) parts.push(part);
            }
        }
        if (msg.content) parts.push({ text: String(msg.content) });
        if (parts.length > 0) contents.push({ role, parts });
    }
    return contents;
}

app.get('/health', (req, res) => {
    res.json({ status: 'ok', textModel: TEXT_MODEL, imageModel: IMAGE_MODEL, uptime: process.uptime() });
});

app.post('/api/chat', authMiddleware, async (req, res) => {
    try {
        const {
            messages,
            systemPrompt = 'You are a helpful AI assistant.',
            model = TEXT_MODEL,
            generateImage = false
        } = req.body || {};

        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: 'messages array is required' });
        }

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders();

        const contents = buildContents(messages, systemPrompt);
        if (contents.length === 0) {
            res.write(`data: ${JSON.stringify({ error: 'No valid content' })}\n\n`);
            return res.end();
        }

        const useModel = generateImage ? IMAGE_MODEL : model;

        const streamResult = await genai.models.generateContentStream({
            model: useModel,
            contents,
            config: { temperature: 0.7, maxOutputTokens: 2048 }
        });

        for await (const chunk of streamResult) {
            const parts = (chunk.candidates && chunk.candidates[0] && chunk.candidates[0].content && chunk.candidates[0].content.parts) || [];
            let textDelta = '';
            let imageData = null;
            for (const part of parts) {
                if (part && part.text) textDelta += part.text;
                if (part && part.inlineData) {
                    const mime = part.inlineData.mimeType || 'image/png';
                    imageData = `data:${mime};base64,${part.inlineData.data}`;
                }
            }
            if (textDelta) res.write(`data: ${JSON.stringify({ delta: textDelta })}\n\n`);
            if (imageData) res.write(`data: ${JSON.stringify({ image: imageData })}\n\n`);
        }

        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
    } catch (err) {
        console.error('Chat error:', err.message);
        if (!res.headersSent) {
            res.status(500).json({ error: err.message });
        } else {
            res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
            res.end();
        }
    }
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`MCP Server running on port ${PORT}`);
    console.log(`Text Model: ${TEXT_MODEL}`);
    console.log(`Image Model: ${IMAGE_MODEL}`);
    console.log(`Endpoint: http://localhost:${PORT}/api/chat`);
});
