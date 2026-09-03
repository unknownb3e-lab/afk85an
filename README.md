# هيكل المشروع (MCP AI Chat)

```
afk85an/
├── index.js              # بوت الديسكورد (النقطة الرئيسية)
├── keep_alive.js         # سيرفر لوحة التحكم + Dashboard (CommonJS)
├── package.json          # تبعيات البوت + لوحة التحكم
├── mcp-server/           # سيرفر MCP - يستدعي Google Gemini
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── web-client/           # مرجع: الواجهة المستقلة (نفس فكرة keep_alive.js)
    └── public/
```

**ملاحظة:** `web-client/` مرجع من مشروعك السابق، مش مرفوع على Railway.
الـ dashboard الفعلي هو `keep_alive.js` (لوحة التحكم النيون).

## معمارية AI

```
[المتصفح - لوحة التحكم]
        ↓ POST /api/ai-chat (SSE streaming)
[keep_alive.js - Railway Service 1]
        ↓ fetch + x-mcp-secret
[mcp-server - Railway Service 2]
        ↓ @google/genai SDK
[Google Gemini API (gemini-2.5-flash)]
```

## النشر على Railway

### 1. ارفع afk85an/ على GitHub

ارفع **كل محتويات `afk85an/`** (بما فيها `mcp-server/`) إلى GitHub.
**لا ترفع** `web-client/` أو `chatai/` (مراجع شخصية).

### 2. أنشئ سيرفرين على Railway من نفس الـ repo

#### الخدمة الأولى: Discord Bot + Dashboard
- **Root Directory:** `/` (أو اتركه فارغ)
- **Build Command:** `npm install`
- **Start Command:** `node index.js`
- **Variables:**
  - `DISCORD_TOKEN=...` (متغيرات البوت عندك)
  - `MCP_SERVER_URL=https://<service-2-name>.up.railway.app/api/chat`
  - `MCP_SECRET_KEY=<نفس المفتاح في الخدمة الثانية>

#### الخدمة الثانية: MCP Server
- **Root Directory:** `mcp-server`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Variables:**
  - `GEMINI_API_KEY=AIzaSy...`
  - `MCP_SECRET_KEY=<نفس المفتاح في الخدمة الأولى>`
  - `ALLOWED_ORIGIN=https://<service-1-name>.up.railway.app`
  - `GEMINI_TEXT_MODEL=gemini-2.5-flash`
  - `GEMINI_IMAGE_MODEL=gemini-2.5-flash-image`

### 3. اطلب مفتاح Gemini
- https://aistudio.google.com/apikey
- اضغط Create API Key، انسخه.

### 4. MCP_SECRET_KEY
- أي نص عشوائي 32+ حرف (مثلاً من `openssl rand -hex 32`).
- **نفس القيمة** في السيرفرين.

## اختبار محلي
```bash
# Terminal 1
cd mcp-server
cp .env.example .env
# عدّل القيم
npm install
npm start

# Terminal 2
# من المجلد الرئيسي
npm install
node keep_alive.js
# افتح http://localhost:8080
```
