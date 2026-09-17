import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  students,
  teachers,
  courses,
  announcements,
  users,
} from "@/lib/db/schema";
import { sql, desc, eq } from "drizzle-orm";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  GraduationCap,
  BookOpen,
  Bell,
  CheckCircle2,
  CalendarCheck,
  CalendarDays,
  Award,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { AnnouncementFeed } from "@/components/announcements/AnnouncementFeed";
import { AnnouncementItem } from "@/components/announcements/AnnouncementCard";

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

  // ดึงประกาศข่าวสารทั้งหมด
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
    .limit(5)
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

  const quickLinks = [
    { title: "ข้อมูลนักเรียน", desc: "จัดการทะเบียนประวัติและรายชื่อ", href: "/admin/students", icon: Users, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/50" },
    { title: "ครูและบุคลากร", desc: "ข้อมูลครูประจำการและกลุ่มสาระฯ", href: "/admin/teachers", icon: GraduationCap, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50" },
    { title: "หลักสูตรรายวิชา", desc: "จัดการรายวิชาและหน่วยกิต", href: "/admin/courses", icon: BookOpen, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50" },
    { title: "สถิติการเข้าเรียน", desc: "ตรวจสอบเวลาเรียนและกลุ่มเสี่ยง", href: "/admin/attendance", icon: CalendarCheck, color: "text-teal-600 bg-teal-50 dark:bg-teal-950/50" },
    { title: "ตารางเรียน/สอน", desc: "จัดการตารางเรียนและห้องเรียน", href: "/admin/schedules", icon: CalendarDays, color: "text-purple-600 bg-purple-50 dark:bg-purple-950/50" },
    { title: "ผลการเรียนภาพรวม", desc: "ทรานสคริปต์และจัดอันดับเกรด", href: "/admin/grades", icon: Award, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/50" },
    { title: "ประกาศข่าวสาร", desc: "เผยแพร่ข่าวและปักหมุดประกาศ", href: "/admin/announcements", icon: Bell, color: "text-rose-600 bg-rose-50 dark:bg-rose-950/50" },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-primary to-indigo-700 p-6 md:p-8 text-primary-foreground shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs mb-2">
              ผู้ดูแลระบบสถานศึกษา (Admin Portal)
            </Badge>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              ยินดีต้อนรับ, {user?.fullName}
            </h1>
            <p className="text-white/95 text-sm md:text-base mt-1 max-w-2xl">
              ระบบบริหารจัดการสถานศึกษาและข้อมูลนักเรียนแบบครบวงจร (School & Student Management System)
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-xl p-3 border border-white/20 shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-300" />
            <span className="text-xs md:text-sm font-medium">ระบบพร้อมสมบูรณ์ครบ 7 โมดูล</span>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="hover:shadow-xs transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              นักเรียนทั้งหมด
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{totalStudents} คน</div>
            <p className="text-[11px] text-muted-foreground mt-1">ม.4 และ ม.5 ในระบบ</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xs transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              ครูและบุคลากร
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{totalTeachers} ท่าน</div>
            <p className="text-[11px] text-muted-foreground mt-1">ครบทุกกลุ่มสาระฯ</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xs transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              รายวิชาที่เปิดสอน
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{totalCourses} วิชา</div>
            <p className="text-[11px] text-muted-foreground mt-1">ภาคเรียนที่ 1/2569</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xs transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              ประกาศข่าวสาร
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{totalAnnouncements} รายการ</div>
            <p className="text-[11px] text-muted-foreground mt-1">ข่าวสารในระบบ</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Modules Grid */}
      <div className="space-y-3">
        <h2 className="font-bold text-base md:text-lg text-foreground tracking-tight">
          โมดูลการบริหารจัดการสถานศึกษา
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href} className="group">
                <div className="p-4 rounded-2xl border border-border bg-card hover:border-primary/50 transition-all shadow-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${link.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                        {link.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {link.desc}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Announcements Feed Section */}
      <AnnouncementFeed
        announcements={announcementItems}
        userRole="admin"
        maxDisplay={4}
        title="ประกาศข่าวสารล่าสุดของโรงเรียน"
      />
    </div>
  );
}
