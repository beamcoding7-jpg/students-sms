"use client";

import React, { useState, useMemo } from "react";
import { AnnouncementItem, AnnouncementCard, CATEGORY_CONFIG } from "./AnnouncementCard";
import { Bell, Filter, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnnouncementFeedProps {
  announcements: AnnouncementItem[];
  userRole?: "admin" | "teacher" | "student";
  maxDisplay?: number;
  title?: string;
  className?: string;
}

export function AnnouncementFeed({
  announcements,
  userRole = "student",
  maxDisplay,
  title = "กระดานข่าวสารและประกาศโรงเรียน",
  className,
}: AnnouncementFeedProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // กรองตามสิทธิ์การมองเห็น (targetRole) และหมวดหมู่ที่เลือก
  const filtered = useMemo(() => {
    return announcements.filter((item) => {
      // 1. เช็คสิทธิ์การเข้าถึง
      if (userRole !== "admin") {
        if (item.targetRole !== "all" && item.targetRole !== userRole) {
          return false;
        }
      }

      // 2. เช็คหมวดหมู่
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }

      return true;
    });
  }, [announcements, userRole, selectedCategory]);

  // เรียงลำดับ: ข่าวที่ปักหมุด (isPinned) ขึ้นก่อน แล้วเรียงตามวันที่ล่าสุด
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [filtered]);

  const displayedItems = maxDisplay ? sorted.slice(0, maxDisplay) : sorted;

  const categories = [
    { id: "all", label: "ทั้งหมด" },
    { id: "urgent", label: "ข่าวด่วน 🚨" },
    { id: "academic", label: "วิชาการ" },
    { id: "activity", label: "กิจกรรม" },
    { id: "general", label: "ทั่วไป" },
  ];

  return (
    <div className={cn("space-y-4", className)}>
      {/* ส่วนหัว Feed พร้อมแถบตัวกรองหมวดหมู่ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-base md:text-lg text-foreground tracking-tight">
              {title}
            </h2>
            <p className="text-xs text-muted-foreground">
              อัปเดตข้อมูลข่าวสาร กิจกรรม และประกาศสำคัญของสถานศึกษา
            </p>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* รายการการ์ดข่าวสาร */}
      {displayedItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center bg-card text-muted-foreground text-sm">
          ไม่พบข่าวสารในหมวดหมู่นี้
        </div>
      ) : (
        <div className="space-y-3">
          {displayedItems.map((item) => (
            <AnnouncementCard
              key={item.id}
              announcement={item}
              isAdmin={userRole === "admin"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
