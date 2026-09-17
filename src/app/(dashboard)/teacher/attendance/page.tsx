import React from "react";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { teachers, students, users, attendance } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { AttendanceChecklistClient } from "@/components/attendance/AttendanceChecklistClient";
import { ClassroomStudentAttendance } from "./actions";

export const metadata = {
  title: "เช็คชื่อประจำวัน | SMS School Portal",
  description: "ระบบบันทึกเวลาเรียนและเช็คชื่อนักเรียนประจำวัน",
};

export default async function TeacherAttendancePage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    redirect("/login");
  }

  // 1. ดึงข้อมูลครูเพื่อตรวจสอบห้องประจำชั้น (roomAdvisor เช่น "ม.4/1")
  const teacherRecord = await db
    .select()
    .from(teachers)
    .where(eq(teachers.userId, user.id))
    .get();

  // 2. ดึงรายการห้องเรียนทั้งหมดที่มีนักเรียนในระบบ
  const allStudents = await db
    .select({
      gradeLevel: students.gradeLevel,
      classroom: students.classroom,
    })
    .from(students)
    .all();

  // สร้างชุดห้องเรียนที่ไม่ซ้ำกัน
  const roomMap = new Map<string, { gradeLevel: string; classroom: string; label: string }>();
  for (const s of allStudents) {
    const key = `${s.gradeLevel}_${s.classroom}`;
    if (!roomMap.has(key)) {
      roomMap.set(key, {
        gradeLevel: s.gradeLevel,
        classroom: s.classroom,
        label: `ห้อง ${s.gradeLevel}/${s.classroom}`,
      });
    }
  }

  const availableRooms = Array.from(roomMap.values()).sort((a, b) => {
    if (a.gradeLevel !== b.gradeLevel) return a.gradeLevel.localeCompare(b.gradeLevel);
    return a.classroom.localeCompare(b.classroom);
  });

  // 3. กำหนดห้องเริ่มต้นตามห้องประจำชั้นของครู
  let defaultGradeLevel = "ม.4";
  let defaultClassroom = "1";

  if (teacherRecord?.roomAdvisor) {
    const parts = teacherRecord.roomAdvisor.split("/");
    if (parts.length === 2) {
      defaultGradeLevel = parts[0];
      defaultClassroom = parts[1];
    }
  } else if (availableRooms.length > 0) {
    defaultGradeLevel = availableRooms[0].gradeLevel;
    defaultClassroom = availableRooms[0].classroom;
  }

  // 4. วันที่เริ่มต้น (วันนี้ ในรูปแบบ YYYY-MM-DD)
  const today = new Date().toISOString().split("T")[0];

  // 5. ดึงรายชื่อนักเรียนในห้องเริ่มต้น
  const roomStudents = await db
    .select({
      id: students.id,
      studentCode: students.studentCode,
      fullName: users.fullName,
      gradeLevel: students.gradeLevel,
      classroom: students.classroom,
      parentName: students.parentName,
      parentPhone: students.parentPhone,
    })
    .from(students)
    .innerJoin(users, eq(students.userId, users.id))
    .where(and(eq(students.gradeLevel, defaultGradeLevel), eq(students.classroom, defaultClassroom)))
    .orderBy(students.studentCode)
    .all();

  const studentIds = roomStudents.map((s) => s.id);

  // 6. ดึงข้อมูลการเช็คชื่อในวันนี้ (ถ้ามี)
  const existingRecords =
    studentIds.length > 0
      ? await db
          .select({
            studentId: attendance.studentId,
            status: attendance.status,
            remarks: attendance.remarks,
          })
          .from(attendance)
          .where(and(eq(attendance.date, today), inArray(attendance.studentId, studentIds)))
          .all()
      : [];

  const recordMap = new Map<string, { status: "present" | "late" | "absent" | "leave"; remarks: string | null }>();
  for (const rec of existingRecords) {
    recordMap.set(rec.studentId, {
      status: rec.status as "present" | "late" | "absent" | "leave",
      remarks: rec.remarks,
    });
  }

  const initialStudents: ClassroomStudentAttendance[] = roomStudents.map((s) => {
    const existing = recordMap.get(s.id);
    return {
      id: s.id,
      studentCode: s.studentCode,
      fullName: s.fullName,
      gradeLevel: s.gradeLevel,
      classroom: s.classroom,
      parentName: s.parentName,
      parentPhone: s.parentPhone,
      status: existing ? existing.status : "present",
      remarks: existing?.remarks || "",
      isExisting: !!existing,
    };
  });

  return (
    <AttendanceChecklistClient
      initialDate={today}
      availableRooms={availableRooms}
      defaultGradeLevel={defaultGradeLevel}
      defaultClassroom={defaultClassroom}
      initialStudents={initialStudents}
      initialIsAlreadyMarked={existingRecords.length > 0}
      teacherName={user.fullName}
    />
  );
}
