"use client";

import React, { useState, useMemo, useTransition } from "react";
import {
  FileText,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  BookOpen,
  Edit2,
  Trash2,
  Users,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AssignmentFormDialog,
  TeacherCourseOption,
  TeacherAssignmentItem,
} from "./AssignmentFormDialog";
import { GradeSubmissionDialog } from "./GradeSubmissionDialog";
import { deleteAssignmentAction } from "@/app/(dashboard)/teacher/assignments/actions";
import { cn } from "@/lib/utils";

interface TeacherAssignmentsClientProps {
  courses: TeacherCourseOption[];
  initialAssignments: TeacherAssignmentItem[];
  teacherName: string;
}

export function TeacherAssignmentsClient({
  courses,
  initialAssignments,
  teacherName,
}: TeacherAssignmentsClientProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TeacherAssignmentItem | null>(null);
  const [gradingItem, setGradingItem] = useState<TeacherAssignmentItem | null>(null);

  const [isDeleting, startDelete] = useTransition();

  // กรองการบ้าน
  const filteredAssignments = useMemo(() => {
    return initialAssignments.filter((asg) => {
      const matchCourse =
        selectedCourseId === "all" || asg.courseId === selectedCourseId;
      const matchSearch =
        searchQuery === "" ||
        asg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asg.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asg.courseName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCourse && matchSearch;
    });
  }, [initialAssignments, selectedCourseId, searchQuery]);

  // สถิติรวม
  const stats = useMemo(() => {
    const total = initialAssignments.length;
    let totalSubmissions = 0;
    let totalGraded = 0;
    let totalEnrolled = 0;

    for (const a of initialAssignments) {
      totalSubmissions += a.submittedCount;
      totalGraded += a.gradedCount;
      totalEnrolled += a.totalStudents;
    }

    const pendingReview = totalSubmissions - totalGraded;

    return {
      totalAssignments: total,
      totalSubmissions,
      pendingReview: Math.max(0, pendingReview),
      totalGraded,
    };
  }, [initialAssignments]);

  const handleCreate = () => {
    setEditingItem(null);
    setCreateDialogOpen(true);
  };

  const handleEdit = (item: TeacherAssignmentItem) => {
    setEditingItem(item);
    setCreateDialogOpen(true);
  };

  const handleDelete = (item: TeacherAssignmentItem) => {
    if (confirm(`คุณต้องการลบการบ้าน "${item.title}" หรือไม่? (ข้อมูลการส่งงานของนักเรียนจะถูกลบไปด้วย)`)) {
      startDelete(async () => {
        await deleteAssignmentAction(item.id);
      });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-primary" />
            ระบบมอบหมายการบ้านและตรวจงาน
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            ครูผู้สอน: <span className="font-semibold text-foreground">{teacherName}</span> • จัดการการบ้าน ตรวจผลงาน และให้คะแนนนักเรียน
          </p>
        </div>

        <Button
          type="button"
          onClick={handleCreate}
          className="gap-2 bg-primary text-primary-foreground font-medium shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>มอบหมายการบ้านใหม่</span>
        </Button>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-card border border-border p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>งานที่มอบหมายทั้งหมด</span>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold text-foreground">
              {stats.totalAssignments}
            </span>
            <span className="text-xs text-muted-foreground">ชิ้นงาน</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">ในรายวิชาที่รับผิดชอบ</p>
        </div>

        <div className="bg-card border border-border p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>งานที่นักเรียนส่งแล้ว</span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.totalSubmissions}
            </span>
            <span className="text-xs text-muted-foreground">รายการ</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">จากนักเรียนทั้งหมด</p>
        </div>

        <div className="bg-card border border-border p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>รอตรวจให้คะแนน</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400">
              {stats.pendingReview}
            </span>
            <span className="text-xs text-muted-foreground">รายการ</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">ส่งแล้วแต่ยังไม่ได้ตรวจ</p>
        </div>

        <div className="bg-card border border-border p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>ตรวจและให้คะแนนแล้ว</span>
            <CheckCircle2 className="w-4 h-4 text-primary" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold text-foreground">
              {stats.totalGraded}
            </span>
            <span className="text-xs text-muted-foreground">รายการ</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">บันทึกผลการประเมินแล้ว</p>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-card p-3 rounded-2xl border border-border">
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ค้นหาชื่อการบ้าน หรือรหัสวิชา..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full sm:w-56 h-9 rounded-md border border-input bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">ทุกรายวิชาที่สอน</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.courseCode} - {c.courseName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Assignment Cards List */}
      <div className="space-y-4">
        {filteredAssignments.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-dashed border-border bg-card">
            <p className="text-sm text-muted-foreground">
              ยังไม่มีรายการการบ้านที่ตรงกับเงื่อนไข
            </p>
          </div>
        ) : (
          filteredAssignments.map((asg) => {
            const percentSubmitted =
              asg.totalStudents > 0
                ? Math.round((asg.submittedCount / asg.totalStudents) * 100)
                : 0;

            const isPendingReview = asg.submittedCount > asg.gradedCount;

            return (
              <div
                key={asg.id}
                className="p-5 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                        {asg.courseCode}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {asg.courseName}
                      </span>
                    </div>

                    <h3 className="font-bold text-base sm:text-lg text-foreground tracking-tight">
                      {asg.title}
                    </h3>

                    {asg.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 max-w-2xl">
                        {asg.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(asg)}
                      className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1" />
                      <span>แก้ไข</span>
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(asg)}
                      disabled={isDeleting}
                      className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Progress & Submission Stats */}
                <div className="pt-2 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      <span>กำหนดส่ง: </span>
                      <strong className="text-foreground font-mono">
                        {asg.dueDate}
                      </strong>
                    </div>

                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <span>คะแนนเต็ม: </span>
                      <strong className="text-foreground font-mono">
                        {asg.maxScore} คะแนน
                      </strong>
                    </div>

                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <span>สถานะการส่ง: </span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                        {asg.submittedCount}/{asg.totalStudents} คน ({percentSubmitted}%)
                      </strong>
                    </div>

                    {isPendingReview && (
                      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 text-[10px]">
                        รอตรวจ {asg.submittedCount - asg.gradedCount} คน
                      </Badge>
                    )}
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setGradingItem(asg)}
                    className="gap-1.5 text-xs bg-primary text-primary-foreground font-medium shadow-xs"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>ตรวจงานนักเรียน ({asg.submittedCount})</span>
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Dialogs */}
      <AssignmentFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        courses={courses}
        assignmentToEdit={editingItem}
      />

      <GradeSubmissionDialog
        open={Boolean(gradingItem)}
        onOpenChange={(open) => !open && setGradingItem(null)}
        assignment={gradingItem}
      />
    </div>
  );
}
