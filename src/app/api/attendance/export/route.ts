import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { attendance, students, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "teacher")) {
    return new Response("Unauthorized", { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const gradeLevel = searchParams.get("gradeLevel");
  const classroom = searchParams.get("classroom");

  // ดึงข้อมูลการเข้าเรียนพร้อมข้อมูลนักเรียน
  const allRecords = await db
    .select({
      id: attendance.id,
      date: attendance.date,
      status: attendance.status,
      remarks: attendance.remarks,
      studentCode: students.studentCode,
      fullName: users.fullName,
      gradeLevel: students.gradeLevel,
      classroom: students.classroom,
      markedBy: attendance.markedBy,
    })
    .from(attendance)
    .innerJoin(students, eq(attendance.studentId, students.id))
    .innerJoin(users, eq(students.userId, users.id))
    .orderBy(desc(attendance.date), students.gradeLevel, students.classroom, students.studentCode)
    .all();

  // กรองตาม Filter (ถ้ามี)
  const filtered = allRecords.filter((r) => {
    if (gradeLevel && gradeLevel !== "all" && r.gradeLevel !== gradeLevel) return false;
    if (classroom && classroom !== "all" && r.classroom !== classroom) return false;
    return true;
  });

  const escapeCsv = (val: string | null | undefined) => {
    if (!val) return '""';
    return `"${val.replace(/"/g, '""')}"`;
  };

  const statusLabelMap: Record<string, string> = {
    present: "มาเรียน",
    late: "มาสาย",
    leave: "ลา",
    absent: "ขาดเรียน",
  };

  const headers = [
    "ลำดับ",
    "วันที่",
    "รหัสนักเรียน",
    "ชื่อ-นามสกุล",
    "ระดับชั้น",
    "ห้องเรียน",
    "สถานะการเข้าเรียน",
    "หมายเหตุ",
  ];

  const rows = filtered.map((r, idx) => [
    idx + 1,
    escapeCsv(r.date),
    escapeCsv(r.studentCode),
    escapeCsv(r.fullName),
    escapeCsv(r.gradeLevel),
    escapeCsv(`ห้อง ${r.classroom}`),
    escapeCsv(statusLabelMap[r.status] || r.status),
    escapeCsv(r.remarks || "-"),
  ]);

  // ฝัง UTF-8 BOM (\uFEFF) เพื่อให้โปรแกรม Excel ภาษาไทยเปิดอ่านได้สมบูรณ์
  const csvContent =
    "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  const today = new Date().toISOString().slice(0, 10);
  const filename = `attendance_report_${today}.csv`;

  return new Response(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
