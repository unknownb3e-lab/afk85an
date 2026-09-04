# 1. نستخدم نسخة Node.js الرسمية لبناء موقعك وسيلفبوت الديسكورد
FROM node:18

# 2. أمر لجعل سيرفر Railway يقوم بتثبيت برنامج Ollama داخله مباشرة
RUN curl -fsSL https://ollama.com | sh

# 3. نحدد مجلد العمل داخل السيرفر
WORKDIR /usr/src/app

# 4. ننسخ ملفات الحزم ونقوم بتثبيتها
COPY package*.json ./
RUN npm install

# 5. ننسخ باقي ملفات مشروعك بالكامل للسيرفر
COPY . .

# 6. نفتح المنافذ (بورت الموقع وبورت الـ AI الداخلي)
EXPOSE 8080
EXPOSE 11434

# 7. الأمر السحري: عند تشغيل Railway، يشتغل برنامج Ollama بالخلفية،
# ثم يقوم السيرفر بتحميل نموذج qwen2.5-coder:1.5b فوراً من إنترنت السيرفر، وبعدها يشغّل موقعك النود!
CMD ollama serve & sleep 5 && ollama pull qwen2.5-coder:1.5b && npm start
