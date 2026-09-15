import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { students, teachers, courses, announcements } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, GraduationCap, BookOpen, Bell, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  // ดึงสถิติจากฐานข้อมูลจริง
  const studentCountRes = await db.select({ count: sql<number>`count(*)` }).from(students).get();
  const teacherCountRes = await db.select({ count: sql<number>`count(*)` }).from(teachers).get();
  const courseCountRes = await db.select({ count: sql<number>`count(*)` }).from(courses).get();
  const announcementCountRes = await db.select({ count: sql<number>`count(*)` }).from(announcements).get();

  const totalStudents = studentCountRes?.count ?? 0;
  const totalTeachers = teacherCountRes?.count ?? 0;
  const totalCourses = courseCountRes?.count ?? 0;
  const totalAnnouncements = announcementCountRes?.count ?? 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-primary to-indigo-700 p-6 md:p-8 text-primary-foreground shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs mb-2">
              ผู้ดูแลระบบสถานศึกษา (Admin)
            </Badge>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              ยินดีต้อนรับ, {user?.fullName}
            </h1>
            <p className="text-white/95 text-sm md:text-base mt-1 max-w-2xl">
              ระบบบริหารจัดการสถานศึกษาและข้อมูลนักเรียนแบบครบวงจร (School & Student Management System)
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-xl p-3 border border-white/20 shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-300" />
            <span className="text-xs md:text-sm font-medium">Phase 1: Foundation พร้อมสมบูรณ์</span>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              นักเรียนทั้งหมด
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{totalStudents} คน</div>
            <p className="text-xs text-muted-foreground mt-1">แบ่งตาม ม.4 และ ม.5</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              ครูและบุคลากร
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{totalTeachers} ท่าน</div>
            <p className="text-xs text-muted-foreground mt-1">ครบ 5 กลุ่มสาระฯ</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              รายวิชาที่เปิดสอน
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{totalCourses} วิชา</div>
            <p className="text-xs text-muted-foreground mt-1">ภาคเรียนที่ 1/2569</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              ประกาศข่าวสาร
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{totalAnnouncements} รายการ</div>
            <p className="text-xs text-muted-foreground mt-1">ข่าวประชาสัมพันธ์ล่าสุด</p>
          </CardContent>
        </Card>
      </div>

      {/* Roadmap Phase Progression Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">สถานะการพัฒนาระบบ (7 Phases Roadmap)</CardTitle>
          <CardDescription>
            ภาพรวมความคืบหน้าการสร้างระบบตามแผนที่ได้รับความเห็นชอบ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-200">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Phase 1: Foundation, DB, Auth & Full-Responsive Shell</p>
                  <p className="text-xs opacity-80">สร้างโครงสร้าง Next.js 15, ฐานข้อมูล SQLite ครบ 10 ตาราง, และระบบ Auth สำเร็จ</p>
                </div>
              </div>
              <Badge variant="success">เสร็จสมบูรณ์</Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                  2
                </div>
                <div>
                  <p className="font-semibold text-sm">Phase 2: โมดูลจัดการข้อมูลนักเรียนและห้องเรียน (Student CRUD)</p>
                  <p className="text-xs text-muted-foreground">ตารางรายชื่อ Data Table, ค้นหา, กรองระดับชั้น, ฟอร์มเพิ่ม/แก้ไข, Export CSV</p>
                </div>
              </div>
              <Badge variant="outline">ขั้นตอนถัดไป</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
