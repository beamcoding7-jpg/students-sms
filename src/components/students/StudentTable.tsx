"use client";

import React from "react";
import Link from "next/link";
import { StudentRecord } from "./StudentFormDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit2, Trash2, Phone, Mail, Users } from "lucide-react";

interface StudentTableProps {
  students: StudentRecord[];
  onEdit: (student: StudentRecord) => void;
  onDelete: (student: StudentRecord) => void;
}

export function StudentTable({ students, onEdit, onDelete }: StudentTableProps) {
  if (students.length === 0) {
    return (
      <div className="hidden md:flex flex-col items-center justify-center p-12 text-center border border-dashed border-border rounded-xl bg-card">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <Users className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="font-semibold text-foreground text-base">ไม่พบข้อมูลนักเรียน</p>
        <p className="text-sm text-muted-foreground mt-1">
          ลองปรับคำค้นหาหรือตัวกรองระดับชั้นใหม่อีกครั้ง
        </p>
      </div>
    );
  }

  return (
    <div className="hidden md:block overflow-hidden border border-border rounded-xl bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
            <tr>
              <th scope="col" className="px-5 py-3.5">รหัสนักเรียน</th>
              <th scope="col" className="px-5 py-3.5">ชื่อ-นามสกุล</th>
              <th scope="col" className="px-5 py-3.5">ระดับชั้น / ห้อง</th>
              <th scope="col" className="px-5 py-3.5">ผู้ปกครอง & เบอร์ติดต่อ</th>
              <th scope="col" className="px-5 py-3.5">อีเมลเข้าสู่ระบบ</th>
              <th scope="col" className="px-5 py-3.5 text-right">การจัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {students.map((student) => (
              <tr
                key={student.id}
                className="hover:bg-muted/40 transition-colors group"
              >
                {/* รหัสนักเรียน */}
                <td className="px-5 py-4 font-mono font-bold text-primary">
                  <Badge variant="outline" className="font-mono bg-primary/5 text-primary border-primary/20">
                    {student.studentCode}
                  </Badge>
                </td>

                {/* ชื่อ-นามสกุล */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                      {student.user.fullName.charAt(0)}
                    </div>
                    <div>
                      <Link
                        href={`/admin/students/${student.id}`}
                        className="font-semibold text-foreground hover:text-primary transition-colors hover:underline"
                      >
                        {student.user.fullName}
                      </Link>
                      {student.nationalId && (
                        <p className="text-xs text-muted-foreground font-mono">
                          ID: {student.nationalId}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                {/* ระดับชั้น / ห้อง */}
                <td className="px-5 py-4">
                  <Badge variant="secondary" className="font-medium text-xs">
                    {student.gradeLevel}/{student.classroom}
                  </Badge>
                </td>

                {/* ข้อมูลผู้ปกครอง */}
                <td className="px-5 py-4">
                  <div className="space-y-0.5">
                    <p className="text-foreground text-xs font-medium">
                      {student.parentName || "-"}
                    </p>
                    {student.parentPhone && (
                      <a
                        href={`tel:${student.parentPhone}`}
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors font-mono"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{student.parentPhone}</span>
                      </a>
                    )}
                  </div>
                </td>

                {/* อีเมล */}
                <td className="px-5 py-4 font-mono text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate max-w-[160px]">{student.user.email}</span>
                  </div>
                </td>

                {/* Action Buttons */}
                <td className="px-5 py-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/students/${student.id}`}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                      title="ดูโปรไฟล์นักเรียน"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="sr-only">ดูโปรไฟล์</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => onEdit(student)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-amber-500/10 text-muted-foreground hover:text-amber-600 transition-colors"
                      title="แก้ไขข้อมูล"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span className="sr-only">แก้ไข</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(student)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      title="ลบข้อมูล"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="sr-only">ลบ</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
