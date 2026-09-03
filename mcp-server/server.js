const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const app = express();

const SHARED_SECRET = process.env.MCP_SECRET_KEY;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';
const PORT = process.env.PORT || 3001;
const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash';

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
app.use(cors({ origin: ALLOWED_ORIGIN === '*' ? true : ALLOWED_ORIGIN, credentials: true }));

const authMiddleware = (req, res, next) => {
    const provided = req.headers['x-mcp-secret'];
    if (provided !== SHARED_SECRET) {
        return res.status(401).json({ error: 'Invalid secret key' });
    }
    next();
};

app.get('/health', (req, res) => {
    res.json({ status: 'ok', model: TEXT_MODEL, uptime: process.uptime() });
});

app.post('/api/chat', authMiddleware, async (req, res) => {
    const { messages = [], systemPrompt = 'You are a helpful AI assistant.' } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'messages array is required' });
    }

    const contents = [];
    if (systemPrompt) {
        contents.push({ role: 'user', parts: [{ text: systemPrompt }] });
        contents.push({ role: 'model', parts: [{ text: 'Understood.' }] });
    }
    for (const msg of messages) {
        const role = msg.role === 'assistant' ? 'model' : 'user';
        const text = String(msg.content || '');
        if (text) contents.push({ role, parts: [{ text }] });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const send = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);

    try {
        const streamResult = await genai.models.generateContentStream({
            model: TEXT_MODEL,
            contents,
            config: { temperature: 0.7, maxOutputTokens: 2048 }
        });

        for await (const chunk of streamResult) {
            const parts = (chunk.candidates && chunk.candidates[0] && chunk.candidates[0].content && chunk.candidates[0].content.parts) || [];
            let textDelta = '';
            for (const part of parts) {
                if (part && part.text) textDelta += part.text;
            }
            if (textDelta) send({ delta: textDelta });
        }
        send({ done: true });
        res.end();
    } catch (err) {
        send({ error: err.message || 'unknown' });
        res.end();
    }
});

app.listen(PORT, () => {
    console.log(`MCP Server running on port ${PORT}`);
    console.log(`Model: ${TEXT_MODEL}`);
});
