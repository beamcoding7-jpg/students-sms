import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  teachers,
  courses,
  announcements,
  assignments,
  submissions,
  users,
} from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarCheck,
  Award,
  CalendarDays,
  FileText,
  BookOpen,
  GraduationCap,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { AnnouncementFeed } from "@/components/announcements/AnnouncementFeed";
import { AnnouncementItem } from "@/components/announcements/AnnouncementCard";

export default async function TeacherDashboardPage() {
  const user = await getCurrentUser();

  // 1. ดึงข้อมูลครูและวิชาที่สอน
  const teacherProfile = user
    ? await db.select().from(teachers).where(eq(teachers.userId, user.id)).get()
    : null;

  const teacherCourses = teacherProfile
    ? await db.select().from(courses).where(eq(courses.teacherId, teacherProfile.id)).all()
    : [];

  const courseIds = teacherCourses.map((c) => c.id);

  // 2. ดึงสถิติการบ้าน
  let totalAssignments = 0;
  let pendingSubmissions = 0;

  if (courseIds.length > 0) {
    const asgs = await db
      .select({ id: assignments.id })
      .from(assignments)
      .where(sql`${assignments.courseId} IN (${sql.join(courseIds.map((id) => sql`${id}`), sql`, `)})`)
      .all();

    totalAssignments = asgs.length;

    if (asgs.length > 0) {
      const asgIds = asgs.map((a) => a.id);
      const subs = await db
        .select({ status: submissions.status })
        .from(submissions)
        .where(sql`${submissions.assignmentId} IN (${sql.join(asgIds.map((id) => sql`${id}`), sql`, `)})`)
        .all();

      pendingSubmissions = subs.filter((s) => s.status !== "graded").length;
    }
  }

  // 3. ดึงประกาศข่าวสาร
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
      {/* Banner ครู */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 md:p-8 text-white shadow-lg">
        <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs mb-2">
          พอร์ทัลอาจารย์ผู้สอน (Teacher Portal)
        </Badge>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          สวัสดีครับ, {user?.fullName}
        </h1>
        <p className="text-white/95 text-sm md:text-base mt-1">
          กลุ่มสาระการเรียนรู้: {teacherProfile?.department || "วิทยาศาสตร์และเทคโนโลยี"} • ครูที่ปรึกษา: ชั้น {teacherProfile?.roomAdvisor || "ม.4/1"}
        </p>
      </div>

      {/* Quick Access Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Link href="/teacher/attendance">
          <Card className="hover:border-primary/50 transition-all shadow-xs h-full cursor-pointer">
            <CardHeader className="pb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <CardTitle className="text-base">เช็คชื่อประจำวัน</CardTitle>
              <CardDescription className="text-xs">
                บันทึกการมาเรียนของนักเรียนห้อง {teacherProfile?.roomAdvisor || "ม.4/1"}
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/teacher/grades">
          <Card className="hover:border-primary/50 transition-all shadow-xs h-full cursor-pointer">
            <CardHeader className="pb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2">
                <Award className="w-5 h-5" />
              </div>
              <CardTitle className="text-base">บันทึกคะแนน & ตัดเกรด</CardTitle>
              <CardDescription className="text-xs">
                กรอกคะแนนสอบและตัดเกรด 8 ระดับอัตโนมัติ
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/teacher/assignments">
          <Card className="hover:border-primary/50 transition-all shadow-xs h-full cursor-pointer">
            <CardHeader className="pb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2">
                <FileText className="w-5 h-5" />
              </div>
              <CardTitle className="text-base">การบ้าน & ตรวจงาน</CardTitle>
              <CardDescription className="text-xs">
                มอบหมายงาน {totalAssignments} ชิ้น • รอตรวจ {pendingSubmissions} รายการ
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/teacher/schedule">
          <Card className="hover:border-primary/50 transition-all shadow-xs h-full cursor-pointer">
            <CardHeader className="pb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2">
                <CalendarDays className="w-5 h-5" />
              </div>
              <CardTitle className="text-base">ตารางสอนประจำสัปดาห์</CardTitle>
              <CardDescription className="text-xs">
                ดูตารางสอน 5 วันทำการและพิมพ์ตาราง
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Announcements Feed for Teachers */}
      <AnnouncementFeed
        announcements={announcementItems}
        userRole="teacher"
        maxDisplay={3}
        title="ประกาศและข่าวประชาสัมพันธ์สำหรับครู"
      />
    </div>
  );
}
