# 1. نستخدم نسخة Node.js الرسمية والمستقرة لبناء موقعك
FROM node:18

# 2. تحديث الحزم وتثبيت أداة zstd المطلوبة لفك ضغط Ollama تلقائياً
RUN apt-get update && apt-get install -y zstd curl

# 3. السكربت الصحيح لتثبيت أولاما بعد توفير أداة فك الضغط
RUN curl -fsSL https://ollama.com/install.sh | sh

# 4. نحدد مجلد العمل داخل السيرفر
WORKDIR /usr/src/app

# 5. ننسخ ملفات الحزم ونقوم بتثبيتها
COPY package*.json ./
RUN npm install

# 6. ننسخ باقي ملفات مشروعك بالكامل للسيرفر
COPY . .

# 7. نفتح المنافذ (بورت الموقع وبورت الـ AI الداخلي)
EXPOSE 8080
EXPOSE 11434

# 8. تشغيل أولاما بالخلفية، سحب الموديل مجاناً، ثم تشغيل الموقع عبر باقة السيرفر
# تشغيل موقعك أولاً فوراً لفتح اللوحة، وتشغيل أولاما وتحميل الموديل بالخلفية بالتوازي
CMD ["sh", "-c", "npm start & ollama serve & sleep 7 && ollama pull qwen2.5-coder:0.5b"]


