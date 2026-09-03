const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

const SHARED_SECRET = process.env.MCP_SECRET_KEY;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';
const PORT = process.env.PORT || 3001;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const AI_MODELS = (process.env.AI_MODELS || 'z-ai/glm-5.2:free,google/gemma-4-31b-it:free,minimax/minimax-m2.7:free,minimax/minimax-m3:free,nvidia/nemotron-3-super-120b-a12b:free')
    .split(',').map(s => s.trim()).filter(Boolean);

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
    res.json({ status: 'ok', models: AI_MODELS, uptime: process.uptime() });
});

async function callOpenRouter(model, openRouterMessages) {
    return await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + OPENROUTER_API_KEY,
            'HTTP-Referer': 'https://afk85an-dashboard.local',
            'X-Title': 'AFK85an Dashboard'
        },
        body: JSON.stringify({
            model,
            messages: openRouterMessages,
            stream: true,
            max_tokens: 2048,
            temperature: 0.7
        })
    });
}

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

    let lastError = null;
    for (const model of AI_MODELS) {
        try {
            const upstream = await callOpenRouter(model, openRouterMessages);

            if (!upstream.ok || !upstream.body) {
                const errText = await upstream.text().catch(() => '');
                lastError = 'OpenRouter ' + upstream.status + ': ' + errText;
                continue;
            }

            const reader = upstream.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let gotAnyDelta = false;

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
                        send({ model, done: true });
                        res.end();
                        return;
                    }
                    try {
                        const obj = JSON.parse(payload);
                        const delta = obj.choices && obj.choices[0] && obj.choices[0].delta && obj.choices[0].delta.content;
                        if (delta) {
                            gotAnyDelta = true;
                            send({ delta });
                        }
                        if (obj.error) {
                            lastError = obj.error.message || JSON.stringify(obj.error);
                        }
                    } catch (_) {}
                }
            }

            if (gotAnyDelta) {
                send({ model, done: true });
                res.end();
                return;
            }
            lastError = 'No content from ' + model;
        } catch (err) {
            lastError = err.message || 'unknown';
        }
    }

    send({ error: lastError || 'All models failed' });
    res.end();
});

app.listen(PORT, () => {
    console.log('MCP Server running on port ' + PORT);
    console.log('Provider: OpenRouter');
    console.log('Models: ' + AI_MODELS.join(', '));
});
