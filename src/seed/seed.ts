import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";
import path from "path";

const dbPath = path.resolve(process.cwd(), "sqlite.db");
const client = createClient({
  url: `file:${dbPath}`,
});

async function seed() {
  console.log("🌱 เริ่มต้นสร้างตารางฐานข้อมูล SQLite และ Seed Data...");

  // สร้างตารางทั้งหมด (DDL)
  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'teacher', 'student')),
      full_name TEXT NOT NULL,
      avatar_url TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS teachers (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      department TEXT NOT NULL,
      phone TEXT,
      room_advisor TEXT
    );

    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      student_code TEXT NOT NULL UNIQUE,
      national_id TEXT,
      grade_level TEXT NOT NULL,
      classroom TEXT NOT NULL,
      date_of_birth TEXT,
      parent_name TEXT,
      parent_phone TEXT
    );

    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      course_code TEXT NOT NULL UNIQUE,
      course_name TEXT NOT NULL,
      credits REAL NOT NULL,
      teacher_id TEXT REFERENCES teachers(id),
      grade_level TEXT NOT NULL,
      semester INTEGER NOT NULL,
      academic_year TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS enrollments (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('present', 'late', 'absent', 'leave')),
      remarks TEXT,
      marked_by TEXT REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS grades (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      homework_score REAL NOT NULL DEFAULT 0,
      midterm_score REAL NOT NULL DEFAULT 0,
      final_score REAL NOT NULL DEFAULT 0,
      total_score REAL NOT NULL DEFAULT 0,
      grade_letter TEXT NOT NULL DEFAULT '0'
    );

    CREATE TABLE IF NOT EXISTS schedules (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      classroom TEXT NOT NULL,
      day_of_week TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      room_number TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('academic', 'activity', 'general', 'urgent')),
      author_id TEXT NOT NULL REFERENCES users(id),
      target_role TEXT NOT NULL CHECK(target_role IN ('all', 'teacher', 'student')),
      is_pinned INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS assignments (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      due_date TEXT NOT NULL,
      max_score REAL NOT NULL DEFAULT 10,
      created_by TEXT NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      assignment_id TEXT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
      student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      content TEXT,
      file_url TEXT,
      score REAL,
      feedback TEXT,
      status TEXT NOT NULL CHECK(status IN ('pending', 'submitted', 'graded', 'late')),
      submitted_at TEXT NOT NULL
    );

    DELETE FROM submissions;
    DELETE FROM assignments;
    DELETE FROM announcements;
    DELETE FROM schedules;
    DELETE FROM grades;
    DELETE FROM attendance;
    DELETE FROM enrollments;
    DELETE FROM courses;
    DELETE FROM students;
    DELETE FROM teachers;
    DELETE FROM users;
  `);

  console.log("🔒 กำลังทำการ Hash รหัสผ่านสำหรับบัญชีผู้ใช้เริ่มต้น...");
  const defaultPasswordHash = await bcrypt.hash("password123", 10);
  const now = new Date().toISOString();

  // 1. เพิ่มผู้ใช้งาน Super Admin
  await client.execute({
    sql: "INSERT INTO users (id, email, password_hash, role, full_name, avatar_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    args: ["usr_admin_1", "admin@school.ac.th", defaultPasswordHash, "admin", "ดร.วิชัย ศรีสวัสดิ์ (ผู้ดูแลระบบ)", "/avatars/admin.png", now],
  });

  // 2. เพิ่มคุณครู 5 ท่าน
  const teachersData = [
    { id: "tch_1", userId: "usr_tch_1", email: "somchai.t@school.ac.th", name: "อ.สมชาย ทองดี", dept: "วิทยาศาสตร์และเทคโนโลยี", phone: "081-234-5671", room: "ม.4/1" },
    { id: "tch_2", userId: "usr_tch_2", email: "wipha.k@school.ac.th", name: "อ.วิภา กลิ่นสุคนธ์", dept: "ภาษาไทย", phone: "081-234-5672", room: "ม.4/2" },
    { id: "tch_3", userId: "usr_tch_3", email: "theerapol.m@school.ac.th", name: "อ.ธีรพล มีชัย", dept: "คณิตศาสตร์", phone: "081-234-5673", room: "ม.5/1" },
    { id: "tch_4", userId: "usr_tch_4", email: "orathai.p@school.ac.th", name: "อ.อรทัย พรมหมดี", dept: "ภาษาต่างประเทศ", phone: "081-234-5674", room: "ม.5/2" },
    { id: "tch_5", userId: "usr_tch_5", email: "prasert.s@school.ac.th", name: "อ.ประเสริฐ สุขสวัสดิ์", dept: "สังคมศึกษา ศาสนา และวัฒนธรรม", phone: "081-234-5675", room: "ม.6/1" },
  ];

  for (const t of teachersData) {
    await client.execute({
      sql: "INSERT INTO users (id, email, password_hash, role, full_name, avatar_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: [t.userId, t.email, defaultPasswordHash, "teacher", t.name, null, now],
    });
    await client.execute({
      sql: "INSERT INTO teachers (id, user_id, department, phone, room_advisor) VALUES (?, ?, ?, ?, ?)",
      args: [t.id, t.userId, t.dept, t.phone, t.room],
    });
  }

  // 3. เพิ่มนักเรียน 25 คน
  const studentNames = [
    // ม.4/1 (10 คน)
    { code: "STU-1001", name: "น.ส.สมหญิง สดใส", email: "somying.s@school.ac.th", grade: "ม.4", room: "1", parent: "นายสุรชัย สดใส", pPhone: "089-111-2201" },
    { code: "STU-1002", name: "นายสมศักดิ์ ภักดี", email: "somsak.p@school.ac.th", grade: "ม.4", room: "1", parent: "นางสมพร ภักดี", pPhone: "089-111-2202" },
    { code: "STU-1003", name: "น.ส.กานดา รักษ์ดี", email: "kanda.r@school.ac.th", grade: "ม.4", room: "1", parent: "นายกมล รักษ์ดี", pPhone: "089-111-2203" },
    { code: "STU-1004", name: "นายชานนท์ ทรงเกียรติ", email: "chanon.t@school.ac.th", grade: "ม.4", room: "1", parent: "นางชลธิชา ทรงเกียรติ", pPhone: "089-111-2204" },
    { code: "STU-1005", name: "น.ส.ณัฐธิดา วงศ์สว่าง", email: "natthida.w@school.ac.th", grade: "ม.4", room: "1", parent: "นายณรงค์ วงศ์สว่าง", pPhone: "089-111-2205" },
    { code: "STU-1006", name: "นายธนกฤต ประเสริฐยิ่ง", email: "thanakrit.p@school.ac.th", grade: "ม.4", room: "1", parent: "นายธนากร ประเสริฐยิ่ง", pPhone: "089-111-2206" },
    { code: "STU-1007", name: "น.ส.ปวีณา บุญมี", email: "paweena.b@school.ac.th", grade: "ม.4", room: "1", parent: "นางปนัดดา บุญมี", pPhone: "089-111-2207" },
    { code: "STU-1008", name: "นายพงศกร สว่างเนตร", email: "pongsakorn.s@school.ac.th", grade: "ม.4", room: "1", parent: "นายพิชัย สว่างเนตร", pPhone: "089-111-2208" },
    { code: "STU-1009", name: "น.ส.วรัญญา แก้วมณี", email: "waranya.k@school.ac.th", grade: "ม.4", room: "1", parent: "นางวารินทร์ แก้วมณี", pPhone: "089-111-2209" },
    { code: "STU-1010", name: "นายอัครเดช รุ่งเรือง", email: "akkaradet.r@school.ac.th", grade: "ม.4", room: "1", parent: "นายอนุสรณ์ รุ่งเรือง", pPhone: "089-111-2210" },

    // ม.4/2 (8 คน)
    { code: "STU-1011", name: "น.ส.ชลธิชา ใจดี", email: "cholticha.j@school.ac.th", grade: "ม.4", room: "2", parent: "นายชาติชาย ใจดี", pPhone: "089-222-3301" },
    { code: "STU-1012", name: "นายธีรวัฒน์ มุ่งมั่น", email: "theerawat.m@school.ac.th", grade: "ม.4", room: "2", parent: "นางธาริณี มุ่งมั่น", pPhone: "089-222-3302" },
    { code: "STU-1013", name: "น.ส.พิมพ์มาดา งามยิ่ง", email: "pimmada.n@school.ac.th", grade: "ม.4", room: "2", parent: "นายพิสุทธิ์ งามยิ่ง", pPhone: "089-222-3303" },
    { code: "STU-1014", name: "นายภานุวัฒน์ แสงสุริยา", email: "panuwat.s@school.ac.th", grade: "ม.4", room: "2", parent: "นางภาวินี แสงสุริยา", pPhone: "089-222-3304" },
    { code: "STU-1015", name: "น.ส.รตา เลิศวิมล", email: "rata.l@school.ac.th", grade: "ม.4", room: "2", parent: "นายรัชพล เลิศวิมล", pPhone: "089-222-3305" },
    { code: "STU-1016", name: "นายศุภกร เจริญผล", email: "supakorn.c@school.ac.th", grade: "ม.4", room: "2", parent: "นางศศิธร เจริญผล", pPhone: "089-222-3306" },
    { code: "STU-1017", name: "น.ส.อารียา ปรีดา", email: "areeya.p@school.ac.th", grade: "ม.4", room: "2", parent: "นายอิทธิ ปรีดา", pPhone: "089-222-3307" },
    { code: "STU-1018", name: "นายเอกภาพ ชัยชนะ", email: "ekkapap.c@school.ac.th", grade: "ม.4", room: "2", parent: "นายเอกชัย ชัยชนะ", pPhone: "089-222-3308" },

    // ม.5/1 (7 คน)
    { code: "STU-2001", name: "น.ส.กัญญารัตน์ เพชรดี", email: "kanyarat.p@school.ac.th", grade: "ม.5", room: "1", parent: "นางกานดา เพชรดี", pPhone: "089-333-4401" },
    { code: "STU-2002", name: "นายจิรภัทร ชาญวิทย์", email: "jiraphat.c@school.ac.th", grade: "ม.5", room: "1", parent: "นายเจริญ ชาญวิทย์", pPhone: "089-333-4402" },
    { code: "STU-2003", name: "น.ส.ดวงกมล แสนสุข", email: "duangkamol.s@school.ac.th", grade: "ม.5", room: "1", parent: "นางดารณี แสนสุข", pPhone: "089-333-4403" },
    { code: "STU-2004", name: "นายทินกร มั่นคง", email: "tinnakorn.m@school.ac.th", grade: "ม.5", room: "1", parent: "นายทวิช มั่นคง", pPhone: "089-333-4404" },
    { code: "STU-2005", name: "น.ส.นภัสสร อุดมสุข", email: "napatsorn.u@school.ac.th", grade: "ม.5", room: "1", parent: "นางนภาพร อุดมสุข", pPhone: "089-333-4405" },
    { code: "STU-2006", name: "นายปิยะวัฒน์ เจริญสุข", email: "piyawat.c@school.ac.th", grade: "ม.5", room: "1", parent: "นายปัญญา เจริญสุข", pPhone: "089-333-4406" },
    { code: "STU-2007", name: "น.ส.มณฑิรา งามสง่า", email: "monthira.n@school.ac.th", grade: "ม.5", room: "1", parent: "นางมนตรา งามสง่า", pPhone: "089-333-4407" },
  ];

  const studentIdMap: string[] = [];
  for (let idx = 0; idx < studentNames.length; idx++) {
    const s = studentNames[idx];
    const sId = `std_${idx + 1}`;
    const uId = `usr_std_${idx + 1}`;
    studentIdMap.push(sId);

    await client.execute({
      sql: "INSERT INTO users (id, email, password_hash, role, full_name, avatar_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: [uId, s.email, defaultPasswordHash, "student", s.name, null, now],
    });

    await client.execute({
      sql: "INSERT INTO students (id, user_id, student_code, national_id, grade_level, classroom, date_of_birth, parent_name, parent_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      args: [sId, uId, s.code, `110040${String(idx + 1000).padStart(7, "0")}`, s.grade, s.room, "2009-05-15", s.parent, s.pPhone],
    });
  }

  // 4. เพิ่มหลักสูตรรายวิชา 6 วิชา
  const coursesData = [
    { id: "crs_1", code: "ว31101", name: "วิทยาการคำนวณ 1", credits: 1.0, teacherId: "tch_1", grade: "ม.4", sem: 1, year: "2569" },
    { id: "crs_2", code: "ท31101", name: "ภาษาไทยพื้นฐาน 1", credits: 1.0, teacherId: "tch_2", grade: "ม.4", sem: 1, year: "2569" },
    { id: "crs_3", code: "ค31101", name: "คณิตศาสตร์พื้นฐาน 1", credits: 1.5, teacherId: "tch_3", grade: "ม.4", sem: 1, year: "2569" },
    { id: "crs_4", code: "อ31101", name: "ภาษาอังกฤษพื้นฐาน 1", credits: 1.0, teacherId: "tch_4", grade: "ม.4", sem: 1, year: "2569" },
    { id: "crs_5", code: "ส31101", name: "สังคมศึกษา 1", credits: 1.0, teacherId: "tch_5", grade: "ม.4", sem: 1, year: "2569" },
    { id: "crs_6", code: "ว31102", name: "การออกแบบและเทคโนโลยี 1", credits: 1.0, teacherId: "tch_1", grade: "ม.4", sem: 1, year: "2569" },
  ];

  for (const c of coursesData) {
    await client.execute({
      sql: "INSERT INTO courses (id, course_code, course_name, credits, teacher_id, grade_level, semester, academic_year) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      args: [c.id, c.code, c.name, c.credits, c.teacherId, c.grade, c.sem, c.year],
    });
  }

  // 5. ลงทะเบียนเรียนสำหรับนักเรียน ม.4/1 (10 คนแรก ลง 6 วิชา)
  let enrollCount = 1;
  let gradeCount = 1;

  for (let i = 0; i < 10; i++) {
    const sId = studentIdMap[i];
    for (const c of coursesData) {
      await client.execute({
        sql: "INSERT INTO enrollments (id, student_id, course_id) VALUES (?, ?, ?)",
        args: [`enr_${enrollCount++}`, sId, c.id],
      });

      // สร้างคะแนนสอบจำลอง
      const hw = Math.floor(Math.random() * 10) + 40; // 40-50
      const mid = Math.floor(Math.random() * 6) + 14; // 14-20
      const fin = Math.floor(Math.random() * 8) + 22; // 22-30
      const total = hw + mid + fin;
      let letter = "4.0";
      if (total < 50) letter = "0";
      else if (total < 55) letter = "1.0";
      else if (total < 60) letter = "1.5";
      else if (total < 65) letter = "2.0";
      else if (total < 70) letter = "2.5";
      else if (total < 75) letter = "3.0";
      else if (total < 80) letter = "3.5";

      await client.execute({
        sql: "INSERT INTO grades (id, student_id, course_id, homework_score, midterm_score, final_score, total_score, grade_letter) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        args: [`grd_${gradeCount++}`, sId, c.id, hw, mid, fin, total, letter],
      });
    }
  }

  // 6. บันทึกการเข้าเรียนจำลอง (ย้อนหลัง 5 วันทำการ)
  const dates = ["2026-09-08", "2026-09-09", "2026-09-10", "2026-09-11", "2026-09-12"];
  let attCount = 1;

  for (const date of dates) {
    for (let i = 0; i < 10; i++) {
      const sId = studentIdMap[i];
      let status: "present" | "late" | "absent" | "leave" = "present";
      const rand = Math.random();
      if (rand > 0.95) status = "absent";
      else if (rand > 0.90) status = "late";
      else if (rand > 0.85) status = "leave";

      await client.execute({
        sql: "INSERT INTO attendance (id, student_id, date, status, remarks, marked_by) VALUES (?, ?, ?, ?, ?, ?)",
        args: [`att_${attCount++}`, sId, date, status, status !== "present" ? "สุ่มสถานะเพื่อทดสอบ" : null, "usr_tch_1"],
      });
    }
  }

  // 7. ตารางสอนจำลอง ม.4/1
  const schedulesData = [
    { id: "sch_1", courseId: "crs_1", classroom: "ม.4/1", day: "จันทร์", start: "08:30", end: "10:10", room: "ห้องคอมพิวเตอร์ 1" },
    { id: "sch_2", courseId: "crs_2", classroom: "ม.4/1", day: "จันทร์", start: "10:20", end: "12:00", room: "ห้องเรียน 411" },
    { id: "sch_3", courseId: "crs_3", classroom: "ม.4/1", day: "อังคาร", start: "08:30", end: "10:10", room: "ห้องเรียน 411" },
    { id: "sch_4", courseId: "crs_4", classroom: "ม.4/1", day: "พุธ", start: "10:20", end: "12:00", room: "ห้องภาษา 2" },
    { id: "sch_5", courseId: "crs_5", classroom: "ม.4/1", day: "พฤหัสบดี", start: "08:30", end: "10:10", room: "ห้องเรียน 411" },
    { id: "sch_6", courseId: "crs_6", classroom: "ม.4/1", day: "ศุกร์", start: "13:00", end: "14:40", room: "ห้องปฏิบัติการเทคโนโลยี" },
  ];
  for (const s of schedulesData) {
    await client.execute({
      sql: "INSERT INTO schedules (id, course_id, classroom, day_of_week, start_time, end_time, room_number) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: [s.id, s.courseId, s.classroom, s.day, s.start, s.end, s.room],
    });
  }

  // 8. ประกาศข่าวสารโรงเรียน 3 รายการ
  await client.execute({
    sql: "INSERT INTO announcements (id, title, content, category, author_id, target_role, is_pinned, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    args: [
      "anc_1",
      "ยินดีต้อนรับสู่ภาคเรียนใหม่ ปีการศึกษา 2569",
      "ขอต้อนรับคณะครู บุคลากร และนักเรียนทุกคนเข้าสู่ปีการศึกษาใหม่ ขอให้นักเรียนทุกคนตั้งใจศึกษาเล่าเรียนและปฏิบัติตามกฎระเบียบของโรงเรียน",
      "general",
      "usr_admin_1",
      "all",
      1,
      now,
    ],
  });

  await client.execute({
    sql: "INSERT INTO announcements (id, title, content, category, author_id, target_role, is_pinned, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    args: [
      "anc_2",
      "กำหนดการสอบกลางภาค ภาคเรียนที่ 1",
      "การสอบกลางภาคจะจัดขึ้นระหว่างวันที่ 1–5 ตุลาคม 2569 ขอให้นักเรียนตรวจสอบตารางสอบและเตรียมตัวล่วงหน้า",
      "academic",
      "usr_admin_1",
      "all",
      1,
      now,
    ],
  });

  await client.execute({
    sql: "INSERT INTO announcements (id, title, content, category, author_id, target_role, is_pinned, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    args: [
      "anc_3",
      "ขอเชิญเข้าร่วมกิจกรรมสัปดาห์วันวิทยาศาสตร์แห่งชาติ",
      "มีการประกวดโครงงาน สิ่งประดิษฐ์ทางวิทยาศาสตร์ และการแข่งขันตอบปัญหาวิชาการ สมัครได้ที่กลุ่มสาระฯ วิทยาศาสตร์และเทคโนโลยี",
      "activity",
      "usr_tch_1",
      "all",
      0,
      now,
    ],
  });

  console.log("✅ Seed Data สร้างสำเร็จสมบูรณ์!");
  console.log("--------------------------------------------------");
  console.log("📌 บัญชีสำหรับทดสอบระบบ:");
  console.log("1. Admin:   admin@school.ac.th       | รหัสผ่าน: password123");
  console.log("2. Teacher: somchai.t@school.ac.th   | รหัสผ่าน: password123");
  console.log("3. Student: somying.s@school.ac.th   | รหัสผ่าน: password123");
  console.log("--------------------------------------------------");
}

seed().catch((err) => {
  console.error("❌ เกิดข้อผิดพลาดในการ Seed Data:", err);
  process.exit(1);
});
