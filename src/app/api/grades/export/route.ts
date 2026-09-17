import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { grades, students, users, courses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "teacher")) {
    return new Response("Unauthorized", { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const gradeLevel = searchParams.get("gradeLevel");
  const courseId = searchParams.get("courseId");
  const query = searchParams.get("query")?.toLowerCase();

  // 1. ดึงข้อมูลผลการเรียนทั้งหมด
  const allRecords = await db
    .select({
      id: grades.id,
      studentCode: students.studentCode,
      studentName: users.fullName,
      gradeLevel: students.gradeLevel,
      classroom: students.classroom,
      courseCode: courses.courseCode,
      courseName: courses.courseName,
      credits: courses.credits,
      semester: courses.semester,
      academicYear: courses.academicYear,
      homeworkScore: grades.homeworkScore,
      midtermScore: grades.midtermScore,
      finalScore: grades.finalScore,
      totalScore: grades.totalScore,
      gradeLetter: grades.gradeLetter,
    })
    .from(grades)
    .innerJoin(students, eq(grades.studentId, students.id))
    .innerJoin(users, eq(students.userId, users.id))
    .innerJoin(courses, eq(grades.courseId, courses.id))
    .all();

  // 2. กรองข้อมูลตาม Parameters
  const filtered = allRecords.filter((r) => {
    if (gradeLevel && gradeLevel !== "all" && r.gradeLevel !== gradeLevel) {
      return false;
    }
    if (courseId && courseId !== "all" && r.courseCode !== courseId && r.id !== courseId) {
      // ตรวจสอบทั้ง id และ courseCode
      return false;
    }
    if (query) {
      const match =
        r.studentName.toLowerCase().includes(query) ||
        r.studentCode.toLowerCase().includes(query) ||
        r.courseName.toLowerCase().includes(query) ||
        r.courseCode.toLowerCase().includes(query);
      if (!match) return false;
    }
    return true;
  });

  const escapeCsv = (val: string | number | null | undefined) => {
    if (val === null || val === undefined) return '""';
    const str = String(val);
    return `"${str.replace(/"/g, '""')}"`;
  };

  const headers = [
    "ลำดับ",
    "รหัสนักเรียน",
    "ชื่อ-นามสกุล",
    "ระดับชั้น",
    "ห้องเรียน",
    "รหัสวิชา",
    "ชื่อรายวิชา",
    "หน่วยกิต",
    "ภาคเรียน",
    "ปีการศึกษา",
    "คะแนนเก็บ (50)",
    "คะแนนกลางภาค (20)",
    "คะแนนปลายภาค (30)",
    "คะแนนรวม (100)",
    "ระดับผลการเรียน (เกรด)",
    "สถานะผลการเรียน",
  ];

  const rows = filtered.map((r, index) => {
    const isPassed = parseFloat(r.gradeLetter) >= 1.0;
    return [
      escapeCsv(index + 1),
      escapeCsv(r.studentCode),
      escapeCsv(r.studentName),
      escapeCsv(r.gradeLevel),
      escapeCsv(r.classroom),
      escapeCsv(r.courseCode),
      escapeCsv(r.courseName),
      escapeCsv(r.credits),
      escapeCsv(r.semester),
      escapeCsv(r.academicYear),
      escapeCsv(r.homeworkScore),
      escapeCsv(r.midtermScore),
      escapeCsv(r.finalScore),
      escapeCsv(r.totalScore),
      escapeCsv(r.gradeLetter),
      escapeCsv(isPassed ? "ผ่านเกณฑ์" : "ไม่ผ่านเกณฑ์"),
    ].join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\r\n");
  const bomBytes = new Uint8Array([0xef, 0xbb, 0xbf]);
  const textBytes = new TextEncoder().encode(csvContent);
  const fullBytes = new Uint8Array(bomBytes.length + textBytes.length);
  fullBytes.set(bomBytes);
  fullBytes.set(textBytes, bomBytes.length);

  const todayStr = new Date().toISOString().split("T")[0];

  return new Response(fullBytes, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="sms_grades_export_${todayStr}.csv"`,
    },
  });
}
