"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AnnouncementItem,
  CATEGORY_CONFIG,
} from "./AnnouncementCard";
import {
  createAnnouncementAction,
  updateAnnouncementAction,
} from "@/app/(dashboard)/admin/announcements/actions";
import { AnnouncementFormValues } from "@/lib/validations/announcement";
import { Bell, Pin, CheckCircle2, AlertCircle } from "lucide-react";

interface AnnouncementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcementToEdit?: AnnouncementItem | null;
}

export function AnnouncementDialog({
  open,
  onOpenChange,
  announcementToEdit,
}: AnnouncementDialogProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<"academic" | "activity" | "general" | "urgent">("general");
  const [targetRole, setTargetRole] = useState<"all" | "teacher" | "student">("all");
  const [isPinned, setIsPinned] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isEditing = Boolean(announcementToEdit);

  useEffect(() => {
    if (announcementToEdit) {
      setTitle(announcementToEdit.title);
      setContent(announcementToEdit.content);
      setCategory(announcementToEdit.category);
      setTargetRole(announcementToEdit.targetRole);
      setIsPinned(announcementToEdit.isPinned);
    } else {
      setTitle("");
      setContent("");
      setCategory("general");
      setTargetRole("all");
      setIsPinned(false);
    }
    setErrorMsg(null);
  }, [announcementToEdit, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const payload: AnnouncementFormValues = {
      title: title.trim(),
      content: content.trim(),
      category,
      targetRole,
      isPinned,
    };

    startTransition(async () => {
      let res;
      if (isEditing && announcementToEdit) {
        res = await updateAnnouncementAction(announcementToEdit.id, payload);
      } else {
        res = await createAnnouncementAction(payload);
      }

      if (res.success) {
        onOpenChange(false);
      } else {
        setErrorMsg(res.error || "เกิดข้อผิดพลาดในการบันทึกประกาศ");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Bell className="w-5 h-5 text-primary" />
            {isEditing ? "แก้ไขประกาศข่าวสาร" : "สร้างประกาศข่าวสารใหม่"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            เผยแพร่ข้อมูล ข่าวด่วน หรือกิจกรรมประชาสัมพันธ์ให้แก่ประชาคมโรงเรียน
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* หัวข้อประกาศ */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              หัวข้อประกาศ <span className="text-destructive">*</span>
            </label>
            <Input
              required
              placeholder="เช่น กำหนดการสอบกลางภาค ภาคเรียนที่ 1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-sm"
            />
          </div>

          {/* หมวดหมู่ & กลุ่มเป้าหมาย */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                หมวดหมู่ข่าวสาร
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full h-9 rounded-md border border-input bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="general">ประชาสัมพันธ์ทั่วไป</option>
                <option value="academic">วิชาการ & สอบ</option>
                <option value="activity">กิจกรรมโรงเรียน</option>
                <option value="urgent">ข่าวด่วนที่สุด 🚨</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                กลุ่มเป้าหมาย (สิทธิ์การเห็น)
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value as any)}
                className="w-full h-9 rounded-md border border-input bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">ทุกคนในโรงเรียน (All)</option>
                <option value="teacher">คุณครูเท่านั้น (Teachers)</option>
                <option value="student">นักเรียนเท่านั้น (Students)</option>
              </select>
            </div>
          </div>

          {/* สวิตช์ปักหมุดข่าวสำคัญ */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <Pin className="w-4 h-4 text-amber-500 fill-amber-500" />
              <div>
                <span className="text-xs font-semibold block text-foreground">
                  ปักหมุดข่าวสำคัญ (Pin Announcement)
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  แสดงไว้บนสุดของฟีดข่าวสารเสมอ
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              id="pin-switch"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
            />
          </div>

          {/* เนื้อหาประกาศ */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              รายละเอียดเนื้อหา <span className="text-destructive">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="ระบุรายละเอียด วันเวลา สถานที่ หรือข้อปฏิบัติอย่างละเอียด..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full rounded-md border border-input bg-card p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
            />
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="text-xs"
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="text-xs gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isEditing ? "บันทึกการแก้ไข" : "เผยแพร่ประกาศ"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
