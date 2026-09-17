import React from "react";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { attendance, students, users } from "@/lib/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { AdminAttendanceClient, AttendanceKPIStats } from "@/components/attendance/AdminAttendanceClient";
import { DayTrend } from "@/components/attendance/AttendanceTrendsChart";
import { AtRiskStudent } from "@/components/attendance/AtRiskStudentsTable";

export const metadata = {
  title: "สถิติการเข้าเรียน | SMS School Portal",
  description: "แดชบอร์ดสถิติและการติดตามการเข้าเรียนสำหรับผู้บริหาร",
};

// ฟังก์ชันแปลงรูปแบบวันที่ YYYY-MM-DD เป็นชื่อวันและวันที่ภาษาไทยย่อ
function formatThaiShortDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const thaiMonths = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
  ];
  const monthName = thaiMonths[month - 1] || "";
  return `${day} ${monthName}`;
}

export default async function AdminAttendancePage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    redirect("/login");
  }

  // 1. ดึงข้อมูลบันทึกเวลาเรียนทั้งหมด
  const allRecords = await db
    .select({
      id: attendance.id,
      studentId: attendance.studentId,
      date: attendance.date,
      status: attendance.status,
      remarks: attendance.remarks,
      studentCode: students.studentCode,
      fullName: users.fullName,
      gradeLevel: students.gradeLevel,
      classroom: students.classroom,
      parentName: students.parentName,
      parentPhone: students.parentPhone,
    })
    .from(attendance)
    .innerJoin(students, eq(attendance.studentId, students.id))
    .innerJoin(users, eq(students.userId, users.id))
    .orderBy(desc(attendance.date))
    .all();

  // 2. คำนวณภาพรวม (KPI Stats)
  const totalRecords = allRecords.length;
  let presentCount = 0;
  let lateCount = 0;
  let leaveCount = 0;
  let absentCount = 0;

  for (const r of allRecords) {
    if (r.status === "present") presentCount++;
    else if (r.status === "late") lateCount++;
    else if (r.status === "leave") leaveCount++;
    else if (r.status === "absent") absentCount++;
  }

  // เกณฑ์เวลาเรียน: มาเรียน + ลา / ทั้งหมด
  const overallRate =
    totalRecords > 0
      ? Math.round(((presentCount + leaveCount) / totalRecords) * 100)
      : 100;

  const overallStats: AttendanceKPIStats = {
    totalRecords,
    presentCount,
    lateCount,
    leaveCount,
    absentCount,
    attendanceRate: overallRate,
  };

  // 3. รวมสถิติแนวโน้มรายวัน (Daily Trends)
  const dateMap = new Map<string, { total: number; present: number; late: number; leave: number; absent: number }>();
  for (const r of allRecords) {
    if (!dateMap.has(r.date)) {
      dateMap.set(r.date, { total: 0, present: 0, late: 0, leave: 0, absent: 0 });
    }
    const stat = dateMap.get(r.date)!;
    stat.total++;
    if (r.status === "present") stat.present++;
    else if (r.status === "late") stat.late++;
    else if (r.status === "leave") stat.leave++;
    else if (r.status === "absent") stat.absent++;
  }

  // เรียงลำดับวันที่จากเก่าไปใหม่ และเลือก 5 วันล่าสุด
  const sortedDates = Array.from(dateMap.keys()).sort();
  const recentDates = sortedDates.slice(-5);

  const dailyTrends: DayTrend[] = recentDates.map((date) => {
    const item = dateMap.get(date)!;
    const rate = item.total > 0 ? Math.round(((item.present + item.leave) / item.total) * 100) : 0;
    return {
      date,
      dayLabel: formatThaiShortDate(date),
      total: item.total,
      present: item.present,
      late: item.late,
      leave: item.leave,
      absent: item.absent,
      rate,
    };
  });

  // 4. คำนวณนักเรียนกลุ่มเสี่ยง (At Risk Students)
  const studentMap = new Map<
    string,
    {
      id: string;
      studentCode: string;
      fullName: string;
      gradeLevel: string;
      classroom: string;
      parentName: string | null;
      parentPhone: string | null;
      total: number;
      present: number;
      late: number;
      leave: number;
      absent: number;
    }
  >();

  for (const r of allRecords) {
    if (!studentMap.has(r.studentId)) {
      studentMap.set(r.studentId, {
        id: r.studentId,
        studentCode: r.studentCode,
        fullName: r.fullName,
        gradeLevel: r.gradeLevel,
        classroom: r.classroom,
        parentName: r.parentName,
        parentPhone: r.parentPhone,
        total: 0,
        present: 0,
        late: 0,
        leave: 0,
        absent: 0,
      });
    }
    const item = studentMap.get(r.studentId)!;
    item.total++;
    if (r.status === "present") item.present++;
    else if (r.status === "late") item.late++;
    else if (r.status === "leave") item.leave++;
    else if (r.status === "absent") item.absent++;
  }

  const atRiskStudents: AtRiskStudent[] = [];
  for (const s of studentMap.values()) {
    const rate = s.total > 0 ? Math.round(((s.present + s.leave) / s.total) * 100) : 100;
    // นักเรียนที่เคยขาด หรือมาสายตั้งแต่ 1 ครั้งขึ้นไป หรืออัตราเวลาเรียน < 90%
    if (s.absent > 0 || s.late > 0 || rate < 90) {
      atRiskStudents.push({
        id: s.id,
        studentCode: s.studentCode,
        fullName: s.fullName,
        gradeLevel: s.gradeLevel,
        classroom: s.classroom,
        absentCount: s.absent,
        lateCount: s.late,
        leaveCount: s.leave,
        parentName: s.parentName,
        parentPhone: s.parentPhone,
        attendanceRate: rate,
      });
    }
  }

  // เรียงลำดับนักเรียนกลุ่มเสี่ยง: ขาดมากที่สุดก่อน -> สายมากที่สุด -> อัตราต่ำสุด
  atRiskStudents.sort((a, b) => {
    if (b.absentCount !== a.absentCount) return b.absentCount - a.absentCount;
    if (b.lateCount !== a.lateCount) return b.lateCount - a.lateCount;
    return a.attendanceRate - b.attendanceRate;
  });

  // 5. ดึงรายชื่อระดับชั้นและห้องเรียนทั้งหมด
  const allStudents = await db
    .select({
      gradeLevel: students.gradeLevel,
      classroom: students.classroom,
    })
    .from(students)
    .all();

  const gradeLevelSet = new Set<string>();
  const classroomSet = new Set<string>();

  for (const s of allStudents) {
    gradeLevelSet.add(s.gradeLevel);
    classroomSet.add(s.classroom);
  }

  const gradeLevels = Array.from(gradeLevelSet).sort();
  const classrooms = Array.from(classroomSet).sort();

  return (
    <AdminAttendanceClient
      overallStats={overallStats}
      dailyTrends={dailyTrends}
      atRiskStudents={atRiskStudents}
      gradeLevels={gradeLevels}
      classrooms={classrooms}
    />
  );
}
