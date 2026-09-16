"use client";

import React from "react";
import Link from "next/link";
import { StudentRecord } from "./StudentFormDialog";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit2, Trash2, Phone, Mail, Users } from "lucide-react";

interface StudentCardListProps {
  students: StudentRecord[];
  onEdit: (student: StudentRecord) => void;
  onDelete: (student: StudentRecord) => void;
}

export function StudentCardList({ students, onEdit, onDelete }: StudentCardListProps) {
  if (students.length === 0) {
    return (
      <div className="md:hidden flex flex-col items-center justify-center p-8 text-center border border-dashed border-border rounded-xl bg-card">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2">
          <Users className="w-5 h-5 text-muted-foreground" />
        </div>
        <p className="font-semibold text-foreground text-sm">ไม่พบข้อมูลนักเรียน</p>
        <p className="text-xs text-muted-foreground mt-1">
          ลองปรับคำค้นหาหรือตัวกรองระดับชั้นใหม่อีกครั้ง
        </p>
      </div>
    );
  }

  return (
    <div className="md:hidden space-y-3">
      {students.map((student) => (
        <div
          key={student.id}
          className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-3"
        >
          {/* ส่วนหัวการ์ด: รหัส และ ชั้นเรียน */}
          <div className="flex items-center justify-between gap-2">
            <Badge variant="outline" className="font-mono text-xs bg-primary/5 text-primary border-primary/20">
              {student.studentCode}
            </Badge>
            <Badge variant="secondary" className="font-medium text-xs">
              ชั้น {student.gradeLevel}/{student.classroom}
            </Badge>
          </div>

          {/* ข้อมูลนักเรียน */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
              {student.user.fullName.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={`/admin/students/${student.id}`}
                className="font-bold text-foreground hover:text-primary transition-colors text-base block truncate"
              >
                {student.user.fullName}
              </Link>
              <p className="text-xs text-muted-foreground font-mono truncate">
                {student.user.email}
              </p>
            </div>
          </div>

          {/* ข้อมูลผู้ปกครอง (ถ้ามี) */}
          {(student.parentName || student.parentPhone) && (
            <div className="p-2.5 rounded-lg bg-muted/40 text-xs flex items-center justify-between gap-2">
              <div className="truncate">
                <span className="text-muted-foreground">ผู้ปกครอง: </span>
                <span className="font-medium text-foreground">{student.parentName || "-"}</span>
              </div>
              {student.parentPhone && (
                <a
                  href={`tel:${student.parentPhone}`}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-primary/10 text-primary font-mono text-xs font-semibold shrink-0 hover:bg-primary/20 transition-colors"
                >
                  <Phone className="w-3 h-3" />
                  <span>โทร</span>
                </a>
              )}
            </div>
          )}

          {/* แถบปุ่ม Action สำหรับมือถือ (Touch Targets >= 44px) */}
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border">
            <Link
              href={`/admin/students/${student.id}`}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors min-h-[44px]"
            >
              <Eye className="w-4 h-4 text-primary" />
              <span>โปรไฟล์</span>
            </Link>

            <button
              type="button"
              onClick={() => onEdit(student)}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-amber-500/10 hover:text-amber-600 transition-colors min-h-[44px]"
            >
              <Edit2 className="w-4 h-4 text-amber-500" />
              <span>แก้ไข</span>
            </button>

            <button
              type="button"
              onClick={() => onDelete(student)}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border border-border text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors min-h-[44px]"
            >
              <Trash2 className="w-4 h-4 text-destructive" />
              <span>ลบ</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
