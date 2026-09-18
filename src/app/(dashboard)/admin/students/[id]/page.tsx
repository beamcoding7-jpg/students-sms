import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { students, users, courses, enrollments, grades, attendance, teachers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { calculateGPA } from "@/lib/validations/grade";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Calendar,
  BookOpen,
  Award,
  CalendarCheck,
  Printer,
  ShieldCheck,
} from "lucide-react";

interface StudentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentDetailPage({ params }: StudentDetailPageProps) {
  const { id } = await params;

  // ดึงข้อมูลนักเรียนพร้อมผู้ใช้
  const student = await db
    .select({
      id: students.id,
      userId: students.userId,
      studentCode: students.studentCode,
      nationalId: students.nationalId,
      gradeLevel: students.gradeLevel,
      classroom: students.classroom,
      dateOfBirth: students.dateOfBirth,
      parentName: students.parentName,
      parentPhone: students.parentPhone,
      fullName: users.fullName,
      email: users.email,
      createdAt: users.createdAt,
    })
    .from(students)
    .innerJoin(users, eq(students.userId, users.id))
    .where(eq(students.id, id))
    .get();

  if (!student) {
    notFound();
  }

  // ดึงรายวิชาที่ลงทะเบียน
  const enrolledCourses = await db
    .select({
      enrollmentId: enrollments.id,
      courseCode: courses.courseCode,
      courseName: courses.courseName,
      credits: courses.credits,
      semester: courses.semester,
      academicYear: courses.academicYear,
      teacherName: users.fullName,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .leftJoin(teachers, eq(courses.teacherId, teachers.id))
    .leftJoin(users, eq(teachers.userId, users.id))
    .where(eq(enrollments.studentId, student.id))
    .all();

  // ดึงผลการเรียน
  const studentGrades = await db
    .select({
      id: grades.id,
      courseId: grades.courseId,
      homeworkScore: grades.homeworkScore,
      midtermScore: grades.midtermScore,
      finalScore: grades.finalScore,
      totalScore: grades.totalScore,
      gradeLetter: grades.gradeLetter,
      courseName: courses.courseName,
      courseCode: courses.courseCode,
      credits: courses.credits,
    })
    .from(grades)
    .innerJoin(courses, eq(grades.courseId, courses.id))
    .where(eq(grades.studentId, student.id))
    .all();

  // คำนวณ GPA ตามสูตรถ่วงน้ำหนักมาตรฐาน (Weighted GPA)
  const { gpa: weightedGPA } = calculateGPA(
    studentGrades.map((g) => ({ credits: g.credits, gradeLetter: g.gradeLetter }))
  );
  const gpa = studentGrades.length > 0 ? weightedGPA.toFixed(2) : "4.00";

  // ดึงสถิติการเข้าเรียน
  const studentAttendance = await db
    .select()
    .from(attendance)
    .where(eq(attendance.studentId, student.id))
    .all();

  const presentCount = studentAttendance.filter((a) => a.status === "present").length;
  const lateCount = studentAttendance.filter((a) => a.status === "late").length;
  const leaveCount = studentAttendance.filter((a) => a.status === "leave").length;
  const absentCount = studentAttendance.filter((a) => a.status === "absent").length;

  const attendanceRate = studentAttendance.length > 0
    ? Math.round((presentCount / studentAttendance.length) * 100)
    : 100;

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: "ข้อมูลนักเรียน", href: "/admin/students" },
          { label: `${student.studentCode} ${student.fullName}` },
        ]}
        homeHref="/admin"
      />

      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/admin/students"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับไปยังทะเบียนนักเรียน</span>
        </Link>
      </div>

      {/* Student Header Profile Card */}
      <div className="rounded-2xl bg-gradient-to-r from-primary to-indigo-700 p-6 md:p-8 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur text-white flex items-center justify-center font-extrabold text-3xl border border-white/20 shrink-0">
            {student.fullName.charAt(0)}
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="font-mono bg-white/20 text-white border-0 text-xs">
                {student.studentCode}
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                ชั้นมัธยมศึกษาปีที่ {student.gradeLevel}/{student.classroom}
              </Badge>
              <Badge variant="secondary" className="bg-emerald-500/80 text-white border-0 text-xs">
                สถานะ: กำลังศึกษา
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {student.fullName}
            </h1>
            <p className="text-primary-100 text-sm flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" />
              <span>{student.email}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Grid ข้อมูล 2 คอลัมน์ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* คอลัมน์ซ้าย: ข้อมูลส่วนตัว & ผู้ปกครอง */}
        <div className="space-y-6 lg:col-span-1">
          {/* ข้อมูลทั่วไป */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <CardTitle className="text-base">ข้อมูลส่วนตัว</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm divide-y divide-border">
              <div className="pt-2 flex justify-between">
                <span className="text-muted-foreground">รหัสประจำตัว:</span>
                <span className="font-mono font-bold text-foreground">{student.studentCode}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-muted-foreground">ระดับชั้น:</span>
                <span className="font-medium text-foreground">{student.gradeLevel} ห้อง {student.classroom}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-muted-foreground">เลขประจำตัวประชาชน:</span>
                <span className="font-mono text-foreground">{student.nationalId || "-"}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-muted-foreground">วันเดือนปีเกิด:</span>
                <span className="text-foreground">{student.dateOfBirth || "-"}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-muted-foreground">วันที่ลงทะเบียน:</span>
                <span className="text-foreground">{student.createdAt.slice(0, 10)}</span>
              </div>
            </CardContent>
          </Card>

          {/* ข้อมูลผู้ปกครอง */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <CardTitle className="text-base">ข้อมูลผู้ปกครอง</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">ชื่อ-นามสกุล ผู้ปกครอง</p>
                <p className="font-semibold text-foreground mt-0.5">{student.parentName || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">เบอร์โทรศัพท์ติดต่อ</p>
                {student.parentPhone ? (
                  <a
                    href={`tel:${student.parentPhone}`}
                    className="inline-flex items-center gap-2 font-mono font-bold text-primary hover:underline mt-0.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{student.parentPhone}</span>
                  </a>
                ) : (
                  <p className="text-muted-foreground mt-0.5">-</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* สถิติการเข้าเรียนย่อ */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-primary" />
                <CardTitle className="text-base">สถิติการเข้าเรียน</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">อัตราการมาเรียน:</span>
                <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                  {attendanceRate}%
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                  <p className="font-bold">{presentCount}</p>
                  <p className="text-[10px]">มาเรียน</p>
                </div>
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300">
                  <p className="font-bold">{lateCount}</p>
                  <p className="text-[10px]">สาย</p>
                </div>
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-300">
                  <p className="font-bold">{leaveCount}</p>
                  <p className="text-[10px]">ลา</p>
                </div>
                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-300">
                  <p className="font-bold">{absentCount}</p>
                  <p className="text-[10px]">ขาด</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* คอลัมน์ขวา: รายวิชาที่ลงทะเบียนเรียน & ผลการเรียน */}
        <div className="space-y-6 lg:col-span-2">
          {/* สรุปเกรดเฉลี่ย */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">เกรดเฉลี่ยสะสม (GPA)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-primary">{gpa}</div>
                <p className="text-xs text-muted-foreground mt-1">ประเมินจากวิชาที่บันทึกคะแนนแล้ว</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">จำนวนวิชาที่ลงทะเบียน</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-foreground">{enrolledCourses.length} วิชา</div>
                <p className="text-xs text-muted-foreground mt-1">ภาคเรียนที่ 1/2569</p>
              </CardContent>
            </Card>
          </div>

          {/* ตารางรายวิชาและคะแนน */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">หลักสูตรรายวิชาที่ลงทะเบียน</CardTitle>
                </div>
                <Badge variant="outline">{enrolledCourses.length} วิชา</Badge>
              </div>
              <CardDescription>
                แสดงรายวิชา หน่วยกิต อาจารย์ผู้สอน และผลการเรียนเบื้องต้น
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border text-xs text-muted-foreground uppercase">
                    <tr>
                      <th scope="col" className="py-2.5 px-3">รหัสวิชา</th>
                      <th scope="col" className="py-2.5 px-3">ชื่อรายวิชา</th>
                      <th scope="col" className="py-2.5 px-3">หน่วยกิต</th>
                      <th scope="col" className="py-2.5 px-3">อาจารย์ผู้สอน</th>
                      <th scope="col" className="py-2.5 px-3 text-right">เกรด</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {enrolledCourses.map((c) => {
                      const gradeRecord = studentGrades.find((g) => g.courseCode === c.courseCode);
                      return (
                        <tr key={c.enrollmentId} className="hover:bg-muted/40 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-primary">
                            {c.courseCode}
                          </td>
                          <td className="py-3 px-3 font-medium text-foreground">
                            {c.courseName}
                          </td>
                          <td className="py-3 px-3 text-muted-foreground">
                            {c.credits}
                          </td>
                          <td className="py-3 px-3 text-muted-foreground text-xs">
                            {c.teacherName || "อ.สมชาย ทองดี"}
                          </td>
                          <td className="py-3 px-3 text-right font-bold font-mono">
                            {gradeRecord ? (
                              <Badge variant="secondary" className="font-mono">
                                {gradeRecord.gradeLetter}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
