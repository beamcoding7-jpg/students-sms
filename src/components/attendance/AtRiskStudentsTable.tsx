"use client";

import React from "react";
import { AlertTriangle, Phone, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface AtRiskStudent {
  id: string;
  studentCode: string;
  fullName: string;
  gradeLevel: string;
  classroom: string;
  absentCount: number;
  lateCount: number;
  leaveCount: number;
  parentName: string | null;
  parentPhone: string | null;
  attendanceRate: number; // 0 - 100
}

interface AtRiskStudentsTableProps {
  students: AtRiskStudent[];
}

export function AtRiskStudentsTable({ students }: AtRiskStudentsTableProps) {
  if (students.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center space-y-2">
        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <p className="font-semibold text-foreground text-sm">ไม่พบนักเรียนในกลุ่มเสี่ยง</p>
        <p className="text-xs text-muted-foreground">
          นักเรียนทุกคนมีอัตราเวลาเรียนอยู่ในเกณฑ์มาตรฐาน (≥ 80%) และไม่มีการขาดเรียนต่อเนื่อง
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm space-y-0">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-foreground">
              รายชื่อนักเรียนกลุ่มเสี่ยง (ขาด / มาสายสะสม)
            </h3>
            <p className="text-xs text-muted-foreground">
              นักเรียนที่มีอัตราการเข้าเรียน &lt; 85% หรือมีการขาด/สายที่ต้องติดตาม ({students.length} คน)
            </p>
          </div>
        </div>
      </div>

      {/* 1. Desktop Table (md:table) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40 text-muted-foreground border-b border-border text-xs">
            <tr>
              <th className="py-3 px-4 w-12 text-center">#</th>
              <th className="py-3 px-4 w-28">รหัส</th>
              <th className="py-3 px-4">ชื่อ - นามสกุล</th>
              <th className="py-3 px-4 w-24 text-center">ห้อง</th>
              <th className="py-3 px-4 w-28 text-center">เวลาเรียน (%)</th>
              <th className="py-3 px-4 w-32 text-center">สถิติ (ขาด/สาย/ลา)</th>
              <th className="py-3 px-4 w-36 text-center">สถานะความเสี่ยง</th>
              <th className="py-3 px-4 w-44">ติดต่อผู้ปกครอง</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {students.map((stu, idx) => (
              <tr key={stu.id} className="hover:bg-muted/20 transition-colors">
                <td className="py-3 px-4 text-center text-xs text-muted-foreground">
                  {idx + 1}
                </td>
                <td className="py-3 px-4 font-mono text-xs text-muted-foreground">
                  {stu.studentCode}
                </td>
                <td className="py-3 px-4 font-medium text-foreground">
                  {stu.fullName}
                </td>
                <td className="py-3 px-4 text-center text-xs">
                  {stu.gradeLevel}/{stu.classroom}
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={cn(
                      "font-bold text-xs px-2 py-0.5 rounded-full",
                      stu.attendanceRate < 80
                        ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                    )}
                  >
                    {stu.attendanceRate}%
                  </span>
                </td>
                <td className="py-3 px-4 text-center text-xs">
                  <span className="text-rose-600 font-semibold">{stu.absentCount} ขาด</span>
                  {" / "}
                  <span className="text-amber-600 font-semibold">{stu.lateCount} สาย</span>
                  {" / "}
                  <span className="text-blue-600">{stu.leaveCount} ลา</span>
                </td>
                <td className="py-3 px-4 text-center">
                  {stu.attendanceRate < 80 ? (
                    <Badge variant="destructive" className="text-[11px] gap-1">
                      <AlertTriangle className="w-3 h-3" /> เสี่ยงหมดสิทธิ์สอบ
                    </Badge>
                  ) : stu.absentCount > 0 ? (
                    <Badge variant="warning" className="text-[11px]">
                      ขาดเรียนสะสม
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[11px] text-amber-600 border-amber-300">
                      มาสายบ่อย
                    </Badge>
                  )}
                </td>
                <td className="py-3 px-4">
                  {stu.parentPhone ? (
                    <a
                      href={`tel:${stu.parentPhone}`}
                      className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                    >
                      <Phone className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                      <span>{stu.parentPhone}</span>
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 2. Mobile Card Stack (md:hidden) */}
      <div className="block md:hidden divide-y divide-border">
        {students.map((stu, idx) => (
          <div key={stu.id} className="p-4 space-y-2.5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-sm text-foreground">
                  {idx + 1}. {stu.fullName}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  {stu.studentCode} • ห้อง {stu.gradeLevel}/{stu.classroom}
                </p>
              </div>
              <span
                className={cn(
                  "font-bold text-xs px-2 py-0.5 rounded-full",
                  stu.attendanceRate < 80
                    ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                )}
              >
                {stu.attendanceRate}%
              </span>
            </div>

            {/* Badges & Counters */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900/60 font-medium">
                ขาด {stu.absentCount} วัน
              </span>
              <span className="bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900/60 font-medium">
                สาย {stu.lateCount} ครั้ง
              </span>
              <span className="bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900/60 font-medium">
                ลา {stu.leaveCount} วัน
              </span>
            </div>

            {/* Phone tap-to-call */}
            {stu.parentPhone && (
              <div className="pt-1">
                <a
                  href={`tel:${stu.parentPhone}`}
                  className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 px-3 rounded-lg text-xs font-medium bg-muted hover:bg-muted/80 text-foreground transition-colors border border-border"
                >
                  <Phone className="w-3.5 h-3.5 text-primary" />
                  <span>โทรหาผู้ปกครอง ({stu.parentName || "ผู้ปกครอง"}): {stu.parentPhone}</span>
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
