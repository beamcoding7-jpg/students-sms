import React from "react";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { schedules, courses, teachers, users, students } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { AdminSchedulesClient } from "@/components/schedules/AdminSchedulesClient";
import { ScheduleItem } from "@/components/schedules/TimetableGrid";

export const metadata = {
  title: "ตารางเรียน/สอน | SMS School Portal",
  description: "ระบบบริหารจัดการตารางเรียนและตารางสอนประจำสัปดาห์",
};

export default async function AdminSchedulesPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    redirect("/login");
  }

  // 1. ดึงคาบเรียนทั้งหมดในระบบ พร้อมข้อมูลวิชาและอาจารย์ผู้สอน
  const rawSchedules = await db
    .select({
      id: schedules.id,
      courseId: schedules.courseId,
      classroom: schedules.classroom,
      dayOfWeek: schedules.dayOfWeek,
      startTime: schedules.startTime,
      endTime: schedules.endTime,
      roomNumber: schedules.roomNumber,
      courseCode: courses.courseCode,
      courseName: courses.courseName,
      credits: courses.credits,
      teacherName: users.fullName,
      department: teachers.department,
    })
    .from(schedules)
    .innerJoin(courses, eq(schedules.courseId, courses.id))
    .leftJoin(teachers, eq(courses.teacherId, teachers.id))
    .leftJoin(users, eq(teachers.userId, users.id))
    .all();

  const formattedSchedules: ScheduleItem[] = rawSchedules.map((s) => ({
    id: s.id,
    courseId: s.courseId,
    courseCode: s.courseCode,
    courseName: s.courseName,
    credits: s.credits,
    classroom: s.classroom,
    dayOfWeek: s.dayOfWeek as "จันทร์" | "อังคาร" | "พุธ" | "พฤหัสบดี" | "ศุกร์",
    startTime: s.startTime,
    endTime: s.endTime,
    roomNumber: s.roomNumber,
    teacherName: s.teacherName || "ไม่ระบุผู้สอน",
    department: s.department || undefined,
  }));

  // 2. ดึงรายวิชาทั้งหมดพร้อมชื่อผู้สอนสำหรับตัวเลือกในฟอร์ม
  const rawCourses = await db
    .select({
      id: courses.id,
      courseCode: courses.courseCode,
      courseName: courses.courseName,
      credits: courses.credits,
      teacherName: users.fullName,
    })
    .from(courses)
    .leftJoin(teachers, eq(courses.teacherId, teachers.id))
    .leftJoin(users, eq(teachers.userId, users.id))
    .orderBy(courses.courseCode)
    .all();

  const courseOptions = rawCourses.map((c) => ({
    id: c.id,
    courseCode: c.courseCode,
    courseName: c.courseName,
    credits: c.credits,
    teacherName: c.teacherName || "ยังไม่ระบุผู้สอน",
  }));

  // 3. ดึงรายชื่อห้องเรียนทั้งหมดที่มีนักเรียนในระบบ
  const allStudents = await db
    .select({
      gradeLevel: students.gradeLevel,
      classroom: students.classroom,
    })
    .from(students)
    .all();

  const classroomSet = new Set<string>();
  for (const s of allStudents) {
    classroomSet.add(`${s.gradeLevel}/${s.classroom}`);
  }
  for (const s of rawSchedules) {
    classroomSet.add(s.classroom);
  }

  const classrooms = Array.from(classroomSet).sort();

  return (
    <AdminSchedulesClient
      initialSchedules={formattedSchedules}
      courses={courseOptions}
      classrooms={classrooms}
    />
  );
}
