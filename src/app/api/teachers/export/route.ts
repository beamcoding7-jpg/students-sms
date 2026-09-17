import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { teachers, users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search")?.toLowerCase().trim() || "";
  const dept = searchParams.get("dept") || "all";
  const advisor = searchParams.get("advisor") || "all";

  // ดึงข้อมูลครูทั้งหมด
  const allTeachers = await db
    .select({
      id: teachers.id,
      department: teachers.department,
      phone: teachers.phone,
      roomAdvisor: teachers.roomAdvisor,
      fullName: users.fullName,
      email: users.email,
      courseCount: sql<number>`(SELECT COUNT(*) FROM courses WHERE courses.teacher_id = ${teachers.id})`,
    })
    .from(teachers)
    .innerJoin(users, eq(teachers.userId, users.id))
    .orderBy(teachers.department, users.fullName)
    .all();

  // กรองตามเงื่อนไข
  const filtered = allTeachers.filter((t) => {
    const matchSearch =
      !search ||
      t.fullName.toLowerCase().includes(search) ||
      t.email.toLowerCase().includes(search) ||
      t.department.toLowerCase().includes(search) ||
      (t.phone && t.phone.includes(search)) ||
      (t.roomAdvisor && t.roomAdvisor.toLowerCase().includes(search));

    const matchDept = dept === "all" || t.department === dept;

    let matchAdvisor = true;
    if (advisor === "has_advisor") matchAdvisor = !!t.roomAdvisor;
    if (advisor === "no_advisor") matchAdvisor = !t.roomAdvisor;

    return matchSearch && matchDept && matchAdvisor;
  });

  const escapeCsv = (val: string | number | null | undefined) => {
    if (val === null || val === undefined) return '""';
    return `"${String(val).replace(/"/g, '""')}"`;
  };

  const headers = [
    "ลำดับ",
    "ชื่อ-นามสกุล",
    "กลุ่มสาระการเรียนรู้",
    "ชั้นประจำห้อง (ที่ปรึกษา)",
    "เบอร์โทรติดต่อ",
    "อีเมลสถานศึกษา",
    "จำนวนวิชาที่สอน",
  ];

  const rows = filtered.map((t, idx) => [
    idx + 1,
    escapeCsv(t.fullName),
    escapeCsv(t.department),
    escapeCsv(t.roomAdvisor || "ไม่มี"),
    escapeCsv(t.phone || "-"),
    escapeCsv(t.email),
    escapeCsv(t.courseCount || 0),
  ]);

  // UTF-8 Byte Order Mark (\uFEFF) เพื่อให้ Excel เปิดภาษาไทยได้สมบูรณ์
  const csvContent =
    "\uFEFF" +
    [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");

  const today = new Date().toISOString().split("T")[0];

  return new Response(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="teachers_export_${today}.csv"`,
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
