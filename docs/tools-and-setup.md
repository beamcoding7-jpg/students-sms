# เครื่องมือและขั้นตอนการเตรียมสภาพแวดล้อม (Tools & Setup Guide)

เอกสารนี้รวบรวมเครื่องมือ (CLI & Tools) สภาพแวดล้อม และ Skills ที่เกี่ยวข้องกับโปรเจกต์นี้

---

## 1. ข้อมูลสภาพแวดล้อมปัจจุบัน (Current Environment)
- **ระบบปฏิบัติการ:** Linux (x86_64 / Ubuntu)
- **Node.js:** v26.8.2 (ติดตั้งเรียบร้อย)
- **NPM:** v12.0.2 (ติดตั้งเรียบร้อย)
- **Python:** 3.14.7 (ติดตั้งเรียบร้อย)
- **Git:** 2.55.0 (Initialized เรียบร้อย)

---

## 2. MCP Tools ที่ติดตั้งและพร้อมใช้งาน
- **`chrome-devtools`:** เครื่องมือควบคุม Google Chrome สำหรับการทดสอบ UI, Responsive, Console log, Network inspection, และ Lighthouse audit
- **`playwright`:** เครื่องมือ E2E browser automation สำหรับการทดสอบอัตโนมัติ
- **`github`:** เครื่องมือจัดการ Git commits, branches, PRs และ repositories
- **`context7`:** เครื่องมือสืบค้น Documentation ของ libraries ต่างๆ

---

## 3. Skills ที่รองรับในระบบ
- **`brainstorming`:** การออกแบบและรวบรวม Requirement อย่างเป็นขั้นตอนก่อนเริ่มลงมือเขียนโค้ด
- **`systematic-debugging`:** การดีบักและแก้ไขปัญหาอย่างเป็นระบบเมื่อพบข้อผิดพลาด
- **`test-driven-development`:** แนวทางการเขียนชุดทดสอบก่อนและระหว่างพัฒนาฟีเจอร์
- **`verification-before-completion`:** การตรวจสอบความถูกต้องก่อนสรุปผลงาน

---

## 4. แนะนำชุดเครื่องมือสำหรับ Full-Stack Web Development
เมื่อเริ่มสร้างโปรเจกต์ จะเลือกใช้เครื่องมือมาตรฐานดังนี้:
1. **Frontend & Backend Framework:** Next.js (App Router) ด้วย TypeScript เพื่อความรวดเร็ว Type safety และรองรับทั้ง Server Actions และ API Routes
2. **Styling & UI Components:** Tailwind CSS + Lucide Icons + Radix UI / shadcn/ui รองรับ Responsive และ Dark/Light Mode ได้ง่ายและสวยงาม
3. **Database & ORM:** SQLite / PostgreSQL พร้อม Drizzle ORM หรือ Prisma เพื่อการเข้าถึงข้อมูลแบบ Type-safe
4. **Validation:** Zod สำหรับ Schema validation ทั้งฝั่ง Client และ Server
