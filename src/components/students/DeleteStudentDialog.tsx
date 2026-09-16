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
import { deleteStudentAction } from "@/app/(dashboard)/admin/students/actions";
import { StudentRecord } from "./StudentFormDialog";
import { AlertTriangle, Loader2 } from "lucide-react";

interface DeleteStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: StudentRecord | null;
  onSuccess: () => void;
}

export function DeleteStudentDialog({
  open,
  onOpenChange,
  student,
  onSuccess,
}: DeleteStudentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!student) return null;

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await deleteStudentAction(student.id);
      if (!res.success) {
        setError(res.error || "ไม่สามารถลบข้อมูลนักเรียนได้");
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
          <DialogTitle className="text-lg">ยืนยันการลบข้อมูลนักเรียน</DialogTitle>
          <DialogDescription className="text-sm">
            คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลของ{" "}
            <span className="font-bold text-foreground">
              {student.user.fullName} ({student.studentCode})
            </span>
            ? การดำเนินการนี้จะลบประวัติการเรียน ผลคะแนน และบัญชีเข้าสู่ระบบโดยถาวร
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-lg">
            {error}
          </p>
        )}

        <DialogFooter className="pt-2">
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
            className="gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>ยืนยันลบข้อมูล</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
