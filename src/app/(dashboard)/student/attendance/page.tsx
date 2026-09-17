import React from "react";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { students, attendance, users } from "@/lib/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import {
  StudentAttendanceClient,
  StudentAttendanceHistoryItem,
} from "@/components/attendance/StudentAttendanceClient";

export const metadata = {
  title: "ประวัติการเข้าเรียน | SMS School Portal",
  description: "ระบบตรวจสอบประวัติเวลาเรียนและสิทธิ์สอบสำหรับนักเรียน",
};

// แปลงวันที่ YYYY-MM-DD เป็นข้อความภาษาไทย
function formatThaiDateWithDay(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const dateObj = new Date(year, month - 1, day);

  const thaiDays = ["วันอาทิตย์", "วันจันทร์", "วันอังคาร", "วันพุธ", "วันพฤหัสบดี", "วันศุกร์", "วันเสาร์"];
  const thaiMonths = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
  ];

  const dayName = thaiDays[dateObj.getDay()] || "";
  const monthName = thaiMonths[month - 1] || "";
  const thaiYear = year + 543;

  return `${dayName}ที่ ${day} ${monthName} ${thaiYear}`;
}

export default async function StudentAttendancePage() {
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

  // 2. ดึงประวัติการเข้าเรียนทั้งหมดของนักเรียน
  const rawRecords = await db
    .select({
      id: attendance.id,
      date: attendance.date,
      status: attendance.status,
      remarks: attendance.remarks,
      markedBy: attendance.markedBy,
    })
    .from(attendance)
    .where(eq(attendance.studentId, studentRecord.id))
    .orderBy(desc(attendance.date))
    .all();

  // 3. ดึงชื่อครูผู้บันทึก (ถ้ามี)
  const markerIds = rawRecords
    .map((r) => r.markedBy)
    .filter((id): id is string => Boolean(id));

  const uniqueMarkerIds = Array.from(new Set(markerIds));
  const markers =
    uniqueMarkerIds.length > 0
      ? await db
          .select({
            id: users.id,
            fullName: users.fullName,
          })
          .from(users)
          .where(inArray(users.id, uniqueMarkerIds))
          .all()
      : [];

  const markerMap = new Map<string, string>();
  for (const m of markers) {
    markerMap.set(m.id, m.fullName);
  }

  // 4. คำนวณสถิติ
  let presentDays = 0;
  let lateDays = 0;
  let leaveDays = 0;
  let absentDays = 0;

  for (const r of rawRecords) {
    if (r.status === "present") presentDays++;
    else if (r.status === "late") lateDays++;
    else if (r.status === "leave") leaveDays++;
    else if (r.status === "absent") absentDays++;
  }

  const totalDays = rawRecords.length;
  // อัตราเวลาเรียน: มาเรียน + ลา
  const attendanceRate =
    totalDays > 0 ? Math.round(((presentDays + leaveDays) / totalDays) * 100) : 100;

  const history: StudentAttendanceHistoryItem[] = rawRecords.map((r) => ({
    id: r.id,
    date: r.date,
    dayLabel: formatThaiDateWithDay(r.date),
    status: r.status as "present" | "late" | "absent" | "leave",
    remarks: r.remarks,
    markedByName: r.markedBy ? markerMap.get(r.markedBy) || null : null,
  }));

  return (
    <StudentAttendanceClient
      studentName={user.fullName}
      studentCode={studentRecord.studentCode}
      gradeAndRoom={`${studentRecord.gradeLevel}/${studentRecord.classroom}`}
      totalDays={totalDays}
      presentDays={presentDays}
      lateDays={lateDays}
      leaveDays={leaveDays}
      absentDays={absentDays}
      attendanceRate={attendanceRate}
      history={history}
    />
  );
}
