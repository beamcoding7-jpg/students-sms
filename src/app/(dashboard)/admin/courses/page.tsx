import React from "react";
import { db } from "@/lib/db";
import { courses, teachers, users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { CourseListClient } from "@/components/courses/CourseListClient";
import { CourseRecord } from "@/components/courses/CourseFormDialog";
import { TeacherRecord } from "@/components/teachers/TeacherFormDialog";

export const metadata = {
  title: "หลักสูตรรายวิชา | SMS School Portal",
  description: "ระบบบริหารจัดการหลักสูตรและรายวิชาสถานศึกษา",
};

export default async function AdminCoursesPage() {
  // ดึงข้อมูลหลักสูตรรายวิชาทั้งหมด พร้อมชื่อครูและจำนวนนักเรียนที่ลงทะเบียน
  const rawCourses = await db
    .select({
      id: courses.id,
      courseCode: courses.courseCode,
      courseName: courses.courseName,
      credits: courses.credits,
      teacherId: courses.teacherId,
      gradeLevel: courses.gradeLevel,
      semester: courses.semester,
      academicYear: courses.academicYear,
      teacherDept: teachers.department,
      teacherName: users.fullName,
      teacherEmail: users.email,
      enrolledCount: sql<number>`(SELECT COUNT(*) FROM enrollments WHERE enrollments.course_id = ${courses.id})`,
    })
    .from(courses)
    .leftJoin(teachers, eq(courses.teacherId, teachers.id))
    .leftJoin(users, eq(teachers.userId, users.id))
    .orderBy(courses.gradeLevel, courses.courseCode)
    .all();

  const formattedCourses: CourseRecord[] = rawCourses.map((c) => ({
    id: c.id,
    courseCode: c.courseCode,
    courseName: c.courseName,
    credits: c.credits,
    teacherId: c.teacherId,
    gradeLevel: c.gradeLevel,
    semester: c.semester,
    academicYear: c.academicYear,
    teacher: c.teacherId && c.teacherName
      ? {
          id: c.teacherId,
          department: c.teacherDept || "",
          user: {
            fullName: c.teacherName,
            email: c.teacherEmail || "",
          },
        }
      : null,
    enrolledCount: Number(c.enrolledCount) || 0,
  }));

  // ดึงรายชื่อคุณครูทั้งหมดสำหรับเลือกอาจารย์ผู้สอนใน Form Dialog
  const rawTeachers = await db
    .select({
      id: teachers.id,
      userId: teachers.userId,
      department: teachers.department,
      phone: teachers.phone,
      roomAdvisor: teachers.roomAdvisor,
      fullName: users.fullName,
      email: users.email,
      avatarUrl: users.avatarUrl,
    })
    .from(teachers)
    .innerJoin(users, eq(teachers.userId, users.id))
    .orderBy(teachers.department, users.fullName)
    .all();

  const formattedTeachers: TeacherRecord[] = rawTeachers.map((t) => ({
    id: t.id,
    userId: t.userId,
    department: t.department,
    phone: t.phone,
    roomAdvisor: t.roomAdvisor,
    user: {
      fullName: t.fullName,
      email: t.email,
      avatarUrl: t.avatarUrl,
    },
  }));

  return (
    <CourseListClient
      initialCourses={formattedCourses}
      availableTeachers={formattedTeachers}
    />
  );
}
