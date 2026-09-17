"use client";

import React from "react";
import { TeacherRecord } from "./TeacherFormDialog";
import { Phone, Mail, BookOpen, Edit2, Trash2, GraduationCap } from "lucide-react";

interface TeacherCardListProps {
  teachers: TeacherRecord[];
  onEdit: (teacher: TeacherRecord) => void;
  onDelete: (teacher: TeacherRecord) => void;
}

function getDepartmentBadgeColor(dept: string) {
  if (dept.includes("วิทยาศาสตร์")) return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900";
  if (dept.includes("คณิตศาสตร์")) return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900";
  if (dept.includes("ไทย")) return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900";
  if (dept.includes("ต่างประเทศ") || dept.includes("อังกฤษ")) return "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-900";
  if (dept.includes("สังคม")) return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900";
  return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800";
}

export function TeacherCardList({ teachers, onEdit, onDelete }: TeacherCardListProps) {
  if (teachers.length === 0) {
    return (
      <div className="py-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/40 dark:bg-slate-900/40 p-6">
        <GraduationCap className="w-10 h-10 mx-auto text-slate-400 mb-2" />
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          ไม่พบข้อมูลคุณครูตามเงื่อนไขที่เลือก
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          ลองเปลี่ยนคำค้นหา หรือรีเซ็ตตัวกรองกลุ่มสาระการเรียนรู้
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {teachers.map((teacher) => {
        const initial = teacher.user.fullName.replace(/^(ดร\.|อ\.|นาย|นาง|น\.ส\.)\s*/, "")[0] || "ค";
        return (
          <div
            key={teacher.id}
            className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 shadow-sm"
          >
            {/* Header: Avatar, Name, Department */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                  {initial}
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-white text-base">
                    {teacher.user.fullName}
                  </h2>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${getDepartmentBadgeColor(
                        teacher.department
                      )}`}
                    >
                      {teacher.department}
                    </span>
                    {teacher.roomAdvisor && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        <GraduationCap className="w-3 h-3" />
                        {teacher.roomAdvisor}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Course count badge */}
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                <BookOpen className="w-3 h-3 text-indigo-500" />
                {teacher.courseCount || 0} วิชา
              </span>
            </div>

            {/* Contact Details */}
            <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">อีเมลสถานศึกษา:</span>
                <span className="text-slate-700 dark:text-slate-300 font-mono truncate max-w-[200px]">
                  {teacher.user.email}
                </span>
              </div>

              {teacher.phone && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">เบอร์โทรศัพท์:</span>
                  <a
                    href={`tel:${teacher.phone}`}
                    className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{teacher.phone}</span>
                  </a>
                </div>
              )}
            </div>

            {/* Mobile Actions: Tap to call & Buttons */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
              {teacher.phone ? (
                <a
                  href={`tel:${teacher.phone}`}
                  className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold transition-colors px-3 py-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>โทรหาคุณครู</span>
                </a>
              ) : (
                <div className="flex-1" />
              )}

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEdit(teacher)}
                  aria-label="แก้ไขข้อมูลคุณครู"
                  className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(teacher)}
                  aria-label="ลบข้อมูลคุณครู"
                  className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
