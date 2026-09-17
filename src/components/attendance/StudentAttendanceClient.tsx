"use client";

import React from "react";
import {
  CalendarCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserX,
  FileQuestion,
  GraduationCap,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface StudentAttendanceHistoryItem {
  id: string;
  date: string;
  dayLabel: string;
  status: "present" | "late" | "absent" | "leave";
  remarks: string | null;
  markedByName: string | null;
}

interface StudentAttendanceClientProps {
  studentName: string;
  studentCode: string;
  gradeAndRoom: string;
  totalDays: number;
  presentDays: number;
  lateDays: number;
  leaveDays: number;
  absentDays: number;
  attendanceRate: number; // 0 - 100
  history: StudentAttendanceHistoryItem[];
}

export function StudentAttendanceClient({
  studentName,
  studentCode,
  gradeAndRoom,
  totalDays,
  presentDays,
  lateDays,
  leaveDays,
  absentDays,
  attendanceRate,
  history,
}: StudentAttendanceClientProps) {
  const isExamEligible = attendanceRate >= 80;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* ส่วนหัวหน้าจอ */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <CalendarCheck className="w-6 h-6 text-primary" />
          ประวัติเวลาเรียนและสิทธิ์สอบ
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {studentName} ({studentCode}) • ห้อง {gradeAndRoom}
        </p>
      </div>

      {/* บัตรประเมินสิทธิ์สอบวัดผลปลายภาค (Exam Eligibility Card) */}
      <div
        className={cn(
          "rounded-2xl p-6 border shadow-sm transition-all",
          isExamEligible
            ? "bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/30"
            : "bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent border-rose-500/30"
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  isExamEligible
                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    : "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                )}
              >
                {isExamEligible ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <AlertTriangle className="w-6 h-6" />
                )}
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  สถานะการประเมินสิทธิ์สอบ
                </span>
                <h2
                  className={cn(
                    "text-xl font-bold",
                    isExamEligible
                      ? "text-emerald-900 dark:text-emerald-200"
                      : "text-rose-900 dark:text-rose-200"
                  )}
                >
                  {isExamEligible ? "มีสิทธิ์สอบวัดผลปลายภาค" : "เสี่ยงหมดสิทธิ์สอบปลายภาค"}
                </h2>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {isExamEligible
                ? `อัตราเวลาเรียนสะสมอยู่ที่ ${attendanceRate}% ซึ่งผ่านเกณฑ์ขั้นต่ำตามระเบียบของสถานศึกษา (≥ 80%) ขอให้นักเรียนรักษาเวลาเรียนอย่างสม่ำเสมอ`
                : `อัตราเวลาเรียนสะสมอยู่ที่ ${attendanceRate}% ซึ่งต่ำกว่าเกณฑ์ขั้นต่ำ (80%) กรุณาติดต่อครูประจำชั้นหรือฝ่ายวิชาการเพื่อยื่นคำร้อง`}
            </p>

            {/* แถบ Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-muted-foreground">อัตราการเข้าเรียนจริง</span>
                <span
                  className={cn(
                    "font-bold",
                    isExamEligible
                      ? "text-emerald-700 dark:text-emerald-300"
                      : "text-rose-700 dark:text-rose-300"
                  )}
                >
                  {attendanceRate}% (เกณฑ์ขั้นต่ำ 80%)
                </span>
              </div>
              <div className="w-full bg-muted/80 rounded-full h-3 overflow-hidden p-0.5 border border-border/50">
                <div
                  style={{ width: `${Math.min(attendanceRate, 100)}%` }}
                  className={cn(
                    "h-full rounded-full transition-all duration-700",
                    isExamEligible ? "bg-emerald-500" : "bg-rose-500"
                  )}
                />
              </div>
            </div>
          </div>

          {/* วงแหวนสรุปเปอร์เซ็นต์ (Circular Stat Badge) */}
          <div className="flex flex-col items-center justify-center p-5 bg-card/80 backdrop-blur rounded-xl border border-border/60 min-w-[140px] shrink-0 self-center sm:self-auto">
            <span
              className={cn(
                "text-4xl font-black",
                isExamEligible
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              )}
            >
              {attendanceRate}%
            </span>
            <span className="text-xs text-muted-foreground mt-1 font-medium">เวลาเรียนสะสม</span>
          </div>
        </div>
      </div>

      {/* การ์ดสรุปจำนวนสถิติ 4 ช่อง */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">มาเรียน</p>
            <p className="text-xl font-bold text-foreground">
              {presentDays} <span className="text-xs font-normal text-muted-foreground">วัน</span>
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">มาสาย</p>
            <p className="text-xl font-bold text-foreground">
              {lateDays} <span className="text-xs font-normal text-muted-foreground">ครั้ง</span>
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <FileQuestion className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">ลา (ป่วย/กิจ)</p>
            <p className="text-xl font-bold text-foreground">
              {leaveDays} <span className="text-xs font-normal text-muted-foreground">วัน</span>
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <UserX className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">ขาดเรียน</p>
            <p className="text-xl font-bold text-foreground">
              {absentDays} <span className="text-xs font-normal text-muted-foreground">วัน</span>
            </p>
          </div>
        </div>
      </div>

      {/* รายการบันทึกประวัติการเข้าเรียนรายวัน (Timeline / Table) */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-card flex items-center justify-between">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            ประวัติการบันทึกเวลาเรียนรายวัน ({history.length} วัน)
          </h3>
        </div>

        {history.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-sm">
            ยังไม่มีประวัติการเช็คชื่อในระบบ
          </div>
        ) : (
          <>
            {/* 1. Desktop Table (hidden on mobile) */}
            <div className="hidden sm:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40 text-muted-foreground border-b border-border text-xs">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4 w-36">วันที่</th>
                    <th className="py-3 px-4 w-32 text-center">สถานะ</th>
                    <th className="py-3 px-4">หมายเหตุ</th>
                    <th className="py-3 px-4 w-44 text-right">ผู้บันทึก</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {history.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3.5 px-4 text-center text-xs text-muted-foreground">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-foreground">
                        {item.dayLabel}
                        <span className="block text-[11px] font-mono text-muted-foreground">
                          {item.date}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge
                          variant={
                            item.status === "present"
                              ? "success"
                              : item.status === "late"
                              ? "warning"
                              : item.status === "leave"
                              ? "info"
                              : "destructive"
                          }
                          className="text-xs"
                        >
                          {item.status === "present"
                            ? "มาเรียน"
                            : item.status === "late"
                            ? "มาสาย"
                            : item.status === "leave"
                            ? "ลา"
                            : "ขาดเรียน"}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground text-xs">
                        {item.remarks || "-"}
                      </td>
                      <td className="py-3.5 px-4 text-right text-xs text-muted-foreground">
                        {item.markedByName || "ครูประจำชั้น"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 2. Mobile Timeline Cards (sm:hidden) */}
            <div className="block sm:hidden divide-y divide-border">
              {history.map((item, idx) => (
                <div key={item.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm text-foreground">{item.dayLabel}</p>
                      <p className="text-xs text-muted-foreground font-mono">{item.date}</p>
                    </div>
                    <Badge
                      variant={
                        item.status === "present"
                          ? "success"
                          : item.status === "late"
                          ? "warning"
                          : item.status === "leave"
                          ? "info"
                          : "destructive"
                      }
                      className="text-xs"
                    >
                      {item.status === "present"
                        ? "มาเรียน"
                        : item.status === "late"
                        ? "มาสาย"
                        : item.status === "leave"
                        ? "ลา"
                        : "ขาดเรียน"}
                    </Badge>
                  </div>

                  {item.remarks && (
                    <p className="text-xs text-muted-foreground bg-muted/40 p-2 rounded-lg border border-border/50">
                      หมายเหตุ: {item.remarks}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                    <span>ลำดับที่ {idx + 1}</span>
                    <span>ผู้บันทึก: {item.markedByName || "ครูประจำชั้น"}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
