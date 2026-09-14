# สถาปัตยกรรมระบบและฐานข้อมูล (System Architecture & Database Design)

> **ระบบ:** ระบบบริหารจัดการสถานศึกษาและข้อมูลนักเรียนแบบครบวงจร (School & Student Management System - SMS)  
> **ฐานข้อมูล:** SQLite ผ่าน Drizzle ORM

---

## 1. แผนภาพสถาปัตยกรรมระบบ (System Architecture Diagram)

```mermaid
flowchart TD
    Client["Client Devices\n(Mobile / Tablet / Desktop)"]
    
    subgraph Frontend["Next.js App Router (Frontend)"]
        UI["UI Components (Tailwind CSS + Radix UI)"]
        State["Theme & Client State (next-themes)"]
        MW["Middleware (Auth & Role Protection)"]
    end
    
    subgraph Backend["Next.js Server Layer (Backend)"]
        SA["Server Actions & API Routes"]
        Auth["Auth Service (bcrypt + Session Cookies)"]
        Val["Zod Validation Layer"]
        ORM["Drizzle ORM"]
    end
    
    subgraph Storage["Data Persistence"]
        DB[("SQLite Database (sqlite.db)")]
        Seed["Seed Data Script (seed.ts)"]
    end
    
    subgraph QualityAssurance["Quality Assurance Layer"]
        MCP["Chrome DevTools MCP\n(Emulate, Screenshot, Console, Lighthouse)"]
    end

    Client -->|HTTP / HTTPS| MW
    MW --> UI
    UI -->|Invoke Action / API| Val
    Val --> SA
    SA --> Auth
    SA --> ORM
    ORM --> DB
    Seed -.->|Pre-populate| DB
    MCP -.->|Inspect & Audit| Client
```

---

## 2. แผนผังความสัมพันธ์ของข้อมูล (Entity-Relationship Diagram)

```mermaid
erDiagram
    USERS ||--o| TEACHERS : "has profile"
    USERS ||--o| STUDENTS : "has profile"
    USERS ||--o{ ANNOUNCEMENTS : "authors"
    TEACHERS ||--o{ COURSES : "teaches"
    TEACHERS ||--o{ ASSIGNMENTS : "creates"
    COURSES ||--o{ ENROLLMENTS : "contains"
    STUDENTS ||--o{ ENROLLMENTS : "enrolls in"
    STUDENTS ||--o{ ATTENDANCE : "has records"
    STUDENTS ||--o{ GRADES : "receives"
    COURSES ||--o{ GRADES : "evaluates"
    COURSES ||--o{ SCHEDULES : "scheduled at"
    COURSES ||--o{ ASSIGNMENTS : "assigns"
    ASSIGNMENTS ||--o{ SUBMISSIONS : "receives"
    STUDENTS ||--o{ SUBMISSIONS : "submits"

    USERS {
        string id PK
        string email UK
        string password_hash
        string role "admin | teacher | student"
        string full_name
        string avatar_url
        datetime created_at
    }

    TEACHERS {
        string id PK
        string user_id FK
        string department
        string phone
        string room_advisor "เช่น ม.4/1"
    }

    STUDENTS {
        string id PK
        string user_id FK
        string student_code UK "เช่น STU-1001"
        string national_id
        string grade_level "เช่น ม.4"
        string classroom "เช่น ห้อง 1"
        date date_of_birth
        string parent_name
        string parent_phone
    }

    COURSES {
        string id PK
        string course_code UK "เช่น ว31101"
        string course_name "เช่น วิทยาการคำนวณ 1"
        int credits "หน่วยกิต"
        string teacher_id FK
        string grade_level "ม.4"
        int semester "1 หรือ 2"
        string academic_year "2569"
    }

    ENROLLMENTS {
        string id PK
        string student_id FK
        string course_id FK
    }

    ATTENDANCE {
        string id PK
        string student_id FK
        date date
        string status "present | late | absent | leave"
        string remarks
        string marked_by FK
    }

    GRADES {
        string id PK
        string student_id FK
        string course_id FK
        float homework_score
        float midterm_score
        float final_score
        float total_score
        string grade_letter "4.0, 3.5, 3.0, ..."
    }

    SCHEDULES {
        string id PK
        string course_id FK
        string classroom "เช่น ม.4/1"
        string day_of_week "Monday - Friday"
        string start_time "08:30"
        string end_time "10:10"
        string room_number "เช่น ห้องปฏิบัติการคอมพิวเตอร์ 1"
    }

    ANNOUNCEMENTS {
        string id PK
        string title
        string content
        string category "academic | activity | general | urgent"
        string author_id FK
        string target_role "all | teacher | student"
        boolean is_pinned
        datetime created_at
    }

    ASSIGNMENTS {
        string id PK
        string course_id FK
        string title
        string description
        datetime due_date
        float max_score
        string created_by FK
        datetime created_at
    }

    SUBMISSIONS {
        string id PK
        string assignment_id FK
        string student_id FK
        string content
        string file_url
        float score
        string feedback
        string status "pending | submitted | graded | late"
        datetime submitted_at
    }
```

---

## 3. รายละเอียดตารางฐานข้อมูล (Database Tables Schema)

### 3.1 ตาราง `users`
- เก็บบัญชีผู้ใช้งานหลักทุก Role สำหรับ Login
- `id` (TEXT, PK, UUIDv4 หรือ nanoid)
- `email` (TEXT, UNIQUE, NOT NULL)
- `password_hash` (TEXT, NOT NULL)
- `role` (TEXT, NOT NULL) — ค่าที่เป็นไปได้: `'admin'`, `'teacher'`, `'student'`
- `full_name` (TEXT, NOT NULL) — ชื่อ-นามสกุล ภาษาไทย
- `avatar_url` (TEXT)
- `created_at` (INTEGER / TIMESTAMP)

### 3.2 ตาราง `teachers`
- ข้อมูลจำเพาะสำหรับคุณครู
- `id` (TEXT, PK)
- `user_id` (TEXT, FK -> users.id, UNIQUE)
- `department` (TEXT) — กลุ่มสาระการเรียนรู้ (เช่น วิทยาศาสตร์และเทคโนโลยี, ภาษาไทย, คณิตศาสตร์)
- `phone` (TEXT)
- `room_advisor` (TEXT) — ชั้นเรียนประจำห้อง (เช่น "ม.4/1")

### 3.3 ตาราง `students`
- ข้อมูลจำเพาะสำหรับนักเรียน
- `id` (TEXT, PK)
- `user_id` (TEXT, FK -> users.id, UNIQUE)
- `student_code` (TEXT, UNIQUE, NOT NULL) — รหัสประจำตัวนักเรียน 5 หลัก
- `national_id` (TEXT) — รหัสบัตรประชาชน (Masked)
- `grade_level` (TEXT, NOT NULL) — ระดับชั้น เช่น "ม.4"
- `classroom` (TEXT, NOT NULL) — ห้องเรียน เช่น "ห้อง 1"
- `date_of_birth` (TEXT)
- `parent_name` (TEXT)
- `parent_phone` (TEXT)

### 3.4 ตาราง `courses`
- ข้อมูลรายวิชา
- `id` (TEXT, PK)
- `course_code` (TEXT, UNIQUE) — เช่น "ว31101", "ค31101"
- `course_name` (TEXT) — เช่น "วิทยาการคำนวณ 1", "คณิตศาสตร์พื้นฐาน"
- `credits` (REAL) — หน่วยกิต (เช่น 1.0, 1.5)
- `teacher_id` (TEXT, FK -> teachers.id)
- `grade_level` (TEXT)
- `semester` (INTEGER)
- `academic_year` (TEXT)

### 3.5 ตาราง `attendance`
- ข้อมูลบันทึกการเข้าเรียนรายวัน
- `id` (TEXT, PK)
- `student_id` (TEXT, FK -> students.id)
- `date` (TEXT) — รูปแบบ `YYYY-MM-DD`
- `status` (TEXT) — `'present'`, `'late'`, `'absent'`, `'leave'`
- `remarks` (TEXT)
- `marked_by` (TEXT, FK -> users.id)

### 3.6 ตาราง `grades`
- ผลการเรียนและคะแนนเก็บ
- `id` (TEXT, PK)
- `student_id` (TEXT, FK -> students.id)
- `course_id` (TEXT, FK -> courses.id)
- `homework_score` (REAL)
- `midterm_score` (REAL)
- `final_score` (REAL)
- `total_score` (REAL)
- `grade_letter` (TEXT) — "4.0", "3.5", ..., "0"

### 3.7 ตาราง `schedules`
- ตารางเรียน / ตารางสอนประจำสัปดาห์
- `id` (TEXT, PK)
- `course_id` (TEXT, FK -> courses.id)
- `classroom` (TEXT) — เช่น "ม.4/1"
- `day_of_week` (TEXT) — "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์"
- `start_time` (TEXT) — เช่น "08:30"
- `end_time` (TEXT) — เช่น "10:10"
- `room_number` (TEXT) — เช่น "อาคาร 3 ห้อง 321"

### 3.8 ตาราง `announcements`
- ข่าวสารและประกาศของโรงเรียน
- `id` (TEXT, PK)
- `title` (TEXT, NOT NULL)
- `content` (TEXT, NOT NULL)
- `category` (TEXT) — `'academic'`, `'activity'`, `'general'`, `'urgent'`
- `author_id` (TEXT, FK -> users.id)
- `target_role` (TEXT) — `'all'`, `'teacher'`, `'student'`
- `is_pinned` (INTEGER, 0 หรือ 1)
- `created_at` (INTEGER / TIMESTAMP)

### 3.9 ตาราง `assignments` และ `submissions`
- งานที่มอบหมายและการส่งงาน
- มีความสัมพันธ์เชื่อมโยงกับรายวิชา ครูผู้สร้าง และนักเรียนที่ส่งงาน

---

## 4. โครงสร้างโฟลเดอร์ที่แนะนำ (Project Directory Structure)

```
students/
├── AGENTS.md                  # กฎการทำงานและมาตรฐานสำหรับ Agent & นักพัฒนา
├── GEMINI.md                  # ลิงก์อ้างอิงระดับโปรเจกต์
├── docs/                      # เอกสารสถาปัตยกรรมและ Requirements
│   ├── requirements.md        # ข้อกำหนดระบบทั้งหมด
│   ├── architecture.md        # แผนภาพสถาปัตยกรรมและ Schema
│   ├── testing-chrome-mcp.md  # คู่มือการทดสอบด้วย Chrome DevTools MCP
│   └── tools-and-setup.md     # คู่มือเครื่องมือและสภาพแวดล้อม
├── src/
│   ├── app/                   # Next.js App Router (Pages, Layouts, API)
│   │   ├── (auth)/login/      # หน้าเข้าสู่ระบบ
│   │   ├── (dashboard)/       # พื้นที่ Dashboard ที่มีการป้องกันสิทธิ์
│   │   │   ├── admin/         # หน้าสำหรับ Admin
│   │   │   ├── teacher/       # หน้าสำหรับ คุณครู
│   │   │   └── student/       # หน้าสำหรับ นักเรียน
│   │   ├── api/               # API Routes (ถ้ามี)
│   │   ├── layout.tsx         # Root Layout พร้อม Theme Provider
│   │   └── page.tsx           # Landing Page & Quick Entry
│   ├── components/            # Reusable React Components
│   │   ├── ui/                # Base UI (Button, Card, Dialog, Table, Badge, Form)
│   │   ├── layout/            # Sidebar, Topbar, BottomNav, MobileDrawer
│   │   ├── attendance/        # Quick Checklist, Attendance Chart
│   │   ├── gradebook/         # Score Input Table, Transcript View
│   │   └── shared/            # ThemeToggle, UserAvatar, ConfirmDialog
│   ├── lib/                   # Utility Libraries
│   │   ├── db/                # Drizzle ORM client, schema definitions
│   │   │   ├── schema.ts      # ตารางข้อมูลทั้งหมด
│   │   │   └── index.ts       # Database connection instance
│   │   ├── auth.ts            # Session validation, cookie handling, password verify
│   │   └── utils.ts           # Helper functions (date formatting, grade calculator)
│   └── seed/                  # Seed Script
│       └── seed.ts            # ข้อมูลตั้งต้นสมจริง (Admin, ครู 5 คน, นร 25 คน, วิชา, เกรด)
├── drizzle.config.ts          # Drizzle ORM Configuration
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```
