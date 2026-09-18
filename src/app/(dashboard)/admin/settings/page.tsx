import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  users,
  students,
  teachers,
  courses,
  attendance,
  grades,
  announcements,
} from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { SCHOOL_CONFIG } from "@/config/school";
import { AdminSettingsClient } from "./AdminSettingsClient";

export const metadata = {
  title: "ตั้งค่าสถานศึกษาและระบบ | ระบบบริหารจัดการสถานศึกษา",
  description: "ตั้งค่าข้อมูลทั่วไปของโรงเรียน ภาคเรียน และตรวจสอบความปลอดภัยระบบ",
};

export default async function AdminSettingsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    redirect("/login");
  }

  // ดึงสถิติจริงจากฐานข้อมูล
  const userCountRes = await db.select({ count: sql<number>`count(*)` }).from(users).get();
  const studentCountRes = await db.select({ count: sql<number>`count(*)` }).from(students).get();
  const teacherCountRes = await db.select({ count: sql<number>`count(*)` }).from(teachers).get();
  const courseCountRes = await db.select({ count: sql<number>`count(*)` }).from(courses).get();
  const attendanceCountRes = await db.select({ count: sql<number>`count(*)` }).from(attendance).get();
  const gradeCountRes = await db.select({ count: sql<number>`count(*)` }).from(grades).get();
  const announcementCountRes = await db.select({ count: sql<number>`count(*)` }).from(announcements).get();

  const isTurso = Boolean(process.env.TURSO_DATABASE_URL);

  const stats = {
    totalUsers: userCountRes?.count ?? 0,
    totalStudents: studentCountRes?.count ?? 0,
    totalTeachers: teacherCountRes?.count ?? 0,
    totalCourses: courseCountRes?.count ?? 0,
    totalAttendance: attendanceCountRes?.count ?? 0,
    totalGrades: gradeCountRes?.count ?? 0,
    totalAnnouncements: announcementCountRes?.count ?? 0,
    dbEngine: isTurso ? "Turso LibSQL (Cloud Serverless)" : "SQLite (better-sqlite3 / WAL Mode)",
    nodeEnv: process.env.NODE_ENV || "production",
    appVersion: "v1.0.0 (Production Release)",
  };

  return <AdminSettingsClient initialConfig={SCHOOL_CONFIG} stats={stats} />;
}
