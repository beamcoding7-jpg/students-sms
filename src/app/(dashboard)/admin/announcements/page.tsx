import React from "react";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { announcements, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { AdminAnnouncementsClient } from "@/components/announcements/AdminAnnouncementsClient";
import { AnnouncementItem } from "@/components/announcements/AnnouncementCard";

export const metadata = {
  title: "ระบบประกาศข่าวสารและประชาสัมพันธ์ | SMS School Portal",
  description: "ระบบบริหารจัดการข่าวสาร ประกาศ และกิจกรรมสำคัญของสถานศึกษา",
};

export default async function AdminAnnouncementsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    redirect("/login");
  }

  // ดึงประกาศทั้งหมดเรียงตามวันที่สร้าง
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
    .all();

  const formatted: AnnouncementItem[] = rawAnnouncements.map((a) => ({
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

  return <AdminAnnouncementsClient initialAnnouncements={formatted} />;
}
