# هيكل المشروع (Discord AFK Selfbot + AI Chat)

```
afk85an/
├── index.js              # بوت الديسكورد (النقطة الرئيسية)
├── keep_alive.js         # سيرفر لوحة التحكم + Dashboard (CommonJS)
├── package.json          # تبعيات البوت + لوحة التحكم
├── mcp-server/           # سيرفر MCP - يستدعي OpenRouter (متعدد النماذج)
│   ├── server.js
│   ├── package.json
│   └── .env.example
```

**ملاحظة:** المجلدات `web-client/` و `chatai/` مراجع شخصية قديمة — لا ترفعها على Railway.

## معمارية AI

```
[المتصفح - لوحة التحكم]
        ↓ POST /api/ai-chat (SSE streaming)
[keep_alive.js - Railway Service 1]
        ↓ fetch + x-mcp-secret
[mcp-server - Railway Service 2]
        ↓ OpenRouter API
[Multiple Free Models - fallback تلقائي]
```

**ليش OpenRouter؟** بسبب قيود الوصول لـ Google Gemini في بعض الدول، المشروع يستخدم OpenRouter اللي يجمع عدة نماذج مجانية ويعمل fallback تلقائي بينهم.

## النشر على Railway

### 1. ارفع afk85an/ على GitHub
ارفع **كل محتويات `afk85an/`** (بما فيها `mcp-server/`) إلى GitHub.

### 2. أنشئ سيرفرين على Railway من نفس الـ repo

#### الخدمة الأولى: Discord Bot + Dashboard
- **Root Directory:** `/` (اتركه فارغ)
- **Build Command:** `npm install`
- **Start Command:** `node index.js`
- **Variables:**
  - `token=...` (توكن حسابك - بدون DISCORD_ prefix)
  - `GUILD_ID=...`
  - `AFK_CHANNEL_ID=...`
  - `TARGET_GUILD_ID=...`
  - `MCP_SERVER_URL=https://<service-2-name>.up.railway.app/api/chat`
  - `MCP_SECRET_KEY=<نفس المفتاح في الخدمة الثانية>`
  - `PORT=8080`

#### الخدمة الثانية: MCP Server (OpenRouter)
- **Root Directory:** `mcp-server`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Variables:**
  - `OPENROUTER_API_KEY=sk-or-v1-...`
  - `MCP_SECRET_KEY=<نفس المفتاح في الخدمة الأولى>`
  - `ALLOWED_ORIGIN=https://<service-1-name>.up.railway.app`
  - `AI_MODELS=z-ai/glm-5.2:free,google/gemma-4-31b-it:free,minimax/minimax-m2.7:free,minimax/minimax-m3:free`
  - `PORT=3001`

### 3. اطلب مفتاح OpenRouter
- https://openrouter.ai/keys
- أنشئ API Key جديد وانسخه.

### 4. MCP_SECRET_KEY
- أي نص عشوائي 32+ حرف (مثلاً من `openssl rand -hex 32`).
- **نفس القيمة بالضبط** في السيرفرين.

## اختبار محلي
```bash
# Terminal 1 - MCP Server
cd mcp-server
cp .env.example .env
# عدّل القيم
npm install
npm start

# Terminal 2 - Dashboard + Bot
# من المجلد الرئيسي
npm install
node keep_alive.js
# افتح http://localhost:8080

# Terminal 3 - تشغيل البوت (اختياري للاختبار الكامل)
# عدّل token في .env أو bot_config.json
node index.js
```

## ملاحظات تقنية

- **Rate Limiting:** البوت يستخدم throttle 5 ثواني بين الرسائل + حماية تلقائية ضد 429 من Discord.
- **AI Fallback:** لو نموذج فشل، MCP server يجرب النموذج التالي تلقائياً.
- **Security:** MCP يستخدم `crypto.timingSafeEqual` للتحقق من المفتاح.
- **⚠️ تحذير:** استخدام selfbot يخالف شروط Discord - استخدم على مسؤوليتك.
