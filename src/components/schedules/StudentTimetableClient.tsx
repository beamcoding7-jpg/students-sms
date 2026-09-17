"use client";

import React from "react";
import {
  CalendarDays,
  Clock,
  BookOpen,
  GraduationCap,
  User,
  School,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TimetableGrid, ScheduleItem } from "./TimetableGrid";
import { TimetableTimeline } from "./TimetableTimeline";
import { PrintTimetableButton } from "./PrintTimetableButton";

interface StudentTimetableClientProps {
  studentName: string;
  studentCode: string;
  classroom: string; // เช่น "ม.4/1"
  advisorName?: string | null;
  schedules: ScheduleItem[];
}

export function StudentTimetableClient({
  studentName,
  studentCode,
  classroom,
  advisorName,
  schedules,
}: StudentTimetableClientProps) {
  const totalPeriods = schedules.length;
  const uniqueCourses = new Set(schedules.map((s) => s.courseCode)).size;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ส่วนหัวหน้าจอ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-primary" />
            ตารางเรียนประจำสัปดาห์
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {studentName} ({studentCode}) • ชั้นมัธยมศึกษาปีที่ {classroom}
            {advisorName ? ` • ครูที่ปรึกษา: ${advisorName}` : ""}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <PrintTimetableButton label="พิมพ์ตารางเรียน" />
        </div>
      </div>

      {/* Hero Header Card ข้อมูลห้องเรียน */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <School className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">ระดับชั้นและห้องเรียน</p>
              <p className="font-bold text-base text-foreground">ชั้น {classroom}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">เวลาเรียนในสัปดาห์</p>
              <p className="font-bold text-base text-foreground">
                {totalPeriods} <span className="text-xs font-normal text-muted-foreground">คาบเรียน / สัปดาห์</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">จำนวนวิชาที่เรียน</p>
              <p className="font-bold text-base text-foreground">
                {uniqueCourses} <span className="text-xs font-normal text-muted-foreground">รายวิชา</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ส่วนแสดงตารางเรียน (Timetable) */}
      <div id="printable-timetable" className="space-y-4">
        {/* Desktop View (md:block) */}
        <div className="hidden md:block">
          <TimetableGrid schedules={schedules} viewMode="classroom" />
        </div>

        {/* Mobile View (< md:hidden) */}
        <div className="block md:hidden">
          <TimetableTimeline schedules={schedules} viewMode="classroom" />
        </div>
      </div>
    </div>
  );
}
