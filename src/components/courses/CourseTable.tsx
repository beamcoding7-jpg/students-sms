"use client";

import React from "react";
import Link from "next/link";
import { CourseRecord } from "./CourseFormDialog";
import { BookOpen, Users, Edit2, Trash2, ExternalLink } from "lucide-react";

interface CourseTableProps {
  courses: CourseRecord[];
  onEdit: (course: CourseRecord) => void;
  onDelete: (course: CourseRecord) => void;
}

export function CourseTable({ courses, onEdit, onDelete }: CourseTableProps) {
  if (courses.length === 0) {
    return (
      <div className="py-16 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/40 dark:bg-slate-900/40">
        <BookOpen className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600 mb-3" />
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
          ไม่พบข้อมูลหลักสูตรรายวิชาตามเงื่อนไขที่เลือก
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          ลองเปลี่ยนคำค้นหา หรือรีเซ็ตตัวกรองระดับชั้น / ภาคเรียน
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
              <th className="py-3.5 px-4">รหัสวิชา</th>
              <th className="py-3.5 px-4">ชื่อรายวิชา</th>
              <th className="py-3.5 px-4 text-center">หน่วยกิต</th>
              <th className="py-3.5 px-4">ระดับชั้น & ภาคเรียน</th>
              <th className="py-3.5 px-4">อาจารย์ผู้สอน</th>
              <th className="py-3.5 px-4 text-center">นักเรียนที่ลงทะเบียน</th>
              <th className="py-3.5 px-4 text-right">การจัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {courses.map((course) => {
              const teacherInitial = course.teacher?.user.fullName
                ? course.teacher.user.fullName.replace(/^(ดร\.|อ\.|นาย|นาง|น\.ส\.)\s*/, "")[0]
                : "-";

              return (
                <tr
                  key={course.id}
                  className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800/80 text-xs">
                      {course.courseCode}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                    <Link
                      href={`/admin/courses/${course.id}`}
                      className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-flex items-center gap-1.5"
                    >
                      <span>{course.courseName}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {course.credits.toFixed(1)} นก.
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="text-xs space-y-0.5">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {course.gradeLevel}
                      </div>
                      <div className="text-slate-400 dark:text-slate-500">
                        ภาคเรียนที่ {course.semester}/{course.academicYear}
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    {course.teacher ? (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
                          {teacherInitial}
                        </div>
                        <div className="truncate max-w-[170px]">
                          <div className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                            {course.teacher.user.fullName}
                          </div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                            {course.teacher.department}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-900">
                        ยังไม่ระบุผู้สอน
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <Link
                      href={`/admin/courses/${course.id}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors border border-slate-200/60 dark:border-slate-700"
                    >
                      <Users className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{course.enrolledCount || 0} คน</span>
                    </Link>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/courses/${course.id}`}
                        title="ดูรายละเอียดและการลงทะเบียน"
                        aria-label="ดูรายละเอียดและการลงทะเบียน"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => onEdit(course)}
                        title="แก้ไขข้อมูลรายวิชา"
                        aria-label="แก้ไขข้อมูลรายวิชา"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(course)}
                        title="ลบรายวิชา"
                        aria-label="ลบรายวิชา"
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
