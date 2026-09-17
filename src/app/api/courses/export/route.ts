import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { courses, teachers, users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search")?.toLowerCase().trim() || "";
  const grade = searchParams.get("grade") || "all";
  const sem = searchParams.get("sem") || "all";

  // ดึงข้อมูลวิชาทั้งหมด
  const allCourses = await db
    .select({
      id: courses.id,
      courseCode: courses.courseCode,
      courseName: courses.courseName,
      credits: courses.credits,
      gradeLevel: courses.gradeLevel,
      semester: courses.semester,
      academicYear: courses.academicYear,
      teacherName: users.fullName,
      teacherDept: teachers.department,
      enrolledCount: sql<number>`(SELECT COUNT(*) FROM enrollments WHERE enrollments.course_id = ${courses.id})`,
    })
    .from(courses)
    .leftJoin(teachers, eq(courses.teacherId, teachers.id))
    .leftJoin(users, eq(teachers.userId, users.id))
    .orderBy(courses.gradeLevel, courses.courseCode)
    .all();

  // กรองตามเงื่อนไข
  const filtered = allCourses.filter((c) => {
    const matchSearch =
      !search ||
      c.courseCode.toLowerCase().includes(search) ||
      c.courseName.toLowerCase().includes(search) ||
      (c.teacherName && c.teacherName.toLowerCase().includes(search));

    const matchGrade = grade === "all" || c.gradeLevel === grade;
    const matchSem = sem === "all" || String(c.semester) === sem;

    return matchSearch && matchGrade && matchSem;
  });

  const escapeCsv = (val: string | number | null | undefined) => {
    if (val === null || val === undefined) return '""';
    return `"${String(val).replace(/"/g, '""')}"`;
  };

  const headers = [
    "ลำดับ",
    "รหัสวิชา",
    "ชื่อรายวิชา",
    "หน่วยกิต",
    "ระดับชั้น",
    "ภาคเรียน",
    "ปีการศึกษา",
    "อาจารย์ผู้สอน",
    "กลุ่มสาระการเรียนรู้",
    "จำนวนนักเรียนที่ลงทะเบียน",
  ];

  const rows = filtered.map((c, idx) => [
    idx + 1,
    escapeCsv(c.courseCode),
    escapeCsv(c.courseName),
    escapeCsv(c.credits.toFixed(1)),
    escapeCsv(c.gradeLevel),
    escapeCsv(`ภาคเรียนที่ ${c.semester}`),
    escapeCsv(c.academicYear),
    escapeCsv(c.teacherName || "ยังไม่ระบุ"),
    escapeCsv(c.teacherDept || "-"),
    escapeCsv(c.enrolledCount || 0),
  ]);

  // UTF-8 Byte Order Mark (\uFEFF) สำหรับ Excel
  const csvContent =
    "\uFEFF" +
    [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");

  const today = new Date().toISOString().split("T")[0];

  return new Response(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="courses_export_${today}.csv"`,
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
