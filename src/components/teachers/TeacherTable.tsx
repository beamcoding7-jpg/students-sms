"use client";

import React from "react";
import { TeacherRecord } from "./TeacherFormDialog";
import { Phone, Mail, BookOpen, Edit2, Trash2, GraduationCap } from "lucide-react";

interface TeacherTableProps {
  teachers: TeacherRecord[];
  onEdit: (teacher: TeacherRecord) => void;
  onDelete: (teacher: TeacherRecord) => void;
}

// ฟังก์ชันกำหนดสีตามกลุ่มสาระฯ
function getDepartmentBadgeColor(dept: string) {
  if (dept.includes("วิทยาศาสตร์")) return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900";
  if (dept.includes("คณิตศาสตร์")) return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900";
  if (dept.includes("ไทย")) return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900";
  if (dept.includes("ต่างประเทศ") || dept.includes("อังกฤษ")) return "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-900";
  if (dept.includes("สังคม")) return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900";
  return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800";
}

export function TeacherTable({ teachers, onEdit, onDelete }: TeacherTableProps) {
  if (teachers.length === 0) {
    return (
      <div className="py-16 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/40 dark:bg-slate-900/40">
        <GraduationCap className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600 mb-3" />
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
          ไม่พบข้อมูลคุณครูตามเงื่อนไขที่เลือก
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          ลองเปลี่ยนคำค้นหา หรือรีเซ็ตตัวกรองกลุ่มสาระการเรียนรู้
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="py-3.5 px-4">ชื่อ-นามสกุล</th>
              <th className="py-3.5 px-4">กลุ่มสาระการเรียนรู้</th>
              <th className="py-3.5 px-4">ชั้นประจำห้อง (ที่ปรึกษา)</th>
              <th className="py-3.5 px-4">เบอร์โทรติดต่อ</th>
              <th className="py-3.5 px-4">อีเมลโรงเรียน</th>
              <th className="py-3.5 px-4 text-center">วิชาที่รับผิดชอบ</th>
              <th className="py-3.5 px-4 text-right">การจัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {teachers.map((teacher) => {
              const initial = teacher.user.fullName.replace(/^(ดร\.|อ\.|นาย|นาง|น\.ส\.)\s*/, "")[0] || "ค";
              return (
                <tr
                  key={teacher.id}
                  className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                        {initial}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {teacher.user.fullName}
                        </div>
                        <div className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                          ID: {teacher.id}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getDepartmentBadgeColor(
                        teacher.department
                      )}`}
                    >
                      {teacher.department}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    {teacher.roomAdvisor ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        <GraduationCap className="w-3.5 h-3.5" />
                        {teacher.roomAdvisor}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 dark:text-slate-500">-</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    {teacher.phone ? (
                      <a
                        href={`tel:${teacher.phone}`}
                        className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>{teacher.phone}</span>
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[180px]">{teacher.user.email}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      <BookOpen className="w-3 h-3 text-indigo-500" />
                      {teacher.courseCount || 0} วิชา
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onEdit(teacher)}
                        title="แก้ไขข้อมูลคุณครู"
                        aria-label="แก้ไขข้อมูลคุณครู"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(teacher)}
                        title="ลบข้อมูลคุณครู"
                        aria-label="ลบข้อมูลคุณครู"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
