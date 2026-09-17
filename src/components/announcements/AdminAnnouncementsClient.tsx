"use client";

import React, { useState, useMemo } from "react";
import {
  AnnouncementItem,
  AnnouncementCard,
} from "./AnnouncementCard";
import { AnnouncementDialog } from "./AnnouncementDialog";
import {
  Bell,
  Plus,
  Search,
  Pin,
  AlertTriangle,
  FileText,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AdminAnnouncementsClientProps {
  initialAnnouncements: AnnouncementItem[];
}

export function AdminAnnouncementsClient({
  initialAnnouncements,
}: AdminAnnouncementsClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AnnouncementItem | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const handleCreate = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const handleEdit = (item: AnnouncementItem) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  // กรองประกาศ
  const filtered = useMemo(() => {
    return initialAnnouncements.filter((item) => {
      const matchSearch =
        searchQuery === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.authorName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory =
        categoryFilter === "all" || item.category === categoryFilter;

      const matchRole =
        roleFilter === "all" || item.targetRole === roleFilter;

      return matchSearch && matchCategory && matchRole;
    });
  }, [initialAnnouncements, searchQuery, categoryFilter, roleFilter]);

  // เรียงลำดับ ปักหมุดขึ้นก่อน
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [filtered]);

  // สถิติตัวเลข
  const totalCount = initialAnnouncements.length;
  const pinnedCount = initialAnnouncements.filter((a) => a.isPinned).length;
  const urgentCount = initialAnnouncements.filter((a) => a.category === "urgent").length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Bell className="w-7 h-7 text-primary" />
            ระบบประกาศข่าวสารและประชาสัมพันธ์
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            เผยแพร่ข้อมูลข่าวสาร ปักหมุดประกาศสำคัญ และสื่อสารกับประชาคมสถานศึกษา
          </p>
        </div>

        <Button
          type="button"
          onClick={handleCreate}
          className="gap-2 bg-primary text-primary-foreground font-medium shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>สร้างประกาศใหม่</span>
        </Button>
      </div>

      {/* 3 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-card border border-border p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>ประกาศทั้งหมด</span>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold text-foreground">
              {totalCount}
            </span>
            <span className="text-xs text-muted-foreground">รายการ</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">ข่าวสารในระบบ</p>
        </div>

        <div className="bg-card border border-border p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>ข่าวปักหมุดสำคัญ</span>
            <Pin className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400">
              {pinnedCount}
            </span>
            <span className="text-xs text-muted-foreground">รายการ</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">แสดงบนสุดของฟีด</p>
        </div>

        <div className="bg-card border border-border p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>ข่าวด่วนที่สุด</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold text-rose-600 dark:text-rose-400">
              {urgentCount}
            </span>
            <span className="text-xs text-muted-foreground">รายการ</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">สถานะด่วนพิเศษ</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-card p-3 rounded-2xl border border-border">
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ค้นหาหัวข้อ, เนื้อหา, หรือผู้ประกาศ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">ทุกหมวดหมู่</option>
            <option value="urgent">ข่าวด่วนที่สุด</option>
            <option value="academic">วิชาการ & สอบ</option>
            <option value="activity">กิจกรรมโรงเรียน</option>
            <option value="general">ประชาสัมพันธ์ทั่วไป</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">ทุกกลุ่มเป้าหมาย</option>
            <option value="all">ทุกคน</option>
            <option value="teacher">ครูเท่านั้น</option>
            <option value="student">นักเรียนเท่านั้น</option>
          </select>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {sorted.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-dashed border-border bg-card">
            <p className="text-sm text-muted-foreground">ไม่พบประกาศข่าวสารที่ตรงกับเงื่อนไข</p>
          </div>
        ) : (
          sorted.map((item) => (
            <AnnouncementCard
              key={item.id}
              announcement={item}
              isAdmin={true}
              onEdit={handleEdit}
            />
          ))
        )}
      </div>

      {/* Modal Dialog */}
      <AnnouncementDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        announcementToEdit={editingItem}
      />
    </div>
  );
}
