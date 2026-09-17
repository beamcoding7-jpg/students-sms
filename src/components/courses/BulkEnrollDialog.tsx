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
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { enrollClassroomAction } from "@/app/(dashboard)/admin/courses/actions";
import { UserCheck, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface BulkEnrollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  courseCode: string;
  courseName: string;
  defaultGrade: string;
  onSuccess: () => void;
}

export function BulkEnrollDialog({
  open,
  onOpenChange,
  courseId,
  courseCode,
  courseName,
  defaultGrade,
  onSuccess,
}: BulkEnrollDialogProps) {
  const [gradeLevel, setGradeLevel] = useState(defaultGrade || "ม.4");
  const [classroom, setClassroom] = useState("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await enrollClassroomAction(courseId, gradeLevel, classroom);
      if (!res.success) {
        setError(res.error || "เกิดข้อผิดพลาดในการลงทะเบียนนักเรียนทั้งห้อง");
        setLoading(false);
        return;
      }

      setSuccessMsg(
        `ลงทะเบียนนักเรียนห้อง ${gradeLevel}/${classroom} เข้าวิชานี้สำเร็จจำนวน ${res.count} คน`
      );
      setTimeout(() => {
        onSuccess();
        onOpenChange(false);
        setSuccessMsg(null);
      }, 1200);
    } catch {
      setError("เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-1.5">
            <UserCheck className="w-6 h-6" />
          </div>
          <DialogTitle>ลงทะเบียนนักเรียนทั้งห้องเรียน</DialogTitle>
          <DialogDescription>
            ลงทะเบียนนักเรียนทุกคนในห้องเรียนที่เลือก เข้าสู่วิชา{" "}
            <strong className="text-slate-900 dark:text-white">
              {courseCode} {courseName}
            </strong>{" "}
            โดยอัตโนมัติ (ระบบจะข้ามคนที่ลงทะเบียนไว้แล้ว)
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex items-center gap-2.5 text-rose-700 dark:text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl flex items-center gap-2.5 text-emerald-700 dark:text-emerald-400 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="gradeLevel">ระดับชั้น</Label>
              <Select
                id="gradeLevel"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                disabled={loading}
              >
                <option value="ม.4">มัธยมศึกษาปีที่ 4 (ม.4)</option>
                <option value="ม.5">มัธยมศึกษาปีที่ 5 (ม.5)</option>
                <option value="ม.6">มัธยมศึกษาปีที่ 6 (ม.6)</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="classroom">ห้องเรียน</Label>
              <Select
                id="classroom"
                value={classroom}
                onChange={(e) => setClassroom(e.target.value)}
                disabled={loading}
              >
                <option value="1">ห้อง 1</option>
                <option value="2">ห้อง 2</option>
                <option value="3">ห้อง 3</option>
                <option value="4">ห้อง 4</option>
              </Select>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            ℹ️ ระบบจะค้นหานักเรียนที่มีระดับชั้นและห้องเรียนตรงกันในฐานข้อมูล และสร้างประวัติการลงทะเบียนให้ทันที
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  กำลังลงทะเบียน...
                </>
              ) : (
                "ยืนยันลงทะเบียนทั้งห้อง"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
