# AGENTS.md — คู่มือนักพัฒนาและกฎระเบียบประจำโปรเจกต์ (Project Guidelines)

> **ตำแหน่งไฟล์:** `/home/boriphat/Projects/students/AGENTS.md`  
> ไฟล์นี้กำหนดมาตรฐานการทำงาน, เครื่องมือ (CLI/Tools), กฎการพัฒนา, และกระบวนการทดสอบสำหรับโปรเจกต์นี้โดยเฉพาะ

---

## 1. บทบาทและแนวทางการทำงาน (Developer Identity)
- **Role:** Senior Full-Stack Developer ร่วมเขียนโค้ดกับนักเรียนมัธยมปลาย
- **Mindset:** คิดแบบวิศวกรซอฟต์แวร์มืออาชีพที่ร่วมรับผิดชอบผลลัพธ์ เน้นความปลอดภัย ความเข้าใจง่าย และคุณภาพโค้ดระดับมาตรฐานสากล
- **ภาษาในการทำงาน:**
  - อธิบายและสรุปงานเป็น **ภาษาไทย** เสมอ
  - คำศัพท์เทคนิคเฉพาะทาง, คำสั่ง CLI, ชื่อตัวแปร, ชื่อฟังก์ชัน, ชื่อไฟล์ และ Config ให้คงเป็น **ภาษาอังกฤษ**
  - **Comment ในโค้ด:** เขียนภาษาไทยที่กระชับและตรงจุด อธิบายเหตุผลเบื้องหลัง (Why) ไม่ใช่แค่บรรยายสิ่งที่โค้ดทำ (What)

---

## 2. กฎการรันคำสั่งและความปลอดภัย (Command Execution & Safety)

### คำสั่งที่รันได้ทันที (Safe / Read-only)
- การอ่านไฟล์และโครงสร้าง: `ls`, `cat`, `git status`, `git diff`, `git log`
- การตรวจสอบ Lint / Typecheck / Build: `npm run lint`, `npx tsc --noEmit`, `npm run build`, `npm test`
- การติดตั้ง dependencies ที่ระบุชัดเจน: `npm install <package>`

### คำสั่งที่ต้องขอความเห็นชอบก่อนเสมอ (Destructive / Irreversible)
- คำสั่งลบไฟล์/โฟลเดอร์จำนวนมาก: `rm -rf`
- คำสั่ง Git ที่แก้ประวัติ: `git reset --hard`, `git push --force`, `git clean -fd`
- คำสั่งที่ส่งผลกระทบต่อฐานข้อมูลโดยไม่สามารถย้อนกลับได้: `DROP TABLE`, migration reset
- การแก้ไขหรือลบ environment secrets (`.env`)

---

## 3. มาตรฐาน Full-Responsive & UI/UX Standards

ระบบต้องรองรับหน้าจอทุกขนาดอย่างสมบูรณ์แบบ (Full-Responsive) ด้วยแนวคิด **Mobile-First Design**:

| อุปกรณ์ | ความกว้างหน้าจอ (Viewport) | จุดที่ต้องคำนึงถึงเป็นพิเศษ |
| :--- | :--- | :--- |
| **Mobile (Small)** | 320px – 390px (iPhone SE, iPhone 13/14) | Hamburger menu, touch target ขนาด ≥ 44x44px, ป้องกัน text overflow/horizontal scroll |
| **Mobile (Large)** | 390px – 430px (iPhone Pro Max, Android Large) | Layout จัดวาง 1 คอลัมน์ ไม่ล้นขอบจอ |
| **Tablet** | 768px – 1024px (iPad Mini, iPad Air) | ปรับเป็น 2 คอลัมน์ หรือ Sidebar แบบพับเก็บได้ (Collapsible Drawer) |
| **Desktop / Laptop** | 1280px – 1440px (MacBook, PC Standard) | Sidebar เต็มรูปแบบ, Dashboard Cards จัดวาง 3-4 คอลัมน์ |
| **Ultrawide / Large** | ≥ 1920px (FHD / 2K Monitors) | กำหนด `max-w-7xl` หรือ container ชัดเจน ไม่ให้ content ยืดจนอ่านยาก |

### ข้อกำหนดด้าน UI/UX:
1. **Zero Horizontal Overflow:** ห้ามมี horizontal scroll bar ที่ไม่ได้ตั้งใจในทุกขนาดหน้าจอ
2. **Accessibility (a11y):** ใช้ Semantic HTML (`<main>`, `<nav>`, `<header>`, `<button>`, `<section>`), รองรับ keyboard navigation, contrast ratio ผ่านเกณฑ์ WCAG AA
3. **Form Validation & Feedback:** ทุก Form ต้องมี validation ชัดเจน แสดง error message ภาษาไทยเข้าใจง่าย พร้อม loading state เมื่อกด submit

---

## 4. มาตรฐานการทดสอบด้วย Chrome DevTools MCP (Testing Protocol)

โปรเจกต์นี้ใช้ **Chrome DevTools MCP** ในการตรวจสอบและทดสอบเว็บอย่างเข้มงวดในทุกฟีเจอร์:

### เครื่องมือและขั้นตอนการเทส:
1. **Responsive Emulation:**
   - ใช้ `mcp_chrome-devtools_emulate` หรือ `resize_page` ในการสลับ viewport ทดสอบ:
     - Mobile: `390 x 844` (Device scale: 3, Mobile: true)
     - Tablet: `768 x 1024` (Device scale: 2)
     - Desktop: `1440 x 900`
2. **Visual Inspection & Layout Verification:**
   - ใช้ `take_screenshot` และ `take_snapshot` เพื่อตรวจ layout, visual bugs, misalignment
3. **Console & Error Zero-Tolerance:**
   - ใช้ `list_console_messages` ตรวจสอบ console log หลัง load หน้าจอ
   - **เกณฑ์ผ่าน:** ต้องไม่มี Uncaught Error, 404/500 API error หรือ React Hydration mismatch เด็ดขาด
4. **Network Inspection:**
   - ใช้ `list_network_requests` และ `get_network_request` ตรวจว่า API calls โหลดสำเร็จ, status 200/201, payload ถูกต้อง
5. **Lighthouse Quality Audit:**
   - ใช้ `lighthouse_audit` ตรวจวัด:
     - Performance ≥ 85
     - Accessibility ≥ 90
     - Best Practices ≥ 90
     - SEO ≥ 90

---

## 5. สภาพแวดล้อมและเครื่องมือที่ต้องใช้ (CLI & Tooling Ecosystem)

### System Environment
- **Node.js:** v26+ (รองรับ LTS และ modern ES features)
- **Package Manager:** `npm` (v12+)
- **TypeScript:** Strict mode เสมอ (`noImplicitAny`, `strictNullChecks`)
- **Git:** ติดตามทุกการเปลี่ยนแปลงด้วย Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`)

### CLI & Development Packages
- Development Server: `npm run dev`
- Type Checker: `npx tsc --noEmit`
- Linter & Formatter: ESLint + Prettier
- MCP Server: `chrome-devtools` (พร้อมใช้งานในระบบ)

---

## 6. โครงสร้างและแบบแผนเอกสาร (Documentation Structure)
- `AGENTS.md` (ไฟล์นี้): กฎ กติกา มาตรฐาน และแนวทางการพัฒนาสำหรับ Agent และนักพัฒนา
- `docs/requirements.md`: เอกสาร Requirement และขอบเขตฟังก์ชันทั้งหมดของระบบ (ได้จากการ Grill-me)
- `docs/architecture.md`: สถาปัตยกรรมระบบ, Data Flow, Database Schema, และ API Specifications
- `docs/testing-chrome-mcp.md`: เช็คลิสต์และคู่มือการเทสด้วย Chrome DevTools MCP
