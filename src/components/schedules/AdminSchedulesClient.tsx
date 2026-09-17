"use client";

import React, { useState, useMemo } from "react";
import {
  CalendarDays,
  Plus,
  Filter,
  Grid3X3,
  List,
  Edit2,
  Trash2,
  BookOpen,
  MapPin,
  Clock,
  User,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TimetableGrid, ScheduleItem } from "./TimetableGrid";
import { TimetableTimeline } from "./TimetableTimeline";
import { ScheduleFormDialog } from "./ScheduleFormDialog";
import { DeleteScheduleDialog } from "./DeleteScheduleDialog";
import { PrintTimetableButton } from "./PrintTimetableButton";
import { cn } from "@/lib/utils";

interface CourseOption {
  id: string;
  courseCode: string;
  courseName: string;
  credits: number;
  teacherName: string;
}

interface AdminSchedulesClientProps {
  initialSchedules: ScheduleItem[];
  courses: CourseOption[];
  classrooms: string[];
}

export function AdminSchedulesClient({
  initialSchedules,
  courses,
  classrooms,
}: AdminSchedulesClientProps) {
  const [schedulesList, setSchedulesList] = useState<ScheduleItem[]>(initialSchedules);
  const [selectedClassroom, setSelectedClassroom] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // State สำหรับ Dialogs
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [scheduleToEdit, setScheduleToEdit] = useState<ScheduleItem | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<ScheduleItem | null>(null);

  // อัปเดตรายการเมื่อมีการเปลี่ยน Props
  React.useEffect(() => {
    setSchedulesList(initialSchedules);
  }, [initialSchedules]);

  // กรองตารางเรียนตามห้องเรียนที่เลือก
  const filteredSchedules = useMemo(() => {
    if (selectedClassroom === "all") return schedulesList;
    return schedulesList.filter((s) => s.classroom === selectedClassroom);
  }, [schedulesList, selectedClassroom]);

  // สถิติ KPI
  const totalPeriods = schedulesList.length;
  const uniqueClassrooms = new Set(schedulesList.map((s) => s.classroom)).size;
  const uniqueCourses = new Set(schedulesList.map((s) => s.courseId)).size;

  const handleOpenAdd = () => {
    setScheduleToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (schedule: ScheduleItem) => {
    setScheduleToEdit(schedule);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (schedule: ScheduleItem) => {
    setScheduleToDelete(schedule);
    setIsDeleteOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ส่วนหัวหน้าจอ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-primary" />
            การจัดการตารางเรียนและตารางสอน
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            จัดคาบเรียน กำหนดเวลาและสถานที่ พร้อมระบบป้องกันคาบเรียนชนกันอัตโนมัติ
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <PrintTimetableButton label="พิมพ์ตารางเรียน" />
          <Button
            type="button"
            onClick={handleOpenAdd}
            className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มคาบเรียนใหม่</span>
          </Button>
        </div>
      </div>

      {/* 3 KPI Cards สรุปภาพรวม */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-1">
          <p className="text-xs text-muted-foreground">คาบเรียนทั้งหมดในระบบ</p>
          <p className="text-2xl font-bold text-foreground">{totalPeriods}</p>
          <p className="text-[11px] text-muted-foreground">จันทร์ – ศุกร์</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-1">
          <p className="text-xs text-muted-foreground">ห้องเรียนที่มีตาราง</p>
          <p className="text-2xl font-bold text-foreground">{uniqueClassrooms}</p>
          <p className="text-[11px] text-muted-foreground">จากทั้งหมด {classrooms.length} ห้อง</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-1">
          <p className="text-xs text-muted-foreground">วิชาที่จัดตารางแล้ว</p>
          <p className="text-2xl font-bold text-foreground">{uniqueCourses}</p>
          <p className="text-[11px] text-muted-foreground">จากทั้งหมด {courses.length} วิชา</p>
        </div>
      </div>

      {/* แถบตัวกรองและสลับมุมมอง (Controls Bar) */}
      <div className="bg-card border border-border rounded-xl p-3.5 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* เลือกระดับชั้น / ห้องเรียน */}
        <div className="flex items-center gap-2.5">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-xs font-semibold text-foreground shrink-0">ห้องเรียน:</span>
          <select
            value={selectedClassroom}
            onChange={(e) => setSelectedClassroom(e.target.value)}
            className="h-9 px-3 rounded-lg border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">ทุกห้องเรียน ({schedulesList.length} คาบ)</option>
            {classrooms.map((c) => (
              <option key={c} value={c}>
                ห้อง {c} ({schedulesList.filter((s) => s.classroom === c).length} คาบ)
              </option>
            ))}
          </select>
        </div>

        {/* สลับมุมมองตาราง vs รายการ */}
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all",
              viewMode === "grid"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            <span>ตารางเรียน (Timetable)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all",
              viewMode === "list"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <List className="w-3.5 h-3.5" />
            <span>รายการจัดการ (List)</span>
          </button>
        </div>
      </div>

      {/* ส่วนแสดงตารางเรียน (Grid vs List) */}
      {viewMode === "grid" ? (
        <div id="printable-timetable" className="space-y-4">
          {/* Header ประจำห้องเมื่อเลือกเฉพาะห้อง */}
          {selectedClassroom !== "all" && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-center justify-between">
              <span className="font-bold text-sm text-foreground">
                ตารางเรียนประจำชั้นมัธยมศึกษาปีที่ {selectedClassroom}
              </span>
              <Badge variant="info" className="text-xs">
                {filteredSchedules.length} คาบเรียน / สัปดาห์
              </Badge>
            </div>
          )}

          {/* Desktop Grid View (md:block) */}
          <div className="hidden md:block">
            <TimetableGrid
              schedules={filteredSchedules}
              viewMode="classroom"
              canManage
              onEditSchedule={handleOpenEdit}
              onDeleteSchedule={handleOpenDelete}
            />
          </div>

          {/* Mobile Day Tab View (< md:hidden) */}
          <div className="block md:hidden">
            <TimetableTimeline
              schedules={filteredSchedules}
              viewMode="classroom"
              canManage
              onEditSchedule={handleOpenEdit}
              onDeleteSchedule={handleOpenDelete}
            />
          </div>
        </div>
      ) : (
        /* List View (Detailed Table) */
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-xs text-muted-foreground">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4 w-28">วัน</th>
                  <th className="py-3 px-4 w-36">เวลาเรียน</th>
                  <th className="py-3 px-4 w-24">ห้อง</th>
                  <th className="py-3 px-4">วิชาที่สอน</th>
                  <th className="py-3 px-4">อาจารย์ผู้สอน</th>
                  <th className="py-3 px-4 w-32">สถานที่</th>
                  <th className="py-3 px-4 w-24 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSchedules.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3.5 px-4 text-center text-xs text-muted-foreground">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-foreground">
                      วัน{s.dayOfWeek}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-primary font-bold">
                      {s.startTime} - {s.endTime} น.
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold">
                      {s.classroom}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-foreground">
                      <span className="font-mono text-xs text-muted-foreground mr-1.5">
                        {s.courseCode}
                      </span>
                      {s.courseName}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-muted-foreground">
                      {s.teacherName}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-muted-foreground">
                      {s.roomNumber}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(s)}
                          className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          title="แก้ไข"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(s)}
                          className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="ลบ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form Dialog */}
      <ScheduleFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        courses={courses}
        availableClassrooms={classrooms}
        scheduleToEdit={scheduleToEdit}
        defaultClassroom={selectedClassroom !== "all" ? selectedClassroom : "ม.4/1"}
      />

      {/* Delete Dialog */}
      <DeleteScheduleDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        schedule={scheduleToDelete}
      />
    </div>
  );
}
