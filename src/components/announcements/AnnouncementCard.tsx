"use client";

import React, { useTransition } from "react";
import {
  Pin,
  Calendar,
  User,
  Users,
  AlertTriangle,
  BookOpen,
  Sparkles,
  Info,
  MoreVertical,
  Edit2,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  togglePinAnnouncementAction,
  deleteAnnouncementAction,
} from "@/app/(dashboard)/admin/announcements/actions";

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  category: "academic" | "activity" | "general" | "urgent";
  authorId: string;
  authorName: string;
  targetRole: "all" | "teacher" | "student";
  isPinned: boolean;
  createdAt: string;
}

interface AnnouncementCardProps {
  announcement: AnnouncementItem;
  isAdmin?: boolean;
  onEdit?: (item: AnnouncementItem) => void;
  className?: string;
}

export const CATEGORY_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string; icon: React.ElementType }
> = {
  urgent: {
    label: "ข่าวด่วนที่สุด",
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-200 dark:border-rose-800",
    icon: AlertTriangle,
  },
  academic: {
    label: "วิชาการ & สอบ",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800",
    icon: BookOpen,
  },
  activity: {
    label: "กิจกรรมโรงเรียน",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800",
    icon: Sparkles,
  },
  general: {
    label: "ประชาสัมพันธ์ทั่วไป",
    bg: "bg-slate-50 dark:bg-slate-800/60",
    text: "text-slate-700 dark:text-slate-300",
    border: "border-slate-200 dark:border-slate-700",
    icon: Info,
  },
};

export function AnnouncementCard({
  announcement,
  isAdmin = false,
  onEdit,
  className,
}: AnnouncementCardProps) {
  const [isPending, startTransition] = useTransition();

  const config =
    CATEGORY_CONFIG[announcement.category] || CATEGORY_CONFIG.general;
  const CategoryIcon = config.icon;

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  const getTargetRoleLabel = (role: string) => {
    switch (role) {
      case "teacher":
        return "สำหรับครูเท่านั้น";
      case "student":
        return "สำหรับนักเรียนเท่านั้น";
      default:
        return "ทุกคนในโรงเรียน";
    }
  };

  const handleTogglePin = () => {
    startTransition(async () => {
      await togglePinAnnouncementAction(
        announcement.id,
        announcement.isPinned
      );
    });
  };

  const handleDelete = () => {
    if (confirm(`คุณต้องการลบประกาศ "${announcement.title}" หรือไม่?`)) {
      startTransition(async () => {
        await deleteAnnouncementAction(announcement.id);
      });
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl border bg-card text-card-foreground p-5 shadow-xs transition-all relative overflow-hidden",
        announcement.isPinned
          ? "border-amber-400/60 dark:border-amber-500/40 bg-gradient-to-br from-amber-50/20 via-background to-background"
          : "border-border hover:border-primary/40",
        className
      )}
    >
      {/* Indicator แถบสีด้านบนสำหรับข่าวสำคัญ */}
      {announcement.isPinned && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />
      )}

      {/* Header: Badges & Actions */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* หมวดหมู่ข่าว */}
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
              config.bg,
              config.text,
              config.border
            )}
          >
            <CategoryIcon className="w-3.5 h-3.5" />
            {config.label}
          </span>

          {/* ป้ายปักหมุด */}
          {announcement.isPinned && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
              <Pin className="w-3 h-3 fill-amber-500 text-amber-500" />
              ปักหมุดข่าวสำคัญ
            </span>
          )}

          {/* กลุ่มเป้าหมาย */}
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Users className="w-3 h-3" />
            {getTargetRoleLabel(announcement.targetRole)}
          </span>
        </div>

        {/* ปุ่ม Admin Actions (ถ้าเป็นผู้ดูแลระบบ) */}
        {isAdmin && (
          <div className="flex items-center gap-1 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleTogglePin}
              disabled={isPending}
              className={cn(
                "h-8 px-2 text-xs",
                announcement.isPinned
                  ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title={announcement.isPinned ? "ถอนหมุด" : "ปักหมุด"}
            >
              <Pin
                className={cn(
                  "w-4 h-4",
                  announcement.isPinned && "fill-amber-500 text-amber-500"
                )}
              />
            </Button>

            {onEdit && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onEdit(announcement)}
                disabled={isPending}
                className="h-8 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                title="แก้ไขประกาศ"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            )}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isPending}
              className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10"
              title="ลบประกาศ"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Content: Title & Text */}
      <h3 className="font-bold text-base md:text-lg text-foreground mb-2 tracking-tight">
        {announcement.title}
      </h3>
      <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed mb-4">
        {announcement.content}
      </p>

      {/* Footer: Author & Date */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/60">
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5" />
          <span>ประกาศโดย: </span>
          <strong className="text-foreground font-medium">
            {announcement.authorName}
          </strong>
        </div>

        <div className="flex items-center gap-1.5 font-mono">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(announcement.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
