"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit2, Calendar, Clock, MapPin, BookOpen, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScheduleFormValues, DayOfWeek } from "@/lib/validations/schedule";
import { createScheduleAction, updateScheduleAction } from "@/app/(dashboard)/admin/schedules/actions";
import { ScheduleItem } from "./TimetableGrid";

interface CourseOption {
  id: string;
  courseCode: string;
  courseName: string;
  credits: number;
  teacherName: string;
}

interface ScheduleFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  courses: CourseOption[];
  availableClassrooms: string[];
  scheduleToEdit?: ScheduleItem | null;
  defaultClassroom?: string;
  onSuccess?: () => void;
}

const PRESET_TIMES = [
  { label: "คาบ 1-2 (08:30 - 10:10)", start: "08:30", end: "10:10" },
  { label: "คาบ 3-4 (10:20 - 12:00)", start: "10:20", end: "12:00" },
  { label: "คาบ 5-6 (13:00 - 14:40)", start: "13:00", end: "14:40" },
  { label: "คาบ 7-8 (14:50 - 16:30)", start: "14:50", end: "16:30" },
];

const DAYS: DayOfWeek[] = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์"];

export function ScheduleFormDialog({
  isOpen,
  onClose,
  courses,
  availableClassrooms,
  scheduleToEdit,
  defaultClassroom = "ม.4/1",
  onSuccess,
}: ScheduleFormDialogProps) {
  const isEditing = Boolean(scheduleToEdit);

  const [courseId, setCourseId] = useState<string>(courses[0]?.id || "");
  const [classroom, setClassroom] = useState<string>(defaultClassroom);
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>("จันทร์");
  const [startTime, setStartTime] = useState<string>("08:30");
  const [endTime, setEndTime] = useState<string>("10:10");
  const [roomNumber, setRoomNumber] = useState<string>("ห้องเรียน 411");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // กำหนดค่าเมื่อเปิด Modal
  useEffect(() => {
    if (scheduleToEdit) {
      setCourseId(scheduleToEdit.courseId);
      setClassroom(scheduleToEdit.classroom);
      setDayOfWeek(scheduleToEdit.dayOfWeek);
      setStartTime(scheduleToEdit.startTime);
      setEndTime(scheduleToEdit.endTime);
      setRoomNumber(scheduleToEdit.roomNumber);
    } else {
      setCourseId(courses[0]?.id || "");
      setClassroom(defaultClassroom);
      setDayOfWeek("จันทร์");
      setStartTime("08:30");
      setEndTime("10:10");
      setRoomNumber("ห้องเรียน 411");
    }
    setErrorMessage(null);
  }, [scheduleToEdit, defaultClassroom, courses, isOpen]);

  const handleSelectPreset = (start: string, end: string) => {
    setStartTime(start);
    setEndTime(end);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const payload: ScheduleFormValues = {
      courseId,
      classroom: classroom.trim(),
      dayOfWeek,
      startTime,
      endTime,
      roomNumber: roomNumber.trim(),
    };

    let res;
    if (isEditing && scheduleToEdit) {
      res = await updateScheduleAction(scheduleToEdit.id, payload);
    } else {
      res = await createScheduleAction(payload);
    }

    setIsSubmitting(false);

    if (res.success) {
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setErrorMessage(res.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            {isEditing ? (
              <>
                <Edit2 className="w-5 h-5 text-primary" />
                แก้ไขคาบเรียนในตาราง
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 text-primary" />
                เพิ่มคาบเรียนลงในตาราง
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* ข้อความแจ้งเตือน Error (โดยเฉพาะเวลาชนกัน) */}
          {errorMessage && (
            <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-xl p-3.5 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold block">ไม่สามารถบันทึกคาบเรียนได้:</span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* 1. เลือกรายวิชา */}
          <div className="space-y-1.5">
            <label htmlFor="course-select" className="text-xs font-semibold text-foreground">
              รายวิชาที่สอน <span className="text-destructive">*</span>
            </label>
            <select
              id="course-select"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              required
              className="w-full h-10 px-3 py-2 rounded-lg border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.courseCode} - {c.courseName} ({c.teacherName})
                </option>
              ))}
            </select>
          </div>

          {/* 2. ห้องเรียน */}
          <div className="space-y-1.5">
            <label htmlFor="classroom-input" className="text-xs font-semibold text-foreground">
              ห้องเรียน (เช่น ม.4/1, ม.5/2) <span className="text-destructive">*</span>
            </label>
            <Input
              id="classroom-input"
              type="text"
              placeholder="เช่น ม.4/1"
              value={classroom}
              onChange={(e) => setClassroom(e.target.value)}
              required
              className="bg-background h-10 text-sm"
            />
          </div>

          {/* 3. วันในสัปดาห์ (Segmented Control) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              วันในสัปดาห์ <span className="text-destructive">*</span>
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {DAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setDayOfWeek(day)}
                  className={`py-2 px-1 rounded-lg text-xs font-medium border text-center transition-all ${
                    dayOfWeek === day
                      ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                      : "border-border bg-card hover:bg-muted text-muted-foreground"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* 4. ปุ่มลัดเลือกช่วงเวลามาตรฐาน (Preset Slots) */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              เลือกคาบเรียนมาตรฐาน (หรือระบุเวลาด้านล่าง)
            </span>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_TIMES.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleSelectPreset(preset.start, preset.end)}
                  className={`text-left p-2 rounded-lg border text-xs transition-colors ${
                    startTime === preset.start && endTime === preset.end
                      ? "bg-primary/10 border-primary text-primary font-semibold"
                      : "border-border bg-muted/40 hover:bg-muted text-muted-foreground"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5. ระบุเวลาเริ่ม - สิ้นสุดแบบกำหนดเอง */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="start-time" className="text-xs font-semibold text-foreground">
                เวลาเริ่มต้น (HH:MM) <span className="text-destructive">*</span>
              </label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="bg-background h-10 text-sm font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="end-time" className="text-xs font-semibold text-foreground">
                เวลาสิ้นสุด (HH:MM) <span className="text-destructive">*</span>
              </label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="bg-background h-10 text-sm font-mono"
              />
            </div>
          </div>

          {/* 6. ห้องเรียน/สถานที่ */}
          <div className="space-y-1.5">
            <label htmlFor="room-number" className="text-xs font-semibold text-foreground">
              ห้องเรียน / สถานที่ <span className="text-destructive">*</span>
            </label>
            <Input
              id="room-number"
              type="text"
              placeholder="เช่น ห้องเรียน 411, ห้องคอมพิวเตอร์ 1"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              required
              className="bg-background h-10 text-sm"
            />
          </div>

          <DialogFooter className="pt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-10 px-4"
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 px-5 font-semibold gap-2"
            >
              {isSubmitting ? "กำลังบันทึก..." : isEditing ? "บันทึกการแก้ไข" : "เพิ่มคาบเรียน"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
