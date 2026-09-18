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
import { createTeacherAction, updateTeacherAction } from "@/app/(dashboard)/admin/teachers/actions";
import { TeacherFormValues, departmentOptions } from "@/lib/validations/teacher";
import { AlertCircle, UserPlus, Save, Loader2 } from "lucide-react";

export interface TeacherRecord {
  id: string;
  userId: string;
  department: string;
  phone: string | null;
  roomAdvisor: string | null;
  user: {
    fullName: string;
    email: string;
    avatarUrl?: string | null;
  };
  courseCount?: number;
}

interface TeacherFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacherToEdit?: TeacherRecord | null;
  onSuccess: () => void;
}

export function TeacherFormDialog({
  open,
  onOpenChange,
  teacherToEdit,
  onSuccess,
}: TeacherFormDialogProps) {
  const isEditing = !!teacherToEdit;

  const [formData, setFormData] = useState<TeacherFormValues>({
    fullName: "",
    email: "",
    department: departmentOptions[0],
    phone: "",
    roomAdvisor: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (teacherToEdit) {
      setFormData({
        fullName: teacherToEdit.user.fullName,
        email: teacherToEdit.user.email,
        department: teacherToEdit.department,
        phone: teacherToEdit.phone || "",
        roomAdvisor: teacherToEdit.roomAdvisor || "",
      });
    } else {
      setFormData({
        fullName: "",
        email: "",
        department: departmentOptions[0],
        phone: "",
        roomAdvisor: "",
      });
    }
    setError(null);
  }, [teacherToEdit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let res;
      if (isEditing && teacherToEdit) {
        res = await updateTeacherAction(teacherToEdit.id, formData);
      } else {
        res = await createTeacherAction(formData);
      }

      if (!res.success) {
        setError(res.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
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
            {isEditing ? <Save className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            <DialogTitle>{isEditing ? "แก้ไขข้อมูลคุณครู" : "เพิ่มคุณครูใหม่"}</DialogTitle>
          </div>
          <DialogDescription>
            {isEditing
              ? "แก้ไขข้อมูลประจำตัว กลุ่มสาระการเรียนรู้ หรือห้องประจำชั้น"
              : "กรอกข้อมูลครูเพื่อสร้างประวัติและเปิดบัญชีเข้าสู่ระบบอัตโนมัติ โดยระบบจะกำหนดรหัสผ่านเริ่มต้นและแนะนำให้เปลี่ยนเมื่อเข้าสู่ระบบครั้งแรก"}
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
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="fullName">
                ชื่อ-นามสกุล (พร้อมคำนำหน้า) *
              </Label>
              <Input
                id="fullName"
                placeholder="เช่น อ.กิตติศักดิ์ เจริญดี"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="email">
                อีเมลเข้าสู่ระบบสถานศึกษา *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="เช่น kittisak.j@school.ac.th"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="department">
                กลุ่มสาระการเรียนรู้ *
              </Label>
              <Select
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                disabled={loading}
              >
                {departmentOptions.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="roomAdvisor">
                ชั้นเรียนประจำห้อง (ครูที่ปรึกษา)
              </Label>
              <Input
                id="roomAdvisor"
                placeholder="เช่น ม.4/1 หรือเว้นว่างหากไม่มี"
                value={formData.roomAdvisor || ""}
                onChange={(e) => setFormData({ ...formData, roomAdvisor: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="phone">เบอร์โทรศัพท์ติดต่อ</Label>
              <Input
                id="phone"
                placeholder="เช่น 081-234-5678"
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={loading}
              />
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
                "บันทึกข้อมูลครู"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
