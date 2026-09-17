"use client";

import React, { useState, useTransition, useMemo } from "react";
import {
  Award,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  TrendingUp,
  Users,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  saveCourseGradesAction,
  getCourseGradesAction,
  StudentGradeRow,
} from "@/app/(dashboard)/teacher/grades/actions";
import { calculateGradeLetter } from "@/lib/validations/grade";

interface CourseOption {
  id: string;
  courseCode: string;
  courseName: string;
  credits: number;
}

interface TeacherGradebookClientProps {
  courses: CourseOption[];
  initialCourseId: string;
  initialStudents: StudentGradeRow[];
  teacherName: string;
}

// ฟังก์ชันคืนค่าสีของ Badge เกรดตามระดับ 0 - 4.0
export function getGradeBadgeClass(grade: string): string {
  switch (grade) {
    case "4.0":
      return "bg-emerald-600 text-white font-bold";
    case "3.5":
      return "bg-emerald-500/80 text-white font-bold";
    case "3.0":
      return "bg-blue-600 text-white font-bold";
    case "2.5":
      return "bg-blue-500/80 text-white font-bold";
    case "2.0":
      return "bg-amber-500 text-white font-bold";
    case "1.5":
      return "bg-amber-600/80 text-white font-bold";
    case "1.0":
      return "bg-orange-500 text-white font-bold";
    default:
      return "bg-rose-600 text-white font-bold";
  }
}

export function TeacherGradebookClient({
  courses,
  initialCourseId,
  initialStudents,
  teacherName,
}: TeacherGradebookClientProps) {
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId);
  const [students, setStudents] = useState<StudentGradeRow[]>(initialStudents);
  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  // รายวิชาปัจจุบันที่เลือกอยู่
  const currentCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

  // เมื่อครูเปลี่ยนวิชาที่สอน
  const handleCourseChange = (newCourseId: string) => {
    setSelectedCourseId(newCourseId);
    setFeedback(null);
    startTransition(async () => {
      const res = await getCourseGradesAction(newCourseId);
      if (res.success && res.data) {
        setStudents(res.data.students);
      } else {
        setFeedback({ type: "error", message: res.error || "ไม่สามารถโหลดข้อมูลคะแนนได้" });
      }
    });
  };

  // จัดการการเปลี่ยนคะแนนของนักเรียนรายคนแบบ Real-time
  const handleScoreChange = (
    studentId: string,
    field: "homeworkScore" | "midtermScore" | "finalScore",
    valStr: string
  ) => {
    const rawVal = parseFloat(valStr);
    const numVal = isNaN(rawVal) ? 0 : Math.max(0, rawVal);

    // ตรวจสอบคะแนนเต็ม
    let maxLimit = 50;
    if (field === "midtermScore") maxLimit = 20;
    if (field === "finalScore") maxLimit = 30;

    const clampedVal = Math.min(numVal, maxLimit);

    setStudents((prev) =>
      prev.map((s) => {
        if (s.studentId !== studentId) return s;

        const updated = { ...s, [field]: clampedVal };
        const total =
          Math.round((updated.homeworkScore + updated.midtermScore + updated.finalScore) * 10) / 10;
        const letter = calculateGradeLetter(total);

        return {
          ...updated,
          totalScore: total,
          gradeLetter: letter,
        };
      })
    );
  };

  // คำนวณสถิติวิเคราะห์คะแนนของรายวิชานี้แบบ Real-time
  const stats = useMemo(() => {
    if (students.length === 0) {
      return { avgScore: 0, maxScore: 0, minScore: 0, passCount: 0, passRate: 0, grade4Count: 0 };
    }

    let sum = 0;
    let max = -Infinity;
    let min = Infinity;
    let pass = 0;
    let g4 = 0;

    for (const s of students) {
      sum += s.totalScore;
      if (s.totalScore > max) max = s.totalScore;
      if (s.totalScore < min) min = s.totalScore;
      if (parseFloat(s.gradeLetter) >= 1.0) pass++;
      if (s.gradeLetter === "4.0") g4++;
    }

    const avg = Math.round((sum / students.length) * 10) / 10;
    const rate = Math.round((pass / students.length) * 100);

    return {
      avgScore: avg,
      maxScore: max === -Infinity ? 0 : max,
      minScore: min === Infinity ? 0 : min,
      passCount: pass,
      passRate: rate,
      grade4Count: g4,
    };
  }, [students]);

  // บันทึกคะแนนลงฐานข้อมูล
  const handleSaveGrades = async () => {
    if (students.length === 0) return;

    setIsSaving(true);
    setFeedback(null);

    const payload = {
      courseId: selectedCourseId,
      records: students.map((s) => ({
        studentId: s.studentId,
        courseId: selectedCourseId,
        homeworkScore: s.homeworkScore,
        midtermScore: s.midtermScore,
        finalScore: s.finalScore,
      })),
    };

    const res = await saveCourseGradesAction(payload);
    setIsSaving(false);

    if (res.success) {
      setFeedback({ type: "success", message: res.message || "บันทึกผลการเรียนเรียบร้อยแล้ว" });
    } else {
      setFeedback({ type: "error", message: res.error || "เกิดข้อผิดพลาดในการบันทึกคะแนน" });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* ส่วนหัวหน้าจอ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Award className="w-6 h-6 text-primary" />
            สมุดบันทึกคะแนนและตัดเกรด (Gradebook)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            ครูผู้สอน: <span className="font-semibold text-foreground">{teacherName}</span>
          </p>
        </div>

        {/* ตัวเลือกรายวิชาที่สอน */}
        <div className="flex items-center gap-2 max-w-sm w-full sm:w-auto">
          <BookOpen className="w-5 h-5 text-muted-foreground shrink-0" />
          <select
            value={selectedCourseId}
            onChange={(e) => handleCourseChange(e.target.value)}
            disabled={isPending || isSaving}
            className="w-full h-10 px-3 py-2 rounded-lg border border-input bg-card text-sm ring-offset-background font-medium focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.courseCode} - {c.courseName} ({c.credits} นก.)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* แถบสถิติวิเคราะห์คะแนนแบบ Real-time (Analytics Bar) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>คะแนนเฉลี่ย</span>
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">
            {stats.avgScore} <span className="text-xs font-normal text-muted-foreground">/ 100</span>
          </p>
          <p className="text-[11px] text-muted-foreground">
            สูงสุด {stats.maxScore} • ต่ำสุด {stats.minScore}
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>อัตราสอบผ่าน (≥ 1.0)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.passRate}%</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            ผ่าน {stats.passCount} จาก {students.length} คน
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>เกรด 4.0 (ยอดเยี่ยม)</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.grade4Count}</p>
          <p className="text-[11px] text-muted-foreground">
            คิดเป็น {students.length > 0 ? Math.round((stats.grade4Count / students.length) * 100) : 0}% ของห้อง
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>นักเรียนในรายวิชา</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">{students.length}</p>
          <p className="text-[11px] text-muted-foreground">ลงทะเบียนในรายวิชานี้</p>
        </div>
      </div>

      {/* แจ้งเตือนข้อความ Feedback */}
      {feedback && (
        <div
          className={cn(
            "p-3.5 rounded-xl text-sm flex items-center gap-2.5",
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              : "bg-destructive/10 text-destructive border border-destructive/20"
          )}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* 1. Desktop Table View (≥ 768px) */}
      <div className="hidden md:block bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b border-border text-xs text-muted-foreground">
            <tr>
              <th className="py-3 px-4 w-12 text-center">#</th>
              <th className="py-3 px-4 w-28">รหัสนักเรียน</th>
              <th className="py-3 px-4">ชื่อ - นามสกุล</th>
              <th className="py-3 px-4 w-20 text-center">ห้อง</th>
              <th className="py-3 px-3 w-32 text-center">คะแนนเก็บ (50)</th>
              <th className="py-3 px-3 w-32 text-center">กลางภาค (20)</th>
              <th className="py-3 px-3 w-32 text-center">ปลายภาค (30)</th>
              <th className="py-3 px-4 w-28 text-center font-bold">รวม (100)</th>
              <th className="py-3 px-4 w-24 text-center font-bold">เกรด</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {students.map((stu, idx) => (
              <tr key={stu.studentId} className="hover:bg-muted/20 transition-colors">
                <td className="py-3 px-4 text-center text-xs text-muted-foreground">
                  {idx + 1}
                </td>
                <td className="py-3 px-4 font-mono text-xs text-muted-foreground">
                  {stu.studentCode}
                </td>
                <td className="py-3 px-4 font-medium text-foreground">
                  {stu.fullName}
                </td>
                <td className="py-3 px-4 text-center text-xs text-muted-foreground">
                  {stu.classroom}
                </td>
                {/* ช่องกรอกคะแนนเก็บ (50) */}
                <td className="py-2.5 px-3">
                  <Input
                    type="number"
                    min={0}
                    max={50}
                    step="0.5"
                    value={stu.homeworkScore}
                    onChange={(e) =>
                      handleScoreChange(stu.studentId, "homeworkScore", e.target.value)
                    }
                    className="h-8 text-center font-mono text-xs bg-background"
                  />
                </td>
                {/* ช่องกรอกคะแนนกลางภาค (20) */}
                <td className="py-2.5 px-3">
                  <Input
                    type="number"
                    min={0}
                    max={20}
                    step="0.5"
                    value={stu.midtermScore}
                    onChange={(e) =>
                      handleScoreChange(stu.studentId, "midtermScore", e.target.value)
                    }
                    className="h-8 text-center font-mono text-xs bg-background"
                  />
                </td>
                {/* ช่องกรอกคะแนนปลายภาค (30) */}
                <td className="py-2.5 px-3">
                  <Input
                    type="number"
                    min={0}
                    max={30}
                    step="0.5"
                    value={stu.finalScore}
                    onChange={(e) =>
                      handleScoreChange(stu.studentId, "finalScore", e.target.value)
                    }
                    className="h-8 text-center font-mono text-xs bg-background"
                  />
                </td>
                {/* คะแนนรวม (100) */}
                <td className="py-3 px-4 text-center font-mono font-bold text-sm text-foreground">
                  {stu.totalScore}
                </td>
                {/* เกรดตัวเลข */}
                <td className="py-3 px-4 text-center">
                  <span
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs tracking-tight shadow-xs",
                      getGradeBadgeClass(stu.gradeLetter)
                    )}
                  >
                    {stu.gradeLetter}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 2. Mobile Card Stack (< 768px) */}
      <div className="block md:hidden space-y-3">
        {students.map((stu, idx) => (
          <div
            key={stu.studentId}
            className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-foreground">
                  {idx + 1}. {stu.fullName}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  {stu.studentCode} • ห้อง {stu.classroom}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-muted-foreground">
                  รวม {stu.totalScore}
                </span>
                <span
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-bold shadow-xs",
                    getGradeBadgeClass(stu.gradeLetter)
                  )}
                >
                  เกรด {stu.gradeLetter}
                </span>
              </div>
            </div>

            {/* ช่องกรอกคะแนน 3 ช่องบนมือถือ */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                  เก็บ (50)
                </label>
                <Input
                  type="number"
                  min={0}
                  max={50}
                  step="0.5"
                  value={stu.homeworkScore}
                  onChange={(e) =>
                    handleScoreChange(stu.studentId, "homeworkScore", e.target.value)
                  }
                  className="h-10 text-center font-mono text-sm bg-background"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                  กลางภาค (20)
                </label>
                <Input
                  type="number"
                  min={0}
                  max={20}
                  step="0.5"
                  value={stu.midtermScore}
                  onChange={(e) =>
                    handleScoreChange(stu.studentId, "midtermScore", e.target.value)
                  }
                  className="h-10 text-center font-mono text-sm bg-background"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                  ปลายภาค (30)
                </label>
                <Input
                  type="number"
                  min={0}
                  max={30}
                  step="0.5"
                  value={stu.finalScore}
                  onChange={(e) =>
                    handleScoreChange(stu.studentId, "finalScore", e.target.value)
                  }
                  className="h-10 text-center font-mono text-sm bg-background"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating / Sticky Save Bar ด้านล่าง */}
      {students.length > 0 && (
        <div className="sticky bottom-4 z-20 bg-card/95 backdrop-blur border border-border rounded-xl p-4 shadow-xl flex items-center justify-between gap-4">
          <div className="text-xs text-muted-foreground hidden sm:block">
            วิชา <span className="font-semibold text-foreground">{currentCourse?.courseCode}</span> | นักเรียน {students.length} คน
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="default"
              size="lg"
              onClick={handleSaveGrades}
              disabled={isSaving || isPending}
              className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 shadow-md"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  กำลังบันทึกคะแนน...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  บันทึกผลการเรียนทั้งหมด
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
