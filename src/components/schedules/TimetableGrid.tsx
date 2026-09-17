"use client";

import React from "react";
import { BookOpen, MapPin, User, Utensils } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface ScheduleItem {
  id: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  classroom: string;
  dayOfWeek: "จันทร์" | "อังคาร" | "พุธ" | "พฤหัสบดี" | "ศุกร์";
  startTime: string; // เช่น "08:30"
  endTime: string; // เช่น "10:10"
  roomNumber: string; // เช่น "ห้องเรียน 411"
  teacherName: string;
  department?: string;
}

interface TimetableGridProps {
  schedules: ScheduleItem[];
  viewMode?: "classroom" | "teacher"; // classroom = มุมมองนักเรียน (แสดงครู), teacher = มุมมองครู (แสดงห้องเรียนที่สอน)
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

// โค้ดสีประจำวันตามวัฒนธรรมไทย
const DAY_STYLES: Record<string, { badge: string; header: string; border: string; bg: string }> = {
  จันทร์: {
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300",
    header: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-l-4 border-l-amber-500",
    border: "border-amber-300 dark:border-amber-800/80",
    bg: "bg-amber-50/40 dark:bg-amber-950/20 hover:bg-amber-50/80 dark:hover:bg-amber-950/40",
  },
  อังคาร: {
    badge: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300",
    header: "bg-rose-500/15 text-rose-800 dark:text-rose-300 border-l-4 border-l-rose-500",
    border: "border-rose-300 dark:border-rose-800/80",
    bg: "bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-50/80 dark:hover:bg-rose-950/40",
  },
  พุธ: {
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300",
    header: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-l-4 border-l-emerald-500",
    border: "border-emerald-300 dark:border-emerald-800/80",
    bg: "bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40",
  },
  พฤหัสบดี: {
    badge: "bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-300",
    header: "bg-orange-500/15 text-orange-800 dark:text-orange-300 border-l-4 border-l-orange-500",
    border: "border-orange-300 dark:border-orange-800/80",
    bg: "bg-orange-50/40 dark:bg-orange-950/20 hover:bg-orange-50/80 dark:hover:bg-orange-950/40",
  },
  ศุกร์: {
    badge: "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-300",
    header: "bg-sky-500/15 text-sky-800 dark:text-sky-300 border-l-4 border-l-sky-500",
    border: "border-sky-300 dark:border-sky-800/80",
    bg: "bg-sky-50/40 dark:bg-sky-950/20 hover:bg-sky-50/80 dark:hover:bg-sky-950/40",
  },
};

export function TimetableGrid({
  schedules,
  viewMode = "classroom",
  onEditSchedule,
  onDeleteSchedule,
  canManage = false,
}: TimetableGridProps) {
  // จัดกลุ่มคาบเรียนตามวันในสัปดาห์
  const schedulesByDay = DAYS.reduce((acc, day) => {
    acc[day] = schedules
      .filter((s) => s.dayOfWeek === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    return acc;
  }, {} as Record<string, ScheduleItem[]>);

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden print:border-none print:shadow-none">
      {/* ตารางแบบ Weekly Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[768px]">
          <thead>
            <tr className="bg-muted/60 border-b border-border text-xs text-muted-foreground">
              <th className="py-3 px-4 w-28 text-center font-bold">วัน</th>
              <th className="py-3 px-4 font-bold">คาบเรียนและตารางกิจกรรม (08:30 – 16:30 น.)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {DAYS.map((day) => {
              const dayClasses = schedulesByDay[day] || [];
              const styles = DAY_STYLES[day];

              return (
                <tr key={day} className="transition-colors hover:bg-muted/10">
                  {/* คอลัมน์หัวแถว: ชื่อวัน */}
                  <td
                    className={cn(
                      "py-4 px-4 text-center font-bold align-middle border-r border-border shrink-0 select-none",
                      styles.header
                    )}
                  >
                    <span className="block text-base">{day}</span>
                    <span className="text-[11px] font-normal opacity-80">
                      {dayClasses.length} วิชา
                    </span>
                  </td>

                  {/* คอลัมน์คาบเรียนของวันนั้น */}
                  <td className="py-3.5 px-4 align-middle">
                    {dayClasses.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic py-3">
                        ไม่มีตารางเรียนในวันนี้
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-3 items-stretch">
                        {dayClasses.map((item) => (
                          <div
                            key={item.id}
                            className={cn(
                              "border rounded-xl p-3 shadow-xs transition-all relative group flex flex-col justify-between min-w-[210px] max-w-[270px] flex-1",
                              styles.border,
                              styles.bg
                            )}
                          >
                            <div>
                              {/* แถบเวลาและห้องเรียน */}
                              <div className="flex items-center justify-between gap-1 mb-1.5">
                                <span className="text-xs font-mono font-bold text-foreground">
                                  {item.startTime} - {item.endTime} น.
                                </span>
                                <Badge variant="outline" className="text-[10px] gap-1 px-1.5 py-0 h-5">
                                  <MapPin className="w-2.5 h-2.5 text-primary" />
                                  {item.roomNumber}
                                </Badge>
                              </div>

                              {/* รหัสวิชาและชื่อวิชา */}
                              <div className="space-y-0.5">
                                <span className="text-xs font-bold text-primary tracking-tight block">
                                  {item.courseCode} ({item.credits} นก.)
                                </span>
                                <p className="font-semibold text-sm text-foreground leading-tight line-clamp-1">
                                  {item.courseName}
                                </p>
                              </div>
                            </div>

                            {/* ข้อมูลผู้สอนหรือห้องเรียน */}
                            <div className="mt-2.5 pt-2 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                              {viewMode === "classroom" ? (
                                <span className="flex items-center gap-1.5 truncate">
                                  <User className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                                  <span className="truncate">{item.teacherName}</span>
                                </span>
                              ) : (
                                <span className="flex items-center gap-1.5 font-medium text-foreground">
                                  <BookOpen className="w-3.5 h-3.5 shrink-0 text-primary" />
                                  <span>ห้อง {item.classroom}</span>
                                </span>
                              )}

                              {/* ปุ่มจัดการสำหรับ Admin (ลอยขึ้นมาเมื่อ Hover) */}
                              {canManage && (
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                                  {onEditSchedule && (
                                    <button
                                      type="button"
                                      onClick={() => onEditSchedule(item)}
                                      className="text-primary hover:underline text-[11px] font-medium"
                                    >
                                      แก้ไข
                                    </button>
                                  )}
                                  {onDeleteSchedule && (
                                    <button
                                      type="button"
                                      onClick={() => onDeleteSchedule(item)}
                                      className="text-destructive hover:underline text-[11px] font-medium ml-1"
                                    >
                                      ลบ
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* แถบแจ้งเวลาพักรับประทานอาหารกลางวัน */}
      <div className="bg-muted/30 border-t border-border px-4 py-2.5 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Utensils className="w-4 h-4 text-amber-500" />
          <span>เวลาพักรับประทานอาหารกลางวันประจำวัน: 12:00 – 13:00 น.</span>
        </div>
        <span className="hidden sm:inline">กิจกรรมเข้าแถวและโฮมรูม: 08:00 – 08:30 น.</span>
      </div>
    </div>
  );
}
