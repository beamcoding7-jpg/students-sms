# คู่มือการ Deploy ระบบ SMS สู่ Vercel & Turso Cloud (Deployment Guide)

เอกสารนี้แนะนำขั้นตอนการ Deploy ระบบ **School & Student Management System (SMS)** ขึ้นบนคลาวด์จริงด้วย **Vercel** และ **Turso Database** (ฟรี 100%)

---

## 🏗️ ทำไมต้องใช้ Vercel + Turso?
- **Next.js บน Vercel:** แพลตฟอร์มอย่างเป็นทางการ รวดเร็วที่สุด มี Global Edge Network และฟรี Tier ไม่จำกัดเวลา
- **LibSQL / Turso Cloud:** ตัวระบบใช้ `@libsql/client` ซึ่งถูกสร้างโดยทีมงาน Turso โดยตรง สามารถย้ายจาก SQLite ในเครื่องขึ้น Cloud Database ได้ทันทีโดยไม่ต้องแก้ไขสกีมาหรือโค้ดแม้แต่บรรทัดเดียว!

---

## 🚀 ขั้นตอนการ Deploy (Step-by-Step)

### ขั้นตอนที่ 1: สร้าง Cloud Database บน Turso (ฟรี)
1. ไปที่ [turso.tech](https://turso.tech) และเข้าสู่ระบบด้วย GitHub
2. ติดตั้ง Turso CLI ในเครื่อง (หรือสร้างผ่านหน้า Web Dashboard):
   ```bash
   # ติดตั้ง Turso CLI
   curl -sSfL https://get.tur.so/install.sh | bash

   # เข้าสู่ระบบ
   turso auth login

   # สร้างฐานข้อมูลใหม่
   turso db create school-sms
   ```
3. นำข้อมูลจำลองจาก SQLite ในเครื่องขึ้น Turso:
   ```bash
   turso db shell school-sms < sqlite.db
   ```
4. ขอ URL และ Token เพื่อนำไปใส่ใน Vercel:
   ```bash
   # ดู Database URL
   turso db show school-sms --url
   # ผลลัพธ์จะได้ เช่น: libsql://school-sms-username.turso.io

   # สร้าง Auth Token
   turso db tokens create school-sms
   # ผลลัพธ์จะได้ Token ยาวๆ
   ```

---

### ขั้นตอนที่ 2: Deploy ขึ้น Vercel
1. ไปที่ [vercel.com](https://vercel.com) และเข้าสู่ระบบด้วย GitHub
2. กดปุ่ม **"Add New..."** -> **"Project"**
3. เลือก Repository `students-sms` จาก GitHub แล้วกด **"Import"**
4. ในส่วน **"Environment Variables"** ให้เพิ่ม 3 ตัวแปรดังนี้:
   | Key | Value | คำอธิบาย |
   | :--- | :--- | :--- |
   | `SESSION_SECRET` | *(พิมพ์สตริงสุ่มความปลอดภัย เช่น `super-secret-production-key`)* | คีย์สำหรับเข้ารหัส Session Cookie |
   | `TURSO_DATABASE_URL` | `libsql://school-sms-username.turso.io` | URL จากขั้นตอนที่ 1 |
   | `TURSO_AUTH_TOKEN` | *(โทเค็นจากขั้นตอนที่ 1)* | Token สำหรับเชื่อมต่อฐานข้อมูล |
5. กดปุ่ม **"Deploy"**
6. รอประมาณ 1-2 นาที Vercel จะคอมไพล์และมอบโดเมนให้ทันที เช่น:  
   👉 `https://students-sms.vercel.app`

---

## 🔒 ข้อมูลบัญชีเริ่มต้นสำหรับทดสอบหลัง Deploy
- **ผู้ดูแลระบบ (Admin):** `admin@school.ac.th` / `password123`
- **คุณครู (Teacher):** `somchai.t@school.ac.th` / `password123`
- **นักเรียน (Student):** `somying.s@school.ac.th` / `password123`
*(หลังจาก Login ครั้งแรก แนะนำให้ไปที่มุมขวาบนเพื่อเปลี่ยนรหัสผ่านทันที)*
