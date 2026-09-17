import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  students,
  enrollments,
  courses,
  grades,
  attendance,
  announcements,
  assignments,
  submissions,
  users,
} from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  CalendarCheck,
  CalendarDays,
  FileText,
  UserCheck,
  BookOpen,
  ArrowRight,
  Clock,
  Send,
} from "lucide-react";
import Link from "next/link";
import { AnnouncementFeed } from "@/components/announcements/AnnouncementFeed";
import { AnnouncementItem } from "@/components/announcements/AnnouncementCard";
import { calculateGPA } from "@/lib/validations/grade";

export default async function StudentDashboardPage() {
  const user = await getCurrentUser();

  // 1. ดึงข้อมูลนักเรียน
  const studentProfile = user
    ? await db.select().from(students).where(eq(students.userId, user.id)).get()
    : null;

  if (!studentProfile) {
    return null;
  }

  // 2. ดึงผลการเรียนและคำนวณ GPA ตามสูตรถ่วงน้ำหนัก
  const enrolledGrades = await db
    .select({
      credits: courses.credits,
      gradeLetter: grades.gradeLetter,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .leftJoin(
      grades,
      and(
        eq(grades.studentId, studentProfile.id),
        eq(grades.courseId, courses.id)
      )
    )
    .where(eq(enrollments.studentId, studentProfile.id))
    .all();

  const { gpa, totalCredits, passedCredits } = calculateGPA(
    enrolledGrades.map((g) => ({
      credits: g.credits,
      gradeLetter: g.gradeLetter || "0",
    }))
  );

  // 3. ดึงประวัติเข้าเรียนล่าสุด
  const recentAttendance = await db
    .select()
    .from(attendance)
    .where(eq(attendance.studentId, studentProfile.id))
    .all();

  const presentCount = recentAttendance.filter((a) => a.status === "present").length;
  const attendanceRate = recentAttendance.length > 0
    ? Math.round((presentCount / recentAttendance.length) * 100)
    : 100;

  // 4. ดึงการบ้านที่นักเรียนต้องทำ (Pending)
  const enrolledCourses = await db
    .select({ courseId: enrollments.courseId })
    .from(enrollments)
    .where(eq(enrollments.studentId, studentProfile.id))
    .all();

  const courseIds = enrolledCourses.map((c) => c.courseId);

  let pendingHomeworkCount = 0;
  if (courseIds.length > 0) {
    const allAssignments = await db
      .select({ id: assignments.id, courseId: assignments.courseId })
      .from(assignments)
      .all();

    const studentAssignments = allAssignments.filter((a) =>
      courseIds.includes(a.courseId)
    );

    const studentSubs = await db
      .select({ assignmentId: submissions.assignmentId })
      .from(submissions)
      .where(eq(submissions.studentId, studentProfile.id))
      .all();

    const submittedAsgIds = studentSubs.map((s) => s.assignmentId);
    pendingHomeworkCount = studentAssignments.filter(
      (a) => !submittedAsgIds.includes(a.id)
    ).length;
  }

  // 5. ดึงประกาศข่าวสาร
  const rawAnnouncements = await db
    .select({
      id: announcements.id,
      title: announcements.title,
      content: announcements.content,
      category: announcements.category,
      authorId: announcements.authorId,
      authorName: users.fullName,
      targetRole: announcements.targetRole,
      isPinned: announcements.isPinned,
      createdAt: announcements.createdAt,
    })
    .from(announcements)
    .innerJoin(users, eq(announcements.authorId, users.id))
    .orderBy(desc(announcements.createdAt))
    .limit(4)
    .all();

  const announcementItems: AnnouncementItem[] = rawAnnouncements.map((a) => ({
    id: a.id,
    title: a.title,
    content: a.content,
    category: a.category as any,
    authorId: a.authorId,
    authorName: a.authorName,
    targetRole: a.targetRole as any,
    isPinned: Boolean(a.isPinned),
    createdAt: a.createdAt,
  }));

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
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

      {/* สรุปสถิตินักเรียน 4 การ์ด */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Link href="/student/grades">
          <Card className="border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/60 transition-all shadow-xs h-full cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">เกรดเฉลี่ยสะสม (GPA)</CardTitle>
              <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-700 dark:text-emerald-300">
                {gpa.toFixed(2)}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">ผ่าน {passedCredits}/{totalCredits} หน่วยกิต</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/student/assignments">
          <Card className="border-blue-500/30 bg-blue-500/5 hover:border-blue-500/60 transition-all shadow-xs h-full cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">การบ้านที่ต้องทำ</CardTitle>
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-blue-700 dark:text-blue-300">
                {pendingHomeworkCount} ชิ้น
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                {pendingHomeworkCount > 0 ? "มีงานที่ต้องส่ง" : "ส่งครบทุกงานแล้ว"}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/student/attendance">
          <Card className="border-teal-500/30 bg-teal-500/5 hover:border-teal-500/60 transition-all shadow-xs h-full cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">สถิติเวลาเรียน</CardTitle>
              <CalendarCheck className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-teal-700 dark:text-teal-300">
                {attendanceRate}%
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">เกณฑ์ขั้นต่ำ 80% มีสิทธิ์สอบ</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/student/timetable">
          <Card className="border-purple-500/30 bg-purple-500/5 hover:border-purple-500/60 transition-all shadow-xs h-full cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">ตารางเรียนสัปดาห์นี้</CardTitle>
              <CalendarDays className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-purple-700 dark:text-purple-300">
                ม.4/1
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">ตารางเรียน 5 วันทำการ</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Announcements Feed for Students */}
      <AnnouncementFeed
        announcements={announcementItems}
        userRole="student"
        maxDisplay={3}
        title="ประกาศและกิจกรรมสำหรับนักเรียน"
      />
    </div>
  );
}
