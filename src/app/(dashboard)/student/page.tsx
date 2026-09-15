import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { students, enrollments, courses, grades, attendance } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, CalendarCheck, CalendarDays, FileText, UserCheck, BookOpen } from "lucide-react";

export default async function StudentDashboardPage() {
  const user = await getCurrentUser();

  // ดึงข้อมูลนักเรียน
  const studentProfile = user
    ? await db.select().from(students).where(eq(students.userId, user.id)).get()
    : null;

  // ดึงผลการเรียนและคำนวณ GPA เบื้องต้น
  const studentGrades = studentProfile
    ? await db.select().from(grades).where(eq(grades.studentId, studentProfile.id)).all()
    : [];

  let totalPoints = 0;
  studentGrades.forEach((g) => {
    totalPoints += parseFloat(g.gradeLetter) || 0;
  });
  const gpa = studentGrades.length > 0 ? (totalPoints / studentGrades.length).toFixed(2) : "4.00";

  // ดึงประวัติเข้าเรียนล่าสุด
  const recentAttendance = studentProfile
    ? await db.select().from(attendance).where(eq(attendance.studentId, studentProfile.id)).all()
    : [];

  const presentCount = recentAttendance.filter((a) => a.status === "present").length;
  const attendanceRate = recentAttendance.length > 0
    ? Math.round((presentCount / recentAttendance.length) * 100)
    : 100;

  return (
    <div className="space-y-6">
      {/* Banner นักเรียน */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 p-6 md:p-8 text-white shadow-lg">
        <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs mb-2">
          พอร์ทัลนักเรียน (Student Portal)
        </Badge>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          สวัสดีจ้ะ, {user?.fullName}
        </h1>
        <p className="text-white/95 text-sm md:text-base mt-1">
          รหัสประจำตัว: <span className="font-mono font-bold text-white">{studentProfile?.studentCode || "STU-1001"}</span> • ชั้นมัธยมศึกษาปีที่ {studentProfile?.gradeLevel}/{studentProfile?.classroom}
        </p>
      </div>

      {/* สรุปสถิตินักเรียน 3 การ์ด */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">เกรดเฉลี่ยสะสม (GPA)</CardTitle>
            <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{gpa}</div>
            <p className="text-xs text-muted-foreground mt-1">จากทั้งหมด {studentGrades.length} รายวิชา</p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">สถิติการมาเรียน</CardTitle>
            <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{attendanceRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">มาเรียน {presentCount} จาก {recentAttendance.length} วันทำการ</p>
          </CardContent>
        </Card>

        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">วิชาที่ลงทะเบียน</CardTitle>
            <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">6 วิชา</div>
            <p className="text-xs text-muted-foreground mt-1">ภาคเรียนที่ 1/2569</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <Award className="w-6 h-6 text-primary mb-2" />
            <CardTitle className="text-base">ผลการเรียนและทรานสคริปต์</CardTitle>
            <CardDescription className="text-xs">ตรวจสอบคะแนนสอบและเกรดเฉลี่ย</CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <CalendarCheck className="w-6 h-6 text-primary mb-2" />
            <CardTitle className="text-base">ประวัติการเข้าเรียน</CardTitle>
            <CardDescription className="text-xs">ตรวจดูวันมา สาย ขาด และใบลา</CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <CalendarDays className="w-6 h-6 text-primary mb-2" />
            <CardTitle className="text-base">ตารางเรียนสัปดาห์นี้</CardTitle>
            <CardDescription className="text-xs">ดูคาบเรียนและห้องเรียนประจำวัน</CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <FileText className="w-6 h-6 text-primary mb-2" />
            <CardTitle className="text-base">การบ้านและส่งงาน</CardTitle>
            <CardDescription className="text-xs">ตรวจดูรายการงานที่ต้องส่ง</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
