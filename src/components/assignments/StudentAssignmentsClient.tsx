"use client";

import React, { useState, useMemo } from "react";
import {
  FileText,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  BookOpen,
  Send,
  Sparkles,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  StudentAssignmentItem,
  SubmitAssignmentDialog,
} from "./SubmitAssignmentDialog";
import { cn } from "@/lib/utils";

interface StudentAssignmentsClientProps {
  assignments: StudentAssignmentItem[];
  studentName: string;
}

export function StudentAssignmentsClient({
  assignments,
  studentName,
}: StudentAssignmentsClientProps) {
  const [activeTab, setActiveTab] = useState<"pending" | "submitted" | "graded" | "all">("pending");
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>("all");
  const [selectedItemForSubmit, setSelectedItemForSubmit] = useState<StudentAssignmentItem | null>(null);

  // ดึงรายชื่อวิชาทั้งหมดเพื่อทำ Filter
  const coursesList = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of assignments) {
      map.set(a.courseCode, `${a.courseCode} - ${a.courseName}`);
    }
    return Array.from(map.entries()).map(([code, label]) => ({ code, label }));
  }, [assignments]);

  // แยกกลุ่มการบ้าน
  const pendingList = assignments.filter((a) => !a.submission);
  const submittedList = assignments.filter(
    (a) => a.submission && a.submission.status !== "graded"
  );
  const gradedList = assignments.filter(
    (a) => a.submission && a.submission.status === "graded"
  );

  // กรองตามแท็บและวิชา
  const displayedAssignments = useMemo(() => {
    let list: StudentAssignmentItem[] = [];
    if (activeTab === "pending") list = pendingList;
    else if (activeTab === "submitted") list = submittedList;
    else if (activeTab === "graded") list = gradedList;
    else list = assignments;

    if (selectedCourseFilter !== "all") {
      list = list.filter((a) => a.courseCode === selectedCourseFilter);
    }

    return list;
  }, [activeTab, selectedCourseFilter, pendingList, submittedList, gradedList, assignments]);

  const getStatusBadge = (item: StudentAssignmentItem) => {
    if (!item.submission) {
      if (item.isOverdue) {
        return (
          <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 gap-1 text-[11px]">
            <AlertCircle className="w-3 h-3" />
            เลยกำหนดส่งแล้ว
          </Badge>
        );
      }
      return (
        <Badge variant="outline" className="text-amber-600 border-amber-300 dark:border-amber-800 gap-1 text-[11px]">
          <Clock className="w-3 h-3" />
          รอดำเนินการส่ง
        </Badge>
      );
    }

    if (item.submission.status === "graded") {
      return (
        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 gap-1 text-[11px]">
          <CheckCircle2 className="w-3 h-3" />
          ตรวจแล้ว ({item.submission.score}/{item.maxScore})
        </Badge>
      );
    }

    if (item.submission.status === "late") {
      return (
        <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 gap-1 text-[11px]">
          <Clock className="w-3 h-3" />
          ส่งช้ากว่ากำหนด (รอตรวจ)
        </Badge>
      );
    }

    return (
      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 gap-1 text-[11px]">
        <CheckCircle2 className="w-3 h-3" />
        ส่งแล้ว (รอครูตรวจ)
      </Badge>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-primary" />
            การบ้านและภาระงานที่มอบหมาย
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            นักเรียน: <span className="font-semibold text-foreground">{studentName}</span> • ติดตามงาน มอบหมายคำตอบ และดูผลคะแนนประเมิน
          </p>
        </div>
      </div>

      {/* Tabs Selector & Course Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-border">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("pending")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5",
              activeTab === "pending"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <span>งานที่ต้องทำ</span>
            <span
              className={cn(
                "px-1.5 py-0.2 rounded-full text-[10px]",
                activeTab === "pending" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
              )}
            >
              {pendingList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("submitted")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5",
              activeTab === "submitted"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <span>ส่งแล้ว (รอตรวจ)</span>
            <span
              className={cn(
                "px-1.5 py-0.2 rounded-full text-[10px]",
                activeTab === "submitted" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
              )}
            >
              {submittedList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("graded")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5",
              activeTab === "graded"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <span>ตรวจแล้ว</span>
            <span
              className={cn(
                "px-1.5 py-0.2 rounded-full text-[10px]",
                activeTab === "graded" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
              )}
            >
              {gradedList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors",
              activeTab === "all"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            ทั้งหมด ({assignments.length})
          </button>
        </div>

        {/* Filter by course */}
        <div className="flex items-center gap-2">
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="h-8 rounded-md border border-input bg-card px-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">ทุกวิชา</option>
            {coursesList.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Assignment Cards List */}
      <div className="space-y-4">
        {displayedAssignments.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-border bg-card">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-60" />
            <p className="text-sm font-semibold text-foreground">
              {activeTab === "pending"
                ? "ไม่มีการบ้านค้างส่งในขณะนี้ ยอดเยี่ยมมาก!"
                : "ไม่พบรายการการบ้านในหมวดนี้"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              คุณสามารถตรวจสอบรายการในแท็บอื่นได้ตลอดเวลา
            </p>
          </div>
        ) : (
          displayedAssignments.map((item) => {
            const isGraded = item.submission?.status === "graded";
            const isSubmitted = Boolean(item.submission);

            return (
              <div
                key={item.id}
                className={cn(
                  "p-5 rounded-2xl border bg-card shadow-xs transition-all space-y-4",
                  isGraded
                    ? "border-emerald-300/60 dark:border-emerald-800/40 bg-emerald-50/10"
                    : item.isOverdue && !isSubmitted
                    ? "border-rose-300/60 dark:border-rose-800/40"
                    : "border-border hover:border-primary/40"
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                        {item.courseCode}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {item.courseName} • ครู: {item.teacherName}
                      </span>
                    </div>

                    <h3 className="font-bold text-base sm:text-lg text-foreground tracking-tight">
                      {item.title}
                    </h3>

                    {item.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 max-w-2xl">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div>{getStatusBadge(item)}</div>
                </div>

                {/* Score & Feedback if graded */}
                {isGraded && item.submission && (
                  <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="font-semibold text-emerald-800 dark:text-emerald-300 block">
                        คะแนนที่ได้: {item.submission.score} / {item.maxScore} คะแนน
                      </span>
                      {item.submission.feedback && (
                        <span className="text-emerald-900/80 dark:text-emerald-200/80 block mt-0.5">
                          <strong>คำแนะนำ:</strong> {item.submission.feedback}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer bar */}
                <div className="pt-2 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      <span>กำหนดส่ง: </span>
                      <strong
                        className={cn(
                          "font-mono",
                          item.isOverdue && !isSubmitted
                            ? "text-rose-600 font-bold"
                            : "text-foreground"
                        )}
                      >
                        {item.dueDate}
                      </strong>
                    </div>

                    <span>•</span>

                    <div>
                      คะแนนเต็ม: <strong className="text-foreground font-mono">{item.maxScore}</strong> คะแนน
                    </div>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setSelectedItemForSubmit(item)}
                    className={cn(
                      "text-xs gap-1.5 shadow-xs",
                      isGraded
                        ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        : isSubmitted
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    {isGraded ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>ดูผลคะแนน</span>
                      </>
                    ) : isSubmitted ? (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>ดู/แก้ไขงานที่ส่ง</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>ส่งงาน</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Dialog */}
      <SubmitAssignmentDialog
        open={Boolean(selectedItemForSubmit)}
        onOpenChange={(open) => !open && setSelectedItemForSubmit(null)}
        assignment={selectedItemForSubmit}
      />
    </div>
  );
}
