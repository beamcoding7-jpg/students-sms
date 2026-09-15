import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// 1. ตาราง users (ผู้ใช้งานระบบทั้งหมด)
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["admin", "teacher", "student"] }).notNull(),
  fullName: text("full_name").notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: text("created_at").notNull(),
});

// 2. ตาราง teachers (ข้อมูลเฉพาะสำหรับครู)
export const teachers = sqliteTable("teachers", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  department: text("department").notNull(),
  phone: text("phone"),
  roomAdvisor: text("room_advisor"), // เช่น "ม.4/1"
});

// 3. ตาราง students (ข้อมูลเฉพาะสำหรับนักเรียน)
export const students = sqliteTable("students", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  studentCode: text("student_code").notNull().unique(), // เช่น "STU-1001"
  nationalId: text("national_id"),
  gradeLevel: text("grade_level").notNull(), // เช่น "ม.4"
  classroom: text("classroom").notNull(), // เช่น "1" -> ม.4/1
  dateOfBirth: text("date_of_birth"),
  parentName: text("parent_name"),
  parentPhone: text("parent_phone"),
});

// 4. ตาราง courses (รายวิชาในหลักสูตร)
export const courses = sqliteTable("courses", {
  id: text("id").primaryKey(),
  courseCode: text("course_code").notNull().unique(), // เช่น "ว31101"
  courseName: text("course_name").notNull(), // เช่น "วิทยาการคำนวณ 1"
  credits: real("credits").notNull(), // เช่น 1.0 หรือ 1.5
  teacherId: text("teacher_id").references(() => teachers.id),
  gradeLevel: text("grade_level").notNull(), // เช่น "ม.4"
  semester: integer("semester").notNull(), // 1 หรือ 2
  academicYear: text("academic_year").notNull(), // เช่น "2569"
});

// 5. ตาราง enrollments (การลงทะเบียนเรียนของนักเรียน)
export const enrollments = sqliteTable("enrollments", {
  id: text("id").primaryKey(),
  studentId: text("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  courseId: text("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
});

// 6. ตาราง attendance (บันทึกการเข้าเรียนประจำวัน)
export const attendance = sqliteTable("attendance", {
  id: text("id").primaryKey(),
  studentId: text("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  date: text("date").notNull(), // YYYY-MM-DD
  status: text("status", { enum: ["present", "late", "absent", "leave"] }).notNull(),
  remarks: text("remarks"),
  markedBy: text("marked_by").references(() => users.id),
});

// 7. ตาราง grades (ผลการเรียนและคะแนนสอบ)
export const grades = sqliteTable("grades", {
  id: text("id").primaryKey(),
  studentId: text("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  courseId: text("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  homeworkScore: real("homework_score").notNull().default(0), // เต็ม 50
  midtermScore: real("midterm_score").notNull().default(0), // เต็ม 20
  finalScore: real("final_score").notNull().default(0), // เต็ม 30
  totalScore: real("total_score").notNull().default(0), // รวม 100
  gradeLetter: text("grade_letter").notNull().default("0"), // "4.0", "3.5", ...
});

// 8. ตาราง schedules (ตารางเรียน / ตารางสอน)
export const schedules = sqliteTable("schedules", {
  id: text("id").primaryKey(),
  courseId: text("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  classroom: text("classroom").notNull(), // เช่น "ม.4/1"
  dayOfWeek: text("day_of_week").notNull(), // จันทร์ - ศุกร์
  startTime: text("start_time").notNull(), // เช่น "08:30"
  endTime: text("end_time").notNull(), // เช่น "10:10"
  roomNumber: text("room_number").notNull(), // เช่น "ห้อง 321"
});

// 9. ตาราง announcements (ข่าวประชาสัมพันธ์และประกาศ)
export const announcements = sqliteTable("announcements", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category", { enum: ["academic", "activity", "general", "urgent"] }).notNull().default("general"),
  authorId: text("author_id").notNull().references(() => users.id),
  targetRole: text("target_role", { enum: ["all", "teacher", "student"] }).notNull().default("all"),
  isPinned: integer("is_pinned").notNull().default(0), // 0 หรือ 1
  createdAt: text("created_at").notNull(),
});

// 10. ตาราง assignments & submissions (การบ้านและการส่งงาน)
export const assignments = sqliteTable("assignments", {
  id: text("id").primaryKey(),
  courseId: text("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: text("due_date").notNull(),
  maxScore: real("max_score").notNull().default(10),
  createdBy: text("created_by").notNull().references(() => users.id),
  createdAt: text("created_at").notNull(),
});

export const submissions = sqliteTable("submissions", {
  id: text("id").primaryKey(),
  assignmentId: text("assignment_id").notNull().references(() => assignments.id, { onDelete: "cascade" }),
  studentId: text("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  content: text("content"),
  fileUrl: text("file_url"),
  score: real("score"),
  feedback: text("feedback"),
  status: text("status", { enum: ["pending", "submitted", "graded", "late"] }).notNull().default("submitted"),
  submittedAt: text("submitted_at").notNull(),
});

// Relations Definitions
export const usersRelations = relations(users, ({ one, many }) => ({
  teacher: one(teachers, { fields: [users.id], references: [teachers.userId] }),
  student: one(students, { fields: [users.id], references: [students.userId] }),
  announcements: many(announcements),
}));

export const teachersRelations = relations(teachers, ({ one, many }) => ({
  user: one(users, { fields: [teachers.userId], references: [users.id] }),
  courses: many(courses),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, { fields: [students.userId], references: [users.id] }),
  enrollments: many(enrollments),
  attendance: many(attendance),
  grades: many(grades),
  submissions: many(submissions),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  teacher: one(teachers, { fields: [courses.teacherId], references: [teachers.id] }),
  enrollments: many(enrollments),
  grades: many(grades),
  schedules: many(schedules),
  assignments: many(assignments),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  student: one(students, { fields: [enrollments.studentId], references: [students.id] }),
  course: one(courses, { fields: [enrollments.courseId], references: [courses.id] }),
}));
