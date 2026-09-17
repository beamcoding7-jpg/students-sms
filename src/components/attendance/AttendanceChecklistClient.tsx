"use client";

import React, { useState, useTransition } from "react";
import {
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  UserX,
  FileQuestion,
  Phone,
  Save,
  RefreshCw,
  Check,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  saveAttendanceAction,
  getAttendanceForDateAction,
  ClassroomStudentAttendance,
} from "@/app/(dashboard)/teacher/attendance/actions";

interface RoomOption {
  gradeLevel: string;
  classroom: string;
  label: string;
}

interface AttendanceChecklistClientProps {
  initialDate: string;
  availableRooms: RoomOption[];
  defaultGradeLevel: string;
  defaultClassroom: string;
  initialStudents: ClassroomStudentAttendance[];
  initialIsAlreadyMarked: boolean;
  teacherName: string;
}

export function AttendanceChecklistClient({
  initialDate,
  availableRooms,
  defaultGradeLevel,
  defaultClassroom,
  initialStudents,
  initialIsAlreadyMarked,
  teacherName,
}: AttendanceChecklistClientProps) {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedRoomKey, setSelectedRoomKey] = useState(
    `${defaultGradeLevel}_${defaultClassroom}`
  );
  const [studentsList, setStudentsList] = useState<ClassroomStudentAttendance[]>(initialStudents);
  const [isAlreadyMarked, setIsAlreadyMarked] = useState(initialIsAlreadyMarked);

  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  // คำนวณสถิตินับจำนวนสถานะแบบ Real-time
  const counts = studentsList.reduce(
    (acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    },
    { present: 0, late: 0, leave: 0, absent: 0 } as Record<
      "present" | "late" | "leave" | "absent",
      number
    >
  );

  const currentGrade = selectedRoomKey.split("_")[0];
  const currentClassroom = selectedRoomKey.split("_")[1];

  // สลับห้องเรียนหรือเปลี่ยนวันที่ -> ดึงข้อมูลใหม่
  const handleFetchAttendance = (date: string, grade: string, room: string) => {
    startTransition(async () => {
      setFeedback(null);
      const res = await getAttendanceForDateAction(date, grade, room);
      if (res.success && res.data) {
        setStudentsList(res.data.students);
        setIsAlreadyMarked(res.data.isAlreadyMarked);
      } else {
        setFeedback({ type: "error", message: res.error || "ไม่สามารถดึงข้อมูลได้" });
      }
    });
  };

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    handleFetchAttendance(newDate, currentGrade, currentClassroom);
  };

  const handleRoomChange = (newRoomKey: string) => {
    setSelectedRoomKey(newRoomKey);
    const [grade, room] = newRoomKey.split("_");
    handleFetchAttendance(selectedDate, grade, room);
  };

  // 1-Click "มาเรียนทั้งหมด"
  const handleMarkAllPresent = () => {
    setStudentsList((prev) =>
      prev.map((s) => ({
        ...s,
        status: "present",
      }))
    );
    setFeedback({
      type: "success",
      message: "ปรับสถานะนักเรียนทุกคนเป็น 'มาเรียน' แล้ว (อย่าลืมกดบันทึกข้อมูล)",
    });
  };

  // เปลี่ยนสถานะของนักเรียนรายคน
  const handleStatusChange = (
    studentId: string,
    status: "present" | "late" | "absent" | "leave"
  ) => {
    setStudentsList((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, status } : s))
    );
  };

  // แก้ไขหมายเหตุของนักเรียนรายคน
  const handleRemarksChange = (studentId: string, remarks: string) => {
    setStudentsList((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, remarks } : s))
    );
  };

  // กดบันทึกข้อมูลการเข้าเรียน
  const handleSaveAttendance = async () => {
    if (studentsList.length === 0) {
      setFeedback({ type: "error", message: "ไม่พบรายชื่อนักเรียนในห้องนี้" });
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    const payload = {
      date: selectedDate,
      gradeLevel: currentGrade,
      classroom: currentClassroom,
      records: studentsList.map((s) => ({
        studentId: s.id,
        status: s.status,
        remarks: s.remarks,
      })),
    };

    const res = await saveAttendanceAction(payload);
    setIsSaving(false);

    if (res.success) {
      setIsAlreadyMarked(true);
      setFeedback({
        type: "success",
        message: res.message || "บันทึกข้อมูลการเข้าเรียนเรียบร้อยแล้ว",
      });
    } else {
      setFeedback({
        type: "error",
        message: res.error || "เกิดข้อผิดพลาดในการบันทึก",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* ส่วนหัวหน้าจอ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              เช็คชื่อเข้าเรียนประจำวัน
            </h1>
            {isAlreadyMarked ? (
              <Badge variant="success" className="gap-1">
                <Check className="w-3.5 h-3.5" /> บันทึกแล้ว
              </Badge>
            ) : (
              <Badge variant="warning" className="gap-1">
                <Clock className="w-3.5 h-3.5" /> ยังไม่บันทึก
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            ครูผู้บันทึก: <span className="font-medium text-foreground">{teacherName}</span>
          </p>
        </div>

        {/* ปุ่มลัด 1-Click มาเรียนทั้งหมด */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={handleMarkAllPresent}
            disabled={isPending || isSaving || studentsList.length === 0}
            className="border-emerald-500/40 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40 font-medium shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4 mr-1.5 text-emerald-600 dark:text-emerald-400" />
            มาเรียนทั้งหมด (1-Click)
          </Button>
        </div>
      </div>

      {/* แถบตัวเลือกวันที่และห้องเรียน (Controls Bar) */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center flex-1">
          {/* เลือกวันที่ */}
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <Calendar className="w-5 h-5 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <label htmlFor="attendance-date" className="sr-only">
                วันที่
              </label>
              <Input
                id="attendance-date"
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full bg-background"
                disabled={isPending || isSaving}
              />
            </div>
          </div>

          {/* เลือกห้องเรียน */}
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <Users className="w-5 h-5 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <label htmlFor="attendance-room" className="sr-only">
                ห้องเรียน
              </label>
              <select
                id="attendance-room"
                value={selectedRoomKey}
                onChange={(e) => handleRoomChange(e.target.value)}
                disabled={isPending || isSaving}
                className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {availableRooms.map((room) => (
                  <option
                    key={`${room.gradeLevel}_${room.classroom}`}
                    value={`${room.gradeLevel}_${room.classroom}`}
                  >
                    {room.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {isPending && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin" /> กำลังโหลดข้อมูล...
          </div>
        )}
      </div>

      {/* แถบสรุปจำนวนสถานะ Real-time Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">มาเรียน</p>
            <p className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
              {counts.present} <span className="text-xs font-normal text-muted-foreground">คน</span>
            </p>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">มาสาย</p>
            <p className="text-xl font-bold text-amber-900 dark:text-amber-100">
              {counts.late} <span className="text-xs font-normal text-muted-foreground">คน</span>
            </p>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <FileQuestion className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-blue-800 dark:text-blue-300 font-medium">ลา (ป่วย/กิจ)</p>
            <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
              {counts.leave} <span className="text-xs font-normal text-muted-foreground">คน</span>
            </p>
          </div>
        </div>

        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <UserX className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-rose-800 dark:text-rose-300 font-medium">ขาดเรียน</p>
            <p className="text-xl font-bold text-rose-900 dark:text-rose-100">
              {counts.absent} <span className="text-xs font-normal text-muted-foreground">คน</span>
            </p>
          </div>
        </div>
      </div>

      {/* แจ้งเตือนข้อความ Feedback */}
      {feedback && (
        <div
          className={cn(
            "p-3 rounded-xl text-sm flex items-center gap-2",
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

      {/* รายชื่อนักเรียน: ว่างเปล่า */}
      {studentsList.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="font-medium text-foreground">ไม่พบรายชื่อนักเรียนในห้องเรียนนี้</p>
          <p className="text-xs text-muted-foreground mt-1">
            โปรดเลือกห้องเรียนอื่นที่มีการลงทะเบียนนักเรียนแล้ว
          </p>
        </div>
      ) : (
        <>
          {/* 1. Desktop Table View (ซ่อนบนมือถือ md:block) */}
          <div className="hidden md:block bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center font-medium">#</th>
                  <th className="py-3.5 px-4 w-28 font-medium">รหัส</th>
                  <th className="py-3.5 px-4 font-medium">ชื่อ - นามสกุล</th>
                  <th className="py-3.5 px-4 w-96 text-center font-medium">สถานะการเข้าเรียน</th>
                  <th className="py-3.5 px-4 font-medium">หมายเหตุ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {studentsList.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3.5 px-4 text-center text-muted-foreground text-xs">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-muted-foreground">
                      {student.studentCode}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-foreground">
                      {student.fullName}
                    </td>
                    <td className="py-3.5 px-4">
                      {/* Segmented Buttons 4 สถานะ */}
                      <div className="flex items-center justify-center gap-1.5 bg-muted/40 p-1 rounded-lg border border-border/60 max-w-xs mx-auto">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, "present")}
                          className={cn(
                            "flex-1 py-1.5 px-2.5 rounded-md text-xs font-medium transition-all",
                            student.status === "present"
                              ? "bg-emerald-600 text-white shadow-sm"
                              : "text-muted-foreground hover:text-foreground hover:bg-background"
                          )}
                        >
                          มา
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, "late")}
                          className={cn(
                            "flex-1 py-1.5 px-2.5 rounded-md text-xs font-medium transition-all",
                            student.status === "late"
                              ? "bg-amber-500 text-white shadow-sm"
                              : "text-muted-foreground hover:text-foreground hover:bg-background"
                          )}
                        >
                          สาย
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, "leave")}
                          className={cn(
                            "flex-1 py-1.5 px-2.5 rounded-md text-xs font-medium transition-all",
                            student.status === "leave"
                              ? "bg-blue-600 text-white shadow-sm"
                              : "text-muted-foreground hover:text-foreground hover:bg-background"
                          )}
                        >
                          ลา
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, "absent")}
                          className={cn(
                            "flex-1 py-1.5 px-2.5 rounded-md text-xs font-medium transition-all",
                            student.status === "absent"
                              ? "bg-rose-600 text-white shadow-sm"
                              : "text-muted-foreground hover:text-foreground hover:bg-background"
                          )}
                        >
                          ขาด
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Input
                        type="text"
                        placeholder="เช่น ลาป่วย, ติดธุระ..."
                        value={student.remarks}
                        onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                        className="h-8 text-xs bg-background"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 2. Mobile Card View (เฉพาะมือถือ < 768px) */}
          <div className="block md:hidden space-y-3">
            {studentsList.map((student, idx) => (
              <div
                key={student.id}
                className={cn(
                  "bg-card border rounded-xl p-4 shadow-sm space-y-3 transition-colors",
                  student.status === "absent"
                    ? "border-rose-200 dark:border-rose-900/50 bg-rose-50/20 dark:bg-rose-950/10"
                    : student.status === "late"
                    ? "border-amber-200 dark:border-amber-900/50"
                    : "border-border"
                )}
              >
                {/* ข้อมูลนักเรียน */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{student.fullName}</p>
                      <p className="text-xs font-mono text-muted-foreground">{student.studentCode}</p>
                    </div>
                  </div>

                  <Badge
                    variant={
                      student.status === "present"
                        ? "success"
                        : student.status === "late"
                        ? "warning"
                        : student.status === "leave"
                        ? "info"
                        : "destructive"
                    }
                    className="text-xs capitalize"
                  >
                    {student.status === "present"
                      ? "มาเรียน"
                      : student.status === "late"
                      ? "มาสาย"
                      : student.status === "leave"
                      ? "ลา"
                      : "ขาดเรียน"}
                  </Badge>
                </div>

                {/* Touch Target Buttons (Segmented Control ≥ 44px) */}
                <div className="grid grid-cols-4 gap-1 bg-muted/50 p-1 rounded-xl border border-border">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, "present")}
                    className={cn(
                      "min-h-[44px] rounded-lg text-xs font-semibold flex flex-col items-center justify-center transition-all",
                      student.status === "present"
                        ? "bg-emerald-600 text-white shadow"
                        : "text-muted-foreground hover:bg-background"
                    )}
                  >
                    <span>มา</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, "late")}
                    className={cn(
                      "min-h-[44px] rounded-lg text-xs font-semibold flex flex-col items-center justify-center transition-all",
                      student.status === "late"
                        ? "bg-amber-500 text-white shadow"
                        : "text-muted-foreground hover:bg-background"
                    )}
                  >
                    <span>สาย</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, "leave")}
                    className={cn(
                      "min-h-[44px] rounded-lg text-xs font-semibold flex flex-col items-center justify-center transition-all",
                      student.status === "leave"
                        ? "bg-blue-600 text-white shadow"
                        : "text-muted-foreground hover:bg-background"
                    )}
                  >
                    <span>ลา</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.id, "absent")}
                    className={cn(
                      "min-h-[44px] rounded-lg text-xs font-semibold flex flex-col items-center justify-center transition-all",
                      student.status === "absent"
                        ? "bg-rose-600 text-white shadow"
                        : "text-muted-foreground hover:bg-background"
                    )}
                  >
                    <span>ขาด</span>
                  </button>
                </div>

                {/* ปุ่มแตะเพื่อโทรหาผู้ปกครอง (Tap-to-call) หากขาดเรียนหรือสาย */}
                {(student.status === "absent" || student.status === "late") && student.parentPhone && (
                  <div className="pt-1">
                    <a
                      href={`tel:${student.parentPhone}`}
                      className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-200 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        โทรหาผู้ปกครอง ({student.parentName || "ผู้ปกครอง"}): {student.parentPhone}
                      </span>
                    </a>
                  </div>
                )}

                {/* ช่องกรอกหมายเหตุ */}
                <div>
                  <Input
                    type="text"
                    placeholder="หมายเหตุ (เช่น ลาป่วย, เข้าแถวสาย...)"
                    value={student.remarks}
                    onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                    className="h-9 text-xs bg-background"
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Floating / Sticky Save Bar ด้านล่าง */}
      {studentsList.length > 0 && (
        <div className="sticky bottom-4 z-20 bg-card/95 backdrop-blur border border-border rounded-xl p-4 shadow-xl flex items-center justify-between gap-4">
          <div className="text-xs text-muted-foreground hidden sm:block">
            ห้อง <span className="font-semibold text-foreground">{currentGrade}/{currentClassroom}</span> | นักเรียนทั้งหมด {studentsList.length} คน
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="default"
              size="lg"
              onClick={handleSaveAttendance}
              disabled={isSaving || isPending}
              className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 shadow-md"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  กำลังบันทึกข้อมูล...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  บันทึกข้อมูลการเข้าเรียน
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
