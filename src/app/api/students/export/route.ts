import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { students, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search")?.toLowerCase().trim() || "";
  const grade = searchParams.get("grade") || "all";
  const room = searchParams.get("room") || "all";

  // ดึงข้อมูลนักเรียนทั้งหมด
  const allStudents = await db
    .select({
      id: students.id,
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
    .all();

  // กรองตามเงื่อนไขเดียวกับ Client
  const filtered = allStudents.filter((s) => {
    const matchSearch =
      !search ||
      s.fullName.toLowerCase().includes(search) ||
      s.studentCode.toLowerCase().includes(search) ||
      s.email.toLowerCase().includes(search) ||
      (s.nationalId && s.nationalId.includes(search));

    const matchGrade = grade === "all" || s.gradeLevel === grade;
    const matchRoom = room === "all" || s.classroom === room;

    return matchSearch && matchGrade && matchRoom;
  });

  // สร้างเนื้อหา CSV (ใส่ Escape quotes ป้องกัน comma breakdown)
  const escapeCsv = (val: string | null | undefined) => {
    if (!val) return '""';
    return `"${val.replace(/"/g, '""')}"`;
  };

  const headers = [
    "ลำดับ",
    "รหัสนักเรียน",
    "ชื่อ-นามสกุล",
    "ระดับชั้น",
    "ห้องเรียน",
    "เลขประจำตัวประชาชน",
    "วันเกิด",
    "ชื่อผู้ปกครอง",
    "เบอร์โทรผู้ปกครอง",
    "อีเมลเข้าสู่ระบบ",
  ];

  const rows = filtered.map((s, idx) => [
    idx + 1,
    escapeCsv(s.studentCode),
    escapeCsv(s.fullName),
    escapeCsv(s.gradeLevel),
    escapeCsv(`ห้อง ${s.classroom}`),
    escapeCsv(s.nationalId),
    escapeCsv(s.dateOfBirth),
    escapeCsv(s.parentName),
    escapeCsv(s.parentPhone),
    escapeCsv(s.email),
  ]);

  // UTF-8 BOM (\uFEFF) สำหรับให้โปรแกรม Excel เปิดภาษาไทยได้โดยไม่เพี้ยน
  const csvContent =
    "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  const today = new Date().toISOString().slice(0, 10);
  const filename = `students_export_${today}.csv`;

  return new Response(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
