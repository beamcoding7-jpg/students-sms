"use client";

import React, { useMemo } from "react";
import {
  CalendarDays,
  Clock,
  BookOpen,
  GraduationCap,
  Users,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TimetableGrid, ScheduleItem } from "./TimetableGrid";
import { TimetableTimeline } from "./TimetableTimeline";
import { PrintTimetableButton } from "./PrintTimetableButton";

interface TeacherScheduleClientProps {
  teacherName: string;
  department: string;
  roomAdvisor?: string | null;
  schedules: ScheduleItem[];
}

export function TeacherScheduleClient({
  teacherName,
  department,
  roomAdvisor,
  schedules,
}: TeacherScheduleClientProps) {
  // สรุปภาระงานสอน
  const totalPeriods = schedules.length;
  const uniqueCourses = new Set(schedules.map((s) => s.courseCode)).size;
  const uniqueClassrooms = Array.from(new Set(schedules.map((s) => s.classroom))).sort();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ส่วนหัวหน้าจอ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-primary" />
            ตารางสอนประจำสัปดาห์
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {teacherName} • กลุ่มสาระการเรียนรู้ {department}
            {roomAdvisor ? ` • ครูที่ปรึกษา ${roomAdvisor}` : ""}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <PrintTimetableButton label="พิมพ์ตารางสอน" />
        </div>
      </div>

      {/* 3 KPI Cards ภาระงานสอน */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>ภาระงานสอนรวม</span>
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">
            {totalPeriods} <span className="text-xs font-normal text-muted-foreground">คาบ/สัปดาห์</span>
          </p>
          <p className="text-[11px] text-muted-foreground">เฉลี่ย {(totalPeriods / 5).toFixed(1)} คาบ/วัน</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>รายวิชาที่สอน</span>
            <BookOpen className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">
            {uniqueCourses} <span className="text-xs font-normal text-muted-foreground">วิชา</span>
          </p>
          <p className="text-[11px] text-muted-foreground">ในภาคเรียนปัจจุบัน</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>ห้องเรียนที่รับผิดชอบ</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">
            {uniqueClassrooms.length} <span className="text-xs font-normal text-muted-foreground">ห้อง</span>
          </p>
          <p className="text-[11px] text-muted-foreground truncate">
            {uniqueClassrooms.join(", ") || "-"}
          </p>
        </div>
      </div>

      {/* ส่วนแสดงตารางสอน (Timetable) */}
      <div id="printable-timetable" className="space-y-4">
        {/* Desktop View (md:block) */}
        <div className="hidden md:block">
          <TimetableGrid schedules={schedules} viewMode="teacher" />
        </div>

        {/* Mobile View (< md:hidden) */}
        <div className="block md:hidden">
          <TimetableTimeline schedules={schedules} viewMode="teacher" />
        </div>
      </div>
    </div>
  );
}
