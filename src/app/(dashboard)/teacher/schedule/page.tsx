import React from "react";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { schedules, courses, teachers, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { TeacherScheduleClient } from "@/components/schedules/TeacherScheduleClient";
import { ScheduleItem } from "@/components/schedules/TimetableGrid";

export const metadata = {
  title: "ตารางสอนประจำสัปดาห์ | SMS School Portal",
  description: "ระบบตรวจสอบตารางสอนและภาระงานสอนประจำสัปดาห์สำหรับคุณครู",
};

export default async function TeacherSchedulePage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    redirect("/login");
  }

  // 1. ดึงข้อมูลคุณครูจาก userId
  const teacherRecord = await db
    .select()
    .from(teachers)
    .where(eq(teachers.userId, user.id))
    .get();

  if (!teacherRecord) {
    redirect("/login");
  }

  // 2. ดึงคาบสอนเฉพาะของครูท่านนี้
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
    .innerJoin(teachers, eq(courses.teacherId, teachers.id))
    .innerJoin(users, eq(teachers.userId, users.id))
    .where(eq(teachers.id, teacherRecord.id))
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
    teacherName: s.teacherName || user.fullName,
    department: s.department || undefined,
  }));

  return (
    <TeacherScheduleClient
      teacherName={user.fullName}
      department={teacherRecord.department}
      roomAdvisor={teacherRecord.roomAdvisor}
      schedules={formattedSchedules}
    />
  );
}
