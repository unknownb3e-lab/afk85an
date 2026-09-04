# 1. نستخدم نسخة Node.js الرسمية والمستقرة
FROM node:18

# 2. تحديث الحزم وتثبيت أداة zstd المطلوبة لفك ضغط Ollama
RUN apt-get update && apt-get install -y zstd curl

# 3. تثبيت برنامج أولاما داخل الحاوية بالمسار الصحيح الكامل
RUN curl -fsSL https://ollama.com/install.sh | sh

# 4. نحدد مجلد العمل
WORKDIR /usr/src/app

# 5. ننسخ ملفات الحزم ونقوم بتثبيتها
COPY package*.json ./
RUN npm install

# 6. ننسخ باقي ملفات مشروعك
COPY . .

# 7. تحميل الموديل الخفيف أثناء البناء لحماية المعالج عند التشغيل
RUN ollama serve & sleep 5 && ollama pull qwen2.5-coder:0.5b

# 8. نفتح المنافذ
EXPOSE 8080
EXPOSE 11434

# 9. أمر التشغيل الصافي والسريع جداً لموقعك وأولاما بالتوازي
CMD ["sh", "-c", "ollama serve & npm start"]
