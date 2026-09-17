"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  StudentSubmissionDetail,
  getAssignmentSubmissionsAction,
  gradeSubmissionAction,
} from "@/app/(dashboard)/teacher/assignments/actions";
import { TeacherAssignmentItem } from "./AssignmentFormDialog";
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  Save,
  UserCheck,
  AlertCircle,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GradeSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: TeacherAssignmentItem | null;
}

export function GradeSubmissionDialog({
  open,
  onOpenChange,
  assignment,
}: GradeSubmissionDialogProps) {
  const [submissions, setSubmissions] = useState<StudentSubmissionDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // ข้อมูลที่กำลังตรวจ
  const [scoreInput, setScoreInput] = useState<string>("");
  const [feedbackInput, setFeedbackInput] = useState<string>("");
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [isGrading, startGrading] = useTransition();

  useEffect(() => {
    if (open && assignment) {
      setLoading(true);
      setFeedbackMsg(null);
      getAssignmentSubmissionsAction(assignment.id).then((res) => {
        setLoading(false);
        if (res.success && res.data) {
          setSubmissions(res.data);
          if (res.data.length > 0) {
            // เลือกนักเรียนคนแรกที่ส่งงานแล้ว หรือคนแรกสุด
            const firstSubmitted = res.data.find((s) => s.status !== "pending") || res.data[0];
            setSelectedStudentId(firstSubmitted.studentId);
            setScoreInput(firstSubmitted.score !== null ? String(firstSubmitted.score) : "");
            setFeedbackInput(firstSubmitted.feedback || "");
          }
        }
      });
    }
  }, [open, assignment]);

  const selectedStudent = submissions.find((s) => s.studentId === selectedStudentId);

  const handleSelectStudent = (s: StudentSubmissionDetail) => {
    setSelectedStudentId(s.studentId);
    setScoreInput(s.score !== null ? String(s.score) : "");
    setFeedbackInput(s.feedback || "");
    setFeedbackMsg(null);
  };

  const handleSaveGrade = () => {
    if (!selectedStudent || !selectedStudent.submissionId) return;

    const numScore = parseFloat(scoreInput);
    if (isNaN(numScore) || numScore < 0) {
      setFeedbackMsg({ type: "error", text: "กรุณาระบุคะแนนที่ถูกต้อง" });
      return;
    }

    if (assignment && numScore > assignment.maxScore) {
      setFeedbackMsg({
        type: "error",
        text: `คะแนนต้องไม่เกินคะแนนเต็ม (${assignment.maxScore} คะแนน)`,
      });
      return;
    }

    startGrading(async () => {
      const res = await gradeSubmissionAction({
        submissionId: selectedStudent.submissionId!,
        score: numScore,
        feedback: feedbackInput.trim() || undefined,
      });

      if (res.success) {
        setFeedbackMsg({ type: "success", text: "บันทึกผลการตรวจเรียบร้อยแล้ว" });
        // อัปเดตใน state ทันที
        setSubmissions((prev) =>
          prev.map((item) =>
            item.studentId === selectedStudent.studentId
              ? {
                  ...item,
                  score: numScore,
                  feedback: feedbackInput.trim() || null,
                  status: "graded",
                }
              : item
          )
        );
      } else {
        setFeedbackMsg({ type: "error", text: res.error || "เกิดข้อผิดพลาดในการบันทึกคะแนน" });
      }
    });
  };

  const getStatusBadge = (status: StudentSubmissionDetail["status"]) => {
    switch (status) {
      case "graded":
        return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px]">ตรวจแล้ว</Badge>;
      case "submitted":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 text-[10px]">ส่งแล้ว (รอตรวจ)</Badge>;
      case "late":
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 text-[10px]">ส่งช้ากว่ากำหนด</Badge>;
      default:
        return <Badge variant="outline" className="text-muted-foreground text-[10px]">ยังไม่ส่ง</Badge>;
    }
  };

  if (!assignment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-border bg-card">
          <DialogHeader>
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-xs font-mono font-semibold text-blue-600 dark:text-blue-400">
                  {assignment.courseCode} • {assignment.courseName}
                </span>
                <DialogTitle className="text-lg font-bold text-foreground mt-0.5">
                  ตรวจงาน: {assignment.title}
                </DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  คะแนนเต็ม {assignment.maxScore} คะแนน • กำหนดส่ง {assignment.dueDate}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Content Body: Split Layout */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Left Column: Student List (md:col-span-5) */}
          <div className="md:col-span-5 border-r border-border overflow-y-auto max-h-[300px] md:max-h-[500px] bg-muted/10 divide-y divide-border">
            <div className="p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30 sticky top-0 backdrop-blur z-10 flex items-center justify-between">
              <span>รายชื่อนักเรียน ({submissions.length} คน)</span>
              <span>
                ส่งแล้ว {submissions.filter((s) => s.status !== "pending").length} คน
              </span>
            </div>

            {loading ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                กำลังโหลดรายชื่อนักเรียน...
              </div>
            ) : submissions.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                ยังไม่มีนักเรียนลงทะเบียนในรายวิชานี้
              </div>
            ) : (
              submissions.map((stu) => {
                const isSelected = stu.studentId === selectedStudentId;
                return (
                  <button
                    key={stu.studentId}
                    type="button"
                    onClick={() => handleSelectStudent(stu)}
                    className={cn(
                      "w-full p-3 text-left transition-colors flex items-start justify-between gap-2",
                      isSelected
                        ? "bg-primary/10 border-l-4 border-primary"
                        : "hover:bg-muted/40"
                    )}
                  >
                    <div>
                      <div className="font-medium text-xs text-foreground">
                        {stu.fullName}
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        {stu.studentCode} • {stu.classroom}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {getStatusBadge(stu.status)}
                      {stu.score !== null && (
                        <span className="block text-[11px] font-mono font-bold text-foreground mt-0.5">
                          {stu.score}/{assignment.maxScore}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Right Column: Submission Details & Grading Form (md:col-span-7) */}
          <div className="md:col-span-7 p-5 overflow-y-auto max-h-[500px] space-y-5 bg-card">
            {selectedStudent ? (
              <>
                {/* ข้อมูลนักเรียนที่เลือก */}
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div>
                    <h4 className="font-bold text-sm text-foreground">
                      {selectedStudent.fullName}
                    </h4>
                    <p className="text-xs text-muted-foreground font-mono">
                      {selectedStudent.studentCode} • {selectedStudent.classroom}
                    </p>
                  </div>
                  <div>{getStatusBadge(selectedStudent.status)}</div>
                </div>

                {/* เนื้อหางานที่ส่ง */}
                {selectedStudent.status === "pending" ? (
                  <div className="rounded-xl border border-dashed border-border p-8 text-center bg-muted/20">
                    <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-xs text-muted-foreground">
                      นักเรียนคนนี้ยังไม่ได้ส่งงาน
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* วันเวลาที่ส่ง */}
                    {selectedStudent.submittedAt && (
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>ส่งเมื่อ: {new Date(selectedStudent.submittedAt).toLocaleString("th-TH")}</span>
                      </p>
                    )}

                    {/* ข้อความคำตอบ */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        คำตอบ / เนื้อหาที่ส่ง
                      </label>
                      <div className="p-3.5 rounded-xl border border-border bg-muted/20 text-xs leading-relaxed whitespace-pre-wrap text-foreground">
                        {selectedStudent.content || "ไม่มีข้อความคำตอบ"}
                      </div>
                    </div>

                    {/* ลิงก์ไฟล์งานภายนอก */}
                    {selectedStudent.fileUrl && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">
                          ลิงก์ผลงานที่แนบมา
                        </label>
                        <a
                          href={selectedStudent.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 p-2.5 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:underline text-xs font-medium break-all"
                        >
                          <ExternalLink className="w-4 h-4 shrink-0" />
                          <span>{selectedStudent.fileUrl}</span>
                        </a>
                      </div>
                    )}

                    {/* ฟอร์มให้คะแนน & Feedback */}
                    <div className="p-4 rounded-xl border border-border bg-muted/10 space-y-3 pt-4">
                      <h5 className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-primary" />
                        <span>การประเมินและให้คะแนน</span>
                      </h5>

                      {feedbackMsg && (
                        <div
                          className={cn(
                            "p-2.5 rounded-lg text-xs flex items-center gap-2",
                            feedbackMsg.type === "success"
                              ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : "bg-destructive/10 text-destructive"
                          )}
                        >
                          {feedbackMsg.type === "success" ? (
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                          ) : (
                            <AlertCircle className="w-4 h-4 shrink-0" />
                          )}
                          <span>{feedbackMsg.text}</span>
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="text-xs text-foreground font-medium flex items-center justify-between">
                          <span>คะแนนที่ได้รับ</span>
                          <span className="text-muted-foreground">
                            (เต็ม {assignment.maxScore} คะแนน)
                          </span>
                        </label>
                        <Input
                          type="number"
                          step="0.5"
                          min={0}
                          max={assignment.maxScore}
                          placeholder={`0 - ${assignment.maxScore}`}
                          value={scoreInput}
                          onChange={(e) => setScoreInput(e.target.value)}
                          className="text-xs font-mono font-bold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-foreground font-medium">
                          ข้อเสนอแนะ / คำแนะนำสำหรับนักเรียน (Feedback)
                        </label>
                        <textarea
                          rows={2}
                          placeholder="เช่น ผลงานเรียบร้อยดีมาก ลำดับขั้นตอนผังงานถูกต้อง หรือควรปรับปรุงจุดใด..."
                          value={feedbackInput}
                          onChange={(e) => setFeedbackInput(e.target.value)}
                          className="w-full rounded-md border border-input bg-card p-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                        />
                      </div>

                      <Button
                        type="button"
                        onClick={handleSaveGrade}
                        disabled={isGrading}
                        className="w-full text-xs gap-1.5 shadow-xs"
                      >
                        <Save className="w-4 h-4" />
                        <span>บันทึกผลการตรวจ</span>
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-8 text-center text-xs text-muted-foreground">
                กรุณาเลือกนักเรียนจากรายการด้านซ้ายเพื่อตรวจงาน
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
