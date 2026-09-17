"use client";

import React from "react";
import Link from "next/link";
import { CourseRecord } from "./CourseFormDialog";
import { BookOpen, Users, Edit2, Trash2, ChevronRight } from "lucide-react";

interface CourseCardListProps {
  courses: CourseRecord[];
  onEdit: (course: CourseRecord) => void;
  onDelete: (course: CourseRecord) => void;
}

export function CourseCardList({ courses, onEdit, onDelete }: CourseCardListProps) {
  if (courses.length === 0) {
    return (
      <div className="py-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/40 dark:bg-slate-900/40 p-6">
        <BookOpen className="w-10 h-10 mx-auto text-slate-400 mb-2" />
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          ไม่พบข้อมูลหลักสูตรรายวิชาตามเงื่อนไขที่เลือก
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          ลองเปลี่ยนคำค้นหา หรือรีเซ็ตตัวกรองระดับชั้น / ภาคเรียน
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {courses.map((course) => {
        return (
          <div
            key={course.id}
            className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 shadow-sm"
          >
            {/* Top row: Code badge, Credits badge, Grade/Semester */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-800/80 text-xs">
                  {course.courseCode}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {course.credits.toFixed(1)} นก.
                </span>
              </div>

              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {course.gradeLevel} (เทอม {course.semester}/{course.academicYear})
              </span>
            </div>

            {/* Course Title */}
            <h2 className="mt-2.5 font-semibold text-slate-900 dark:text-white text-base">
              <Link
                href={`/admin/courses/${course.id}`}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {course.courseName}
              </Link>
            </h2>

            {/* Teacher In Charge */}
            <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span>อาจารย์ผู้สอน:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {course.teacher ? course.teacher.user.fullName : "ยังไม่ระบุผู้สอน"}
              </span>
            </div>

            {/* Bottom Actions & Enrolled link */}
            <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
              <Link
                href={`/admin/courses/${course.id}`}
                className="flex-1 min-h-[44px] inline-flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-indigo-50 dark:bg-slate-800/60 dark:hover:bg-indigo-950/40 border border-slate-200/60 dark:border-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-500" />
                  <span>นักเรียนลงทะเบียน ({course.enrolledCount || 0} คน)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => onEdit(course)}
                  aria-label="แก้ไขข้อมูลรายวิชา"
                  className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(course)}
                  aria-label="ลบรายวิชา"
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
