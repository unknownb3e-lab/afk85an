const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

const SHARED_SECRET = process.env.MCP_SECRET_KEY;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';
const PORT = process.env.PORT || 3001;
const AI_MODEL = process.env.AI_MODEL || 'google/gemini-2.0-flash-exp:free';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!SHARED_SECRET) {
    console.error('FATAL: MCP_SECRET_KEY is not set');
    process.exit(1);
}
if (!OPENROUTER_API_KEY) {
    console.error('FATAL: OPENROUTER_API_KEY is not set');
    process.exit(1);
}

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
    res.json({ status: 'ok', model: AI_MODEL, uptime: process.uptime() });
});

app.post('/api/chat', authMiddleware, async (req, res) => {
    const { messages = [], systemPrompt = 'You are a helpful AI assistant.' } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'messages array is required' });
    }

    const openRouterMessages = [];
    if (systemPrompt) openRouterMessages.push({ role: 'system', content: systemPrompt });
    for (const msg of messages) {
        const role = msg.role === 'assistant' ? 'assistant' : 'user';
        const text = String(msg.content || '');
        if (text) openRouterMessages.push({ role, content: text });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const send = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);

    try {
        const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + OPENROUTER_API_KEY,
                'HTTP-Referer': 'https://afk85an-dashboard.local',
                'X-Title': 'AFK85an Dashboard'
            },
            body: JSON.stringify({
                model: AI_MODEL,
                messages: openRouterMessages,
                stream: true,
                max_tokens: 2048,
                temperature: 0.7
            })
        });

        if (!upstream.ok || !upstream.body) {
            const errText = await upstream.text().catch(() => '');
            send({ error: 'OpenRouter ' + upstream.status + ': ' + errText });
            return res.end();
        }

        const reader = upstream.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || !trimmed.startsWith('data:')) continue;
                const payload = trimmed.slice(5).trim();
                if (payload === '[DONE]') {
                    send({ done: true });
                    res.end();
                    return;
                }
                try {
                    const obj = JSON.parse(payload);
                    const delta = obj.choices && obj.choices[0] && obj.choices[0].delta && obj.choices[0].delta.content;
                    if (delta) send({ delta });
                    if (obj.error) send({ error: obj.error.message || JSON.stringify(obj.error) });
                } catch (_) {}
            }
        }

        send({ done: true });
        res.end();
    } catch (err) {
        send({ error: err.message || 'unknown' });
        res.end();
    }
});

app.listen(PORT, () => {
    console.log('MCP Server running on port ' + PORT);
    console.log('Provider: OpenRouter');
    console.log('Model: ' + AI_MODEL);
});
