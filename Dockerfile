# 1_ نستخدم نسخة Node_js الرسمية والمستقرة لبناء موقعك
FROM node:18

# 2_ السكربت الصحيح لتثبيت أولاما تلقائياً مع تعديل الرابط ليكون واضحاً لك
RUN curl -fsSL https://ollama.com/install.sh | sh

# 3_ نحدد مجلد العمل داخل السيرفر
WORKDIR /usr/src/app

# 4_ ننسخ ملفات الحزم ونقوم بتثبيتها
COPY package*.json ./
RUN npm install

# 5_ ننسخ باقي ملفات مشروعك بالكامل للسيرفر
COPY . .

# 6_ نفتح المنافذ (بورت الموقع وبورت الـ AI الداخلي)
EXPOSE 8080
EXPOSE 11434

# 7_ الأمر السحري لتشغيل أولاما وسحب الموديل ثم تشغيل الباك إيند والموقع
CMD ollama serve & sleep 5 && ollama pull qwen2.5-coder:1.5b && npm start
