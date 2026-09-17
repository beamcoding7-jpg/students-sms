import React from "react";
import { db } from "@/lib/db";
import { teachers, users, courses } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { TeacherListClient } from "@/components/teachers/TeacherListClient";
import { TeacherRecord } from "@/components/teachers/TeacherFormDialog";

export const metadata = {
  title: "ข้อมูลครูและบุคลากร | SMS School Portal",
  description: "ระบบบริหารจัดการข้อมูลคุณครูและบุคลากรทางการศึกษา",
};

export default async function AdminTeachersPage() {
  // ดึงข้อมูลครูพร้อมข้อมูลผู้ใช้และจำนวนวิชาที่สอนจาก SQLite
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
      courseCount: sql<number>`(SELECT COUNT(*) FROM courses WHERE courses.teacher_id = ${teachers.id})`,
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
    courseCount: Number(t.courseCount) || 0,
  }));

  return <TeacherListClient initialTeachers={formattedTeachers} />;
}
