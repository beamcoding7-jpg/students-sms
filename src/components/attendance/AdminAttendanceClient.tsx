"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  UserX,
  FileQuestion,
  Download,
  Filter,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AttendanceTrendsChart, DayTrend } from "./AttendanceTrendsChart";
import { AtRiskStudentsTable, AtRiskStudent } from "./AtRiskStudentsTable";
import { cn } from "@/lib/utils";

export interface AttendanceKPIStats {
  totalRecords: number;
  presentCount: number;
  lateCount: number;
  leaveCount: number;
  absentCount: number;
  attendanceRate: number; // 0 - 100
}

interface AdminAttendanceClientProps {
  overallStats: AttendanceKPIStats;
  dailyTrends: DayTrend[];
  atRiskStudents: AtRiskStudent[];
  gradeLevels: string[];
  classrooms: string[];
}

export function AdminAttendanceClient({
  overallStats,
  dailyTrends,
  atRiskStudents,
  gradeLevels,
  classrooms,
}: AdminAttendanceClientProps) {
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [selectedClassroom, setSelectedClassroom] = useState<string>("all");

  // กรอง At-Risk Students ตาม Filter ระดับชั้น/ห้องเรียน
  const filteredAtRisk = useMemo(() => {
    return atRiskStudents.filter((stu) => {
      const matchGrade = selectedGrade === "all" || stu.gradeLevel === selectedGrade;
      const matchClassroom = selectedClassroom === "all" || stu.classroom === selectedClassroom;
      return matchGrade && matchClassroom;
    });
  }, [atRiskStudents, selectedGrade, selectedClassroom]);

  // สร้าง URL สำหรับ Export CSV
  const exportUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedGrade !== "all") params.set("gradeLevel", selectedGrade);
    if (selectedClassroom !== "all") params.set("classroom", selectedClassroom);
    return `/api/attendance/export?${params.toString()}`;
  }, [selectedGrade, selectedClassroom]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ส่วนหัวหน้าจอ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-primary" />
            สถิติและการติดตามการเข้าเรียน
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            รายงานภาพรวมการมาเรียน สถิติแนวโน้ม และการแจ้งเตือนนักเรียนกลุ่มเสี่ยง
          </p>
        </div>

        {/* ปุ่มส่งออกรายงาน CSV */}
        <div className="flex items-center gap-3">
          <a
            href={exportUrl}
            download
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-card hover:bg-muted text-foreground border border-border shadow-sm transition-colors"
          >
            <Download className="w-4 h-4 text-primary" />
            <span>ส่งออกรายงาน CSV</span>
          </a>
        </div>
      </div>

      {/* แถบตัวกรองระดับชั้นและห้องเรียน */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
          <Filter className="w-4 h-4" />
          <span className="font-medium">ตัวกรอง:</span>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 flex-1">
          {/* เลือกระดับชั้น */}
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="h-9 px-3 rounded-lg border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">ทุกระดับชั้น</option>
            {gradeLevels.map((g) => (
              <option key={g} value={g}>
                ระดับชั้น {g}
              </option>
            ))}
          </select>

          {/* เลือกห้องเรียน */}
          <select
            value={selectedClassroom}
            onChange={(e) => setSelectedClassroom(e.target.value)}
            className="h-9 px-3 rounded-lg border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">ทุกห้องเรียน</option>
            {classrooms.map((c) => (
              <option key={c} value={c}>
                ห้อง {c}
              </option>
            ))}
          </select>

          {(selectedGrade !== "all" || selectedClassroom !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSelectedGrade("all");
                setSelectedClassroom("all");
              }}
              className="text-xs text-primary hover:underline px-2 py-1"
            >
              ล้างตัวกรอง
            </button>
          )}
        </div>
      </div>

      {/* 5 KPI Cards สรุปภาพรวม */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* 1. อัตราการเข้าเรียนรวม */}
        <div className="col-span-2 sm:col-span-1 bg-card border border-border rounded-xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>อัตราเข้าเรียนรวม</span>
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={cn(
                "text-2xl sm:text-3xl font-bold",
                overallStats.attendanceRate >= 90
                  ? "text-emerald-600 dark:text-emerald-400"
                  : overallStats.attendanceRate >= 80
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-rose-600 dark:text-rose-400"
              )}
            >
              {overallStats.attendanceRate}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <div
              style={{ width: `${overallStats.attendanceRate}%` }}
              className="bg-primary h-full rounded-full transition-all"
            />
          </div>
          <p className="text-[11px] text-muted-foreground">บันทึกทั้งหมด {overallStats.totalRecords} รายการ</p>
        </div>

        {/* 2. มาเรียน */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>มาเรียน</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">{overallStats.presentCount}</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            {overallStats.totalRecords > 0
              ? `${Math.round((overallStats.presentCount / overallStats.totalRecords) * 100)}%`
              : "0%"}
          </p>
        </div>

        {/* 3. มาสาย */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>มาสาย</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">{overallStats.lateCount}</p>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            {overallStats.totalRecords > 0
              ? `${Math.round((overallStats.lateCount / overallStats.totalRecords) * 100)}%`
              : "0%"}
          </p>
        </div>

        {/* 4. ลา (ป่วย/กิจ) */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>ลา</span>
            <FileQuestion className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">{overallStats.leaveCount}</p>
          <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
            {overallStats.totalRecords > 0
              ? `${Math.round((overallStats.leaveCount / overallStats.totalRecords) * 100)}%`
              : "0%"}
          </p>
        </div>

        {/* 5. ขาดเรียน */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>ขาดเรียน</span>
            <UserX className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">{overallStats.absentCount}</p>
          <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
            {overallStats.totalRecords > 0
              ? `${Math.round((overallStats.absentCount / overallStats.totalRecords) * 100)}%`
              : "0%"}
          </p>
        </div>
      </div>

      {/* กราฟแท่งแนวโน้ม 5 วันทำการย้อนหลัง */}
      <AttendanceTrendsChart trends={dailyTrends} />

      {/* ตารางนักเรียนกลุ่มเสี่ยง */}
      <AtRiskStudentsTable students={filteredAtRisk} />
    </div>
  );
}
