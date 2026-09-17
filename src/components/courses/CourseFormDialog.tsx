"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createCourseAction, updateCourseAction } from "@/app/(dashboard)/admin/courses/actions";
import { CourseFormValues } from "@/lib/validations/course";
import { TeacherRecord } from "@/components/teachers/TeacherFormDialog";
import { AlertCircle, BookPlus, Save, Loader2 } from "lucide-react";

export interface CourseRecord {
  id: string;
  courseCode: string;
  courseName: string;
  credits: number;
  teacherId: string | null;
  gradeLevel: string;
  semester: number;
  academicYear: string;
  teacher?: {
    id: string;
    department: string;
    user: {
      fullName: string;
      email: string;
    };
  } | null;
  enrolledCount?: number;
}

interface CourseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseToEdit?: CourseRecord | null;
  availableTeachers: TeacherRecord[];
  onSuccess: () => void;
}

export function CourseFormDialog({
  open,
  onOpenChange,
  courseToEdit,
  availableTeachers,
  onSuccess,
}: CourseFormDialogProps) {
  const isEditing = !!courseToEdit;

  const [formData, setFormData] = useState<CourseFormValues>({
    courseCode: "",
    courseName: "",
    credits: 1.0,
    gradeLevel: "ม.4",
    semester: 1,
    academicYear: "2569",
    teacherId: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (courseToEdit) {
      setFormData({
        courseCode: courseToEdit.courseCode,
        courseName: courseToEdit.courseName,
        credits: courseToEdit.credits,
        gradeLevel: courseToEdit.gradeLevel as "ม.4" | "ม.5" | "ม.6",
        semester: courseToEdit.semester,
        academicYear: courseToEdit.academicYear,
        teacherId: courseToEdit.teacherId || "",
      });
    } else {
      setFormData({
        courseCode: "",
        courseName: "",
        credits: 1.0,
        gradeLevel: "ม.4",
        semester: 1,
        academicYear: "2569",
        teacherId: availableTeachers[0]?.id || "",
      });
    }
    setError(null);
  }, [courseToEdit, availableTeachers, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let res;
      if (isEditing && courseToEdit) {
        res = await updateCourseAction(courseToEdit.id, formData);
      } else {
        res = await createCourseAction(formData);
      }

      if (!res.success) {
        setError(res.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูลรายวิชา");
        setLoading(false);
        return;
      }

      onSuccess();
      onOpenChange(false);
    } catch {
      setError("เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
            {isEditing ? <Save className="w-5 h-5" /> : <BookPlus className="w-5 h-5" />}
            <DialogTitle>{isEditing ? "แก้ไขข้อมูลรายวิชา" : "เพิ่มรายวิชาใหม่ในหลักสูตร"}</DialogTitle>
          </div>
          <DialogDescription>
            {isEditing
              ? "ปรับปรุงข้อมูลรายวิชา หน่วยกิต หรือสลับอาจารย์ผู้สอนประจำวิชา"
              : "กรอกข้อมูลหลักสูตรรายวิชา เพื่อเปิดการเรียนการสอนและให้นักเรียนลงทะเบียนเรียน"}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex items-center gap-3 text-rose-700 dark:text-rose-400 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="courseCode">
                รหัสวิชา *
              </Label>
              <Input
                id="courseCode"
                placeholder="เช่น ว31101"
                value={formData.courseCode}
                onChange={(e) => setFormData({ ...formData, courseCode: e.target.value.toUpperCase() })}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="credits">
                หน่วยกิต *
              </Label>
              <Select
                id="credits"
                value={String(formData.credits)}
                onChange={(e) => setFormData({ ...formData, credits: parseFloat(e.target.value) })}
                disabled={loading}
              >
                <option value="0.5">0.5 หน่วยกิต (1 คาบ/สัปดาห์)</option>
                <option value="1.0">1.0 หน่วยกิต (2 คาบ/สัปดาห์)</option>
                <option value="1.5">1.5 หน่วยกิต (3 คาบ/สัปดาห์)</option>
                <option value="2.0">2.0 หน่วยกิต (4 คาบ/สัปดาห์)</option>
                <option value="2.5">2.5 หน่วยกิต</option>
                <option value="3.0">3.0 หน่วยกิต</option>
              </Select>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="courseName">
                ชื่อรายวิชา *
              </Label>
              <Input
                id="courseName"
                placeholder="เช่น วิทยาการคำนวณ 1 หรือ คณิตศาสตร์เพิ่มเติม"
                value={formData.courseName}
                onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="gradeLevel">
                ระดับชั้น *
              </Label>
              <Select
                id="gradeLevel"
                value={formData.gradeLevel}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    gradeLevel: e.target.value as "ม.4" | "ม.5" | "ม.6",
                  })
                }
                disabled={loading}
              >
                <option value="ม.4">มัธยมศึกษาปีที่ 4 (ม.4)</option>
                <option value="ม.5">มัธยมศึกษาปีที่ 5 (ม.5)</option>
                <option value="ม.6">มัธยมศึกษาปีที่ 6 (ม.6)</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="semester">
                ภาคเรียน *
              </Label>
              <Select
                id="semester"
                value={String(formData.semester)}
                onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                disabled={loading}
              >
                <option value="1">ภาคเรียนที่ 1</option>
                <option value="2">ภาคเรียนที่ 2</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="academicYear">
                ปีการศึกษา *
              </Label>
              <Input
                id="academicYear"
                placeholder="เช่น 2569"
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="teacherId">อาจารย์ผู้สอนประจำวิชา</Label>
              <Select
                id="teacherId"
                value={formData.teacherId || ""}
                onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                disabled={loading}
              >
                <option value="">-- ยังไม่ได้กำหนดผู้สอน --</option>
                {availableTeachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.user.fullName} ({t.department})
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={loading} className="min-w-[130px]">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : isEditing ? (
                "บันทึกการแก้ไข"
              ) : (
                "บันทึกรายวิชา"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
