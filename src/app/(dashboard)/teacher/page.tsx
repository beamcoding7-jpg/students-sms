import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { teachers, courses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, Award, CalendarDays, FileText, BookOpen, GraduationCap } from "lucide-react";
import Link from "next/link";

export default async function TeacherDashboardPage() {
  const user = await getCurrentUser();

  // ดึงข้อมูลครูและวิชาที่สอน
  const teacherProfile = user
    ? await db.select().from(teachers).where(eq(teachers.userId, user.id)).get()
    : null;

  const teacherCourses = teacherProfile
    ? await db.select().from(courses).where(eq(courses.teacherId, teacherProfile.id)).all()
    : [];

  return (
    <div className="space-y-6">
      {/* Banner ครู */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 md:p-8 text-white shadow-lg">
        <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs mb-2">
          พอร์ทัลอาจารย์ผู้สอน (Teacher Portal)
        </Badge>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          สวัสดีครับ, {user?.fullName}
        </h1>
        <p className="text-white/95 text-sm md:text-base mt-1">
          กลุ่มสาระการเรียนรู้: {teacherProfile?.department || "วิชาการ"} • ครูที่ปรึกษา: ชั้น {teacherProfile?.roomAdvisor || "ม.4/1"}
        </p>
      </div>

      {/* Quick Access Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-primary/50 transition-colors">
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

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2">
              <Award className="w-5 h-5" />
            </div>
            <CardTitle className="text-base">บันทึกคะแนน & ตัดเกรด</CardTitle>
            <CardDescription className="text-xs">
              กรอกคะแนนสอบและคำนวณเกรด 0–4
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-2">
              <CalendarDays className="w-5 h-5" />
            </div>
            <CardTitle className="text-base">ตารางสอนประจำสัปดาห์</CardTitle>
            <CardDescription className="text-xs">
              ดูคาบเรียนและห้องเรียนที่ต้องเข้าสอน
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2">
              <FileText className="w-5 h-5" />
            </div>
            <CardTitle className="text-base">การบ้านและงาน</CardTitle>
            <CardDescription className="text-xs">
              มอบหมายงานและตรวจคะแนนพร้อม Feedback
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* รายวิชาที่รับผิดชอบ */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">รายวิชาที่รับผิดชอบสอนในภาคเรียนนี้</CardTitle>
          </div>
          <CardDescription>
            รายวิชาที่ผูกกับบัญชีผู้สอนของคุณในฐานข้อมูล
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {teacherCourses.map((c) => (
              <div key={c.id} className="p-4 rounded-xl border border-border bg-card/60 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                      {c.courseCode}
                    </span>
                    <span className="font-semibold text-sm">{c.courseName}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    ระดับชั้น {c.gradeLevel} • ภาคเรียนที่ {c.semester}/{c.academicYear}
                  </p>
                </div>
                <Badge variant="outline">{c.credits} หน่วยกิต</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
