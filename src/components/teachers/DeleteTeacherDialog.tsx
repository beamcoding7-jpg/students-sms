"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteTeacherAction } from "@/app/(dashboard)/admin/teachers/actions";
import { TeacherRecord } from "./TeacherFormDialog";
import { AlertTriangle, Loader2 } from "lucide-react";

interface DeleteTeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: TeacherRecord | null;
  onSuccess: () => void;
}

export function DeleteTeacherDialog({
  open,
  onOpenChange,
  teacher,
  onSuccess,
}: DeleteTeacherDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!teacher) return null;

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await deleteTeacherAction(teacher.id);
      if (!res.success) {
        setError(res.error || "ไม่สามารถลบข้อมูลคุณครูได้");
        setLoading(false);
        return;
      }
      onSuccess();
      onOpenChange(false);
    } catch {
      setError("เกิดข้อผิดพลาดในการลบข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-2 mx-auto sm:mx-0">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <DialogTitle>ยืนยันการลบข้อมูลคุณครู</DialogTitle>
          <DialogDescription className="space-y-2 pt-2 text-left">
            <span className="block text-slate-700 dark:text-slate-300">
              คุณต้องการลบข้อมูลของ{" "}
              <strong className="text-slate-900 dark:text-white font-semibold">
                {teacher.user.fullName}
              </strong>{" "}
              ({teacher.department}) ใช่หรือไม่?
            </span>
            <span className="block text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900">
              ⚠️ การลบจะยกเลิกบัญชีผู้ใช้ และจะปลดครูผู้สอนออกจากรายวิชาที่รับผิดชอบอยู่ (รายวิชาและข้อมูลนักเรียนจะไม่สูญหาย)
            </span>
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <DialogFooter className="mt-4 gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            ยกเลิก
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                กำลังลบ...
              </>
            ) : (
              "ยืนยันลบข้อมูล"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
