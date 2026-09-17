import React from "react";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { students, schedules, courses, teachers, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { StudentTimetableClient } from "@/components/schedules/StudentTimetableClient";
import { ScheduleItem } from "@/components/schedules/TimetableGrid";

export const metadata = {
  title: "ตารางเรียนประจำสัปดาห์ | SMS School Portal",
  description: "ระบบตรวจสอบตารางเรียนประจำสัปดาห์สำหรับนักเรียน",
};

export default async function StudentTimetablePage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") {
    redirect("/login");
  }

  // 1. ดึงข้อมูลนักเรียนจาก userId
  const studentRecord = await db
    .select()
    .from(students)
    .where(eq(students.userId, user.id))
    .get();

  if (!studentRecord) {
    redirect("/login");
  }

  const classroomString = `${studentRecord.gradeLevel}/${studentRecord.classroom}`; // เช่น "ม.4/1"

  // 2. ดึงข้อมูลครูที่ปรึกษาประจำห้อง (ถ้ามี)
  const advisorRecord = await db
    .select({
      fullName: users.fullName,
    })
    .from(teachers)
    .innerJoin(users, eq(teachers.userId, users.id))
    .where(eq(teachers.roomAdvisor, classroomString))
    .get();

  // 3. ดึงคาบเรียนทั้งหมดของห้องเรียนนี้
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
    .where(eq(schedules.classroom, classroomString))
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

  return (
    <StudentTimetableClient
      studentName={user.fullName}
      studentCode={studentRecord.studentCode}
      classroom={classroomString}
      advisorName={advisorRecord?.fullName || null}
      schedules={formattedSchedules}
    />
  );
}
