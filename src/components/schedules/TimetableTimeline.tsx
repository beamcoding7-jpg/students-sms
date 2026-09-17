"use client";

import React, { useState, useEffect } from "react";
import { Clock, MapPin, User, BookOpen, Utensils, CalendarDays, MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ScheduleItem } from "./TimetableGrid";

interface TimetableTimelineProps {
  schedules: ScheduleItem[];
  viewMode?: "classroom" | "teacher";
  onEditSchedule?: (schedule: ScheduleItem) => void;
  onDeleteSchedule?: (schedule: ScheduleItem) => void;
  canManage?: boolean;
}

const DAYS: Array<"จันทร์" | "อังคาร" | "พุธ" | "พฤหัสบดี" | "ศุกร์"> = [
  "จันทร์",
  "อังคาร",
  "พุธ",
  "พฤหัสบดี",
  "ศุกร์",
];

const DAY_LABELS: Record<string, string> = {
  จันทร์: "จ.",
  อังคาร: "อ.",
  พุธ: "พ.",
  พฤหัสบดี: "พฤ.",
  ศุกร์: "ศ.",
};

const DAY_ACTIVE_STYLES: Record<string, string> = {
  จันทร์: "bg-amber-500 text-white shadow-sm border-amber-600",
  อังคาร: "bg-rose-500 text-white shadow-sm border-rose-600",
  พุธ: "bg-emerald-600 text-white shadow-sm border-emerald-700",
  พฤหัสบดี: "bg-orange-500 text-white shadow-sm border-orange-600",
  ศุกร์: "bg-sky-500 text-white shadow-sm border-sky-600",
};

export function TimetableTimeline({
  schedules,
  viewMode = "classroom",
  onEditSchedule,
  onDeleteSchedule,
  canManage = false,
}: TimetableTimelineProps) {
  // หาค่าเริ่มต้นวันปัจจุบัน (จันทร์ - ศุกร์)
  const getInitialDay = (): "จันทร์" | "อังคาร" | "พุธ" | "พฤหัสบดี" | "ศุกร์" => {
    const dayIndex = new Date().getDay(); // 0 = อาทิตย์, 1 = จันทร์, ..., 5 = ศุกร์
    if (dayIndex >= 1 && dayIndex <= 5) {
      return DAYS[dayIndex - 1];
    }
    return "จันทร์";
  };

  const [activeDay, setActiveDay] = useState<"จันทร์" | "อังคาร" | "พุธ" | "พฤหัสบดี" | "ศุกร์">(
    getInitialDay
  );

  // คาบเรียนของวันที่เลือก
  const activeSchedules = schedules
    .filter((s) => s.dayOfWeek === activeDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-4">
      {/* Segmented Day Selector Bar (5 ปุ่มสัมผัส ≥ 44px) */}
      <div className="bg-card border border-border p-1.5 rounded-2xl shadow-xs grid grid-cols-5 gap-1">
        {DAYS.map((day) => {
          const isActive = activeDay === day;
          const dayCount = schedules.filter((s) => s.dayOfWeek === day).length;

          return (
            <button
              key={day}
              type="button"
              onClick={() => setActiveDay(day)}
              className={cn(
                "min-h-[46px] rounded-xl text-xs font-bold flex flex-col items-center justify-center transition-all border",
                isActive
                  ? DAY_ACTIVE_STYLES[day]
                  : "border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              <span>{day}</span>
              <span
                className={cn(
                  "text-[10px] font-normal",
                  isActive ? "text-white/90" : "text-muted-foreground"
                )}
              >
                {dayCount} คาบ
              </span>
            </button>
          );
        })}
      </div>

      {/* รายการคาบเรียนในวันที่เลือกแบบ Timeline Card Stack */}
      {activeSchedules.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-8 text-center space-y-2">
          <CalendarDays className="w-10 h-10 text-muted-foreground mx-auto opacity-40" />
          <p className="font-semibold text-sm text-foreground">ไม่มีตารางเรียนในวัน{activeDay}</p>
          <p className="text-xs text-muted-foreground">
            ยังไม่มีการจัดตารางสอนสำหรับวันนี้ หรือเป็นวันหยุดกิจกรรม
          </p>
        </div>
      ) : (
        <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-border before:z-0">
          {activeSchedules.map((item, idx) => {
            // เช็คว่ามีคาบเช้าที่จบก่อน 12:00 แล้วคาบนี้เริ่มบ่าย 13:00 ขึ้นไปหรือไม่
            const showLunchBefore =
              idx > 0 &&
              activeSchedules[idx - 1].endTime <= "12:00" &&
              item.startTime >= "13:00";

            return (
              <React.Fragment key={item.id}>
                {/* แถบคั่นพักกลางวัน */}
                {showLunchBefore && (
                  <div className="relative z-10 pl-9 my-2">
                    <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl p-2.5 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
                      <Utensils className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                      <span className="font-medium">พักกลางวัน (12:00 – 13:00 น.)</span>
                    </div>
                  </div>
                )}

                {/* การ์ดคาบเรียน */}
                <div className="relative z-10 pl-9">
                  {/* จุด Bullet Timeline */}
                  <div className="absolute left-1.5 top-5 w-4 h-4 rounded-full border-2 border-background bg-primary shadow-xs" />

                  <div className="bg-card border border-border rounded-xl p-3.5 shadow-sm space-y-2 hover:border-primary/40 transition-colors">
                    {/* แถบเวลาและห้องเรียน */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold font-mono text-primary flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {item.startTime} - {item.endTime} น.
                      </span>
                      <Badge variant="outline" className="text-[11px] gap-1 px-2 py-0.5">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        {item.roomNumber}
                      </Badge>
                    </div>

                    {/* ชื่อวิชาและรหัสวิชา */}
                    <div>
                      <span className="text-xs font-mono font-bold text-muted-foreground">
                        {item.courseCode} ({item.credits} นก.)
                      </span>
                      <h4 className="font-bold text-sm text-foreground leading-snug">
                        {item.courseName}
                      </h4>
                    </div>

                    {/* ผู้สอน หรือ ห้องเรียน */}
                    <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                      {viewMode === "classroom" ? (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <User className="w-3.5 h-3.5 text-primary" />
                          <span className="font-medium text-foreground">{item.teacherName}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <BookOpen className="w-3.5 h-3.5 text-primary" />
                          <span className="font-medium text-foreground">ห้อง {item.classroom}</span>
                        </div>
                      )}

                      {/* ปุ่มจัดการสำหรับ Admin */}
                      {canManage && (
                        <div className="flex items-center gap-2">
                          {onEditSchedule && (
                            <button
                              type="button"
                              onClick={() => onEditSchedule(item)}
                              className="text-primary hover:underline text-xs font-medium"
                            >
                              แก้ไข
                            </button>
                          )}
                          {onDeleteSchedule && (
                            <button
                              type="button"
                              onClick={() => onDeleteSchedule(item)}
                              className="text-destructive hover:underline text-xs font-medium"
                            >
                              ลบ
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}
