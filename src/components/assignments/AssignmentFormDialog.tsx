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
  createAssignmentAction,
  updateAssignmentAction,
} from "@/app/(dashboard)/teacher/assignments/actions";
import { AssignmentFormValues } from "@/lib/validations/assignment";
import { FileText, Calendar, CheckCircle2, AlertCircle } from "lucide-react";

export interface TeacherCourseOption {
  id: string;
  courseCode: string;
  courseName: string;
}

export interface TeacherAssignmentItem {
  id: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  title: string;
  description: string | null;
  dueDate: string;
  maxScore: number;
  totalStudents: number;
  submittedCount: number;
  gradedCount: number;
  createdAt: string;
}

interface AssignmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courses: TeacherCourseOption[];
  assignmentToEdit?: TeacherAssignmentItem | null;
}

export function AssignmentFormDialog({
  open,
  onOpenChange,
  courses,
  assignmentToEdit,
}: AssignmentFormDialogProps) {
  const [courseId, setCourseId] = useState(courses[0]?.id || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [maxScore, setMaxScore] = useState<number>(10);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isEditing = Boolean(assignmentToEdit);

  useEffect(() => {
    if (assignmentToEdit) {
      setCourseId(assignmentToEdit.courseId);
      setTitle(assignmentToEdit.title);
      setDescription(assignmentToEdit.description || "");
      setDueDate(assignmentToEdit.dueDate);
      setMaxScore(assignmentToEdit.maxScore);
    } else {
      setCourseId(courses[0]?.id || "");
      setTitle("");
      setDescription("");
      // กำหนด Due Date ค่าเริ่มต้นเป็น 7 วันข้างหน้า
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      setDueDate(nextWeek.toISOString().split("T")[0]);
      setMaxScore(10);
    }
    setErrorMsg(null);
  }, [assignmentToEdit, open, courses]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const payload: AssignmentFormValues = {
      courseId,
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate,
      maxScore: Number(maxScore),
    };

    startTransition(async () => {
      let res;
      if (isEditing && assignmentToEdit) {
        res = await updateAssignmentAction(assignmentToEdit.id, payload);
      } else {
        res = await createAssignmentAction(payload);
      }

      if (res.success) {
        onOpenChange(false);
      } else {
        setErrorMsg(res.error || "เกิดข้อผิดพลาดในการบันทึกการบ้าน");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5 text-primary" />
            {isEditing ? "แก้ไขงานที่มอบหมาย" : "มอบหมายการบ้านใหม่"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            กำหนดหัวข้องาน คำอธิบาย คะแนนเต็ม และกำหนดวันส่งสำหรับนักเรียนในรายวิชา
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* เลือกรายวิชา */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              รายวิชาที่สอน <span className="text-destructive">*</span>
            </label>
            <select
              required
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.courseCode} - {c.courseName}
                </option>
              ))}
            </select>
          </div>

          {/* ชื่อการบ้าน */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              ชื่องาน / การบ้าน <span className="text-destructive">*</span>
            </label>
            <Input
              required
              placeholder="เช่น ใบงานที่ 1: การเขียนผังงาน (Flowchart)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-sm"
            />
          </div>

          {/* กำหนดส่ง & คะแนนเต็ม */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                กำหนดส่ง (Due Date) <span className="text-destructive">*</span>
              </label>
              <Input
                required
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                คะแนนเต็ม (Max Score) <span className="text-destructive">*</span>
              </label>
              <Input
                required
                type="number"
                min={1}
                max={100}
                value={maxScore}
                onChange={(e) => setMaxScore(Number(e.target.value))}
                className="text-xs font-mono"
              />
            </div>
          </div>

          {/* คำอธิบายโจทย์ / รายละเอียด */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              คำอธิบาย / โจทย์งานที่มอบหมาย
            </label>
            <textarea
              rows={4}
              placeholder="ระบุข้อกำหนด วิธีทำ หรือลิงก์โจทย์ตัวอย่าง..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              <span>{isEditing ? "บันทึกการแก้ไข" : "มอบหมายการบ้าน"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
