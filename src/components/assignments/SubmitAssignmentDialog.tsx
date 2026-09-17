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
import { submitAssignmentAction } from "@/app/(dashboard)/student/assignments/actions";
import {
  FileText,
  Calendar,
  Send,
  Link2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface StudentAssignmentItem {
  id: string;
  courseCode: string;
  courseName: string;
  teacherName: string;
  title: string;
  description: string | null;
  dueDate: string;
  maxScore: number;
  isOverdue: boolean;
  submission: {
    id: string;
    content: string | null;
    fileUrl: string | null;
    score: number | null;
    feedback: string | null;
    status: "pending" | "submitted" | "graded" | "late";
    submittedAt: string | null;
  } | null;
}

interface SubmitAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: StudentAssignmentItem | null;
}

export function SubmitAssignmentDialog({
  open,
  onOpenChange,
  assignment,
}: SubmitAssignmentDialogProps) {
  const [content, setContent] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (assignment) {
      setContent(assignment.submission?.content || "");
      setFileUrl(assignment.submission?.fileUrl || "");
      setErrorMsg(null);
    }
  }, [assignment, open]);

  if (!assignment) return null;

  const isGraded = assignment.submission?.status === "graded";
  const isAlreadySubmitted = Boolean(assignment.submission);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    startTransition(async () => {
      const res = await submitAssignmentAction({
        assignmentId: assignment.id,
        content: content.trim(),
        fileUrl: fileUrl.trim() || undefined,
      });

      if (res.success) {
        onOpenChange(false);
      } else {
        setErrorMsg(res.error || "เกิดข้อผิดพลาดในการส่งงาน");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
              {assignment.courseCode}
            </span>
            <span className="text-xs text-muted-foreground">
              {assignment.courseName} • ครูผู้สอน: {assignment.teacherName}
            </span>
          </div>

          <DialogTitle className="text-lg font-bold text-foreground">
            {assignment.title}
          </DialogTitle>

          <DialogDescription className="text-xs flex flex-wrap items-center gap-3 pt-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              กำหนดส่ง: <strong className="text-foreground">{assignment.dueDate}</strong>
            </span>
            <span>•</span>
            <span>
              คะแนนเต็ม: <strong className="text-foreground">{assignment.maxScore}</strong> คะแนน
            </span>
          </DialogDescription>
        </DialogHeader>

        {/* รายละเอียดโจทย์งาน */}
        {assignment.description && (
          <div className="p-3.5 rounded-xl border border-border bg-muted/20 text-xs leading-relaxed text-muted-foreground whitespace-pre-line">
            <strong className="text-foreground block mb-1">คำอธิบายโจทย์:</strong>
            {assignment.description}
          </div>
        )}

        {/* ถ้าตรวจให้คะแนนแล้ว แสดง Score Banner & Feedback */}
        {isGraded && (
          <div className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                ได้รับการตรวจและประเมินคะแนนแล้ว
              </span>
              <span className="text-base font-black font-mono text-emerald-700 dark:text-emerald-300">
                {assignment.submission?.score} / {assignment.maxScore} คะแนน
              </span>
            </div>

            {assignment.submission?.feedback && (
              <div className="text-xs text-emerald-900 dark:text-emerald-200 pt-1 border-t border-emerald-200 dark:border-emerald-800/80">
                <strong>คำแนะนำจากครูผู้สอน:</strong> {assignment.submission.feedback}
              </div>
            )}
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ฟอร์มส่งงาน */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* ช่องกรอกคำตอบ */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              คำตอบ / สรุปผลการทำงาน <span className="text-destructive">*</span>
            </label>
            <textarea
              required
              disabled={isGraded}
              rows={4}
              placeholder="พิมพ์คำตอบ อธิบายขั้นตอนการทำงาน หรือรายงานผล..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full rounded-md border border-input bg-card p-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y disabled:opacity-75"
            />
          </div>

          {/* ช่องแนบลิงก์ภายนอก */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-primary" />
                ลิงก์แนบผลงาน (URL)
              </span>
              <span className="text-[11px] text-muted-foreground font-normal">
                (Google Drive, GitHub, Canva, Canva, Notion ฯลฯ)
              </span>
            </label>
            <Input
              type="url"
              disabled={isGraded}
              placeholder="https://..."
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              className="text-xs font-mono"
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
              ปิด
            </Button>

            {!isGraded && (
              <Button
                type="submit"
                disabled={isPending}
                className="text-xs gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isAlreadySubmitted ? "ส่งงานอีกครั้ง (อัปเดต)" : "ยืนยันการส่งงาน"}</span>
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
