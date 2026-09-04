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

# 7. تحميل الموديل الخفيف أثناء البناء
RUN ollama serve & sleep 5 && ollama pull qwen2.5-coder:0.5b

# 7.1 ضبط إعدادات أولاما الافتراضية لتعمل بكفاءة على سيرفرات محدودة الموارد
ENV OLLAMA_NUM_PARALLEL=1
ENV OLLAMA_MAX_LOADED_MODELS=1
ENV OLLAMA_KEEP_ALIVE=5m

# 8. نفتح المنافذ
EXPOSE 8080
EXPOSE 11434

# 9. أمر التشغيل: نشغل أولاما بالخلفية، نستنى لحد ما يجهز، ثم نشغل الموقع
CMD ["sh", "-c", "ollama serve & OLLAMA_PID=$!; echo '⏳ في انتظار جاهزية أولاما...'; until curl -s http://127.0.0.1:11434/api/tags > /dev/null 2>&1; do sleep 3; done; echo '✅ أولاما جاهز'; npm start"]
