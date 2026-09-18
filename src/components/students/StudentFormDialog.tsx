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
import { createStudentAction, updateStudentAction } from "@/app/(dashboard)/admin/students/actions";
import { StudentFormValues } from "@/lib/validations/student";
import { AlertCircle, UserPlus, Save, Loader2 } from "lucide-react";

export interface StudentRecord {
  id: string;
  userId: string;
  studentCode: string;
  nationalId: string | null;
  gradeLevel: string;
  classroom: string;
  dateOfBirth: string | null;
  parentName: string | null;
  parentPhone: string | null;
  user: {
    fullName: string;
    email: string;
  };
}

interface StudentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentToEdit?: StudentRecord | null;
  onSuccess: () => void;
}

export function StudentFormDialog({
  open,
  onOpenChange,
  studentToEdit,
  onSuccess,
}: StudentFormDialogProps) {
  const isEditing = !!studentToEdit;

  const [formData, setFormData] = useState<StudentFormValues>({
    studentCode: "",
    fullName: "",
    email: "",
    gradeLevel: "ม.4",
    classroom: "1",
    nationalId: "",
    dateOfBirth: "",
    parentName: "",
    parentPhone: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // เมื่อเปิด Modal แก้ไข ให้ใส่ข้อมูลเดิมลงในฟอร์ม
  useEffect(() => {
    if (studentToEdit) {
      setFormData({
        studentCode: studentToEdit.studentCode,
        fullName: studentToEdit.user.fullName,
        email: studentToEdit.user.email,
        gradeLevel: studentToEdit.gradeLevel as "ม.4" | "ม.5" | "ม.6",
        classroom: studentToEdit.classroom,
        nationalId: studentToEdit.nationalId || "",
        dateOfBirth: studentToEdit.dateOfBirth || "",
        parentName: studentToEdit.parentName || "",
        parentPhone: studentToEdit.parentPhone || "",
      });
    } else {
      setFormData({
        studentCode: "",
        fullName: "",
        email: "",
        gradeLevel: "ม.4",
        classroom: "1",
        nationalId: "",
        dateOfBirth: "",
        parentName: "",
        parentPhone: "",
      });
    }
    setError(null);
  }, [studentToEdit, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let res;
      if (isEditing && studentToEdit) {
        res = await updateStudentAction(studentToEdit.id, formData);
      } else {
        res = await createStudentAction(formData);
      }

      if (!res.success) {
        setError(res.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        setLoading(false);
        return;
      }

      onSuccess();
      onOpenChange(false);
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {isEditing ? <Save className="w-5 h-5 text-primary" /> : <UserPlus className="w-5 h-5 text-primary" />}
            <span>{isEditing ? "แก้ไขข้อมูลนักเรียน" : "เพิ่มนักเรียนใหม่"}</span>
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "แก้ไขประวัตินักเรียนและข้อมูลการติดต่อในฐานข้อมูลสถานศึกษา"
              : "กรอกข้อมูลนักเรียนเพื่อสร้างทะเบียนประวัติและเปิดบัญชีเข้าสู่ระบบอัตโนมัติ โดยระบบจะกำหนดรหัสผ่านเริ่มต้นและแนะนำให้เปลี่ยนเมื่อเข้าสู่ระบบครั้งแรก"}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* รหัสนักเรียน */}
            <div className="space-y-1.5">
              <Label htmlFor="studentCode">รหัสนักเรียน *</Label>
              <Input
                id="studentCode"
                name="studentCode"
                required
                placeholder="เช่น STU-1026"
                value={formData.studentCode}
                onChange={handleChange}
              />
            </div>

            {/* ชื่อ-นามสกุล */}
            <div className="space-y-1.5">
              <Label htmlFor="fullName">ชื่อ-นามสกุล (ภาษาไทย) *</Label>
              <Input
                id="fullName"
                name="fullName"
                required
                placeholder="เช่น นายทดสอบ พัฒนาดี"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>

            {/* อีเมลประจำตัว */}
            <div className="space-y-1.5">
              <Label htmlFor="email">อีเมลเข้าสู่ระบบ *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="เช่น thotsaphon.p@school.ac.th"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* เลขบัตร ปชช. */}
            <div className="space-y-1.5">
              <Label htmlFor="nationalId">เลขบัตรประชาชน (13 หลัก)</Label>
              <Input
                id="nationalId"
                name="nationalId"
                placeholder="เช่น 1100401234567"
                maxLength={13}
                value={formData.nationalId || ""}
                onChange={handleChange}
              />
            </div>

            {/* ระดับชั้น */}
            <div className="space-y-1.5">
              <Label htmlFor="gradeLevel">ระดับชั้น *</Label>
              <Select
                id="gradeLevel"
                name="gradeLevel"
                value={formData.gradeLevel}
                onChange={handleChange}
              >
                <option value="ม.4">มัธยมศึกษาปีที่ 4 (ม.4)</option>
                <option value="ม.5">มัธยมศึกษาปีที่ 5 (ม.5)</option>
                <option value="ม.6">มัธยมศึกษาปีที่ 6 (ม.6)</option>
              </Select>
            </div>

            {/* ห้องเรียน */}
            <div className="space-y-1.5">
              <Label htmlFor="classroom">ห้องเรียน *</Label>
              <Select
                id="classroom"
                name="classroom"
                value={formData.classroom}
                onChange={handleChange}
              >
                <option value="1">ห้อง 1</option>
                <option value="2">ห้อง 2</option>
                <option value="3">ห้อง 3</option>
                <option value="4">ห้อง 4</option>
              </Select>
            </div>

            {/* ชื่อผู้ปกครอง */}
            <div className="space-y-1.5">
              <Label htmlFor="parentName">ชื่อผู้ปกครอง</Label>
              <Input
                id="parentName"
                name="parentName"
                placeholder="เช่น นายสมบูรณ์ พัฒนาดี"
                value={formData.parentName || ""}
                onChange={handleChange}
              />
            </div>

            {/* เบอร์โทรผู้ปกครอง */}
            <div className="space-y-1.5">
              <Label htmlFor="parentPhone">เบอร์โทรผู้ปกครอง</Label>
              <Input
                id="parentPhone"
                name="parentPhone"
                placeholder="เช่น 089-123-4567"
                value={formData.parentPhone || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isEditing ? "บันทึกการแก้ไข" : "บันทึกข้อมูลนักเรียน"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
