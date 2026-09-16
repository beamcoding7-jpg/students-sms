import React from "react";
import { db } from "@/lib/db";
import { students, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { StudentListClient } from "@/components/students/StudentListClient";
import { StudentRecord } from "@/components/students/StudentFormDialog";

export default async function AdminStudentsPage() {
  // ดึงข้อมูลนักเรียนพร้อมข้อมูลผู้ใช้จาก SQLite
  const rawStudents = await db
    .select({
      id: students.id,
      userId: students.userId,
      studentCode: students.studentCode,
      nationalId: students.nationalId,
      gradeLevel: students.gradeLevel,
      classroom: students.classroom,
      dateOfBirth: students.dateOfBirth,
      parentName: students.parentName,
      parentPhone: students.parentPhone,
      fullName: users.fullName,
      email: users.email,
    })
    .from(students)
    .innerJoin(users, eq(students.userId, users.id))
    .orderBy(desc(students.gradeLevel), students.classroom, students.studentCode)
    .all();

  const formattedStudents: StudentRecord[] = rawStudents.map((s) => ({
    id: s.id,
    userId: s.userId,
    studentCode: s.studentCode,
    nationalId: s.nationalId,
    gradeLevel: s.gradeLevel,
    classroom: s.classroom,
    dateOfBirth: s.dateOfBirth,
    parentName: s.parentName,
    parentPhone: s.parentPhone,
    user: {
      fullName: s.fullName,
      email: s.email,
    },
  }));

  return <StudentListClient initialStudents={formattedStudents} />;
}
