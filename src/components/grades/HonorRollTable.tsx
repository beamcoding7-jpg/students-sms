"use client";

import React from "react";
import { Award, Trophy, Medal, Star, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface HonorStudentItem {
  id: string;
  studentCode: string;
  fullName: string;
  gradeLevel: string;
  classroom: string;
  gpa: number;
  totalCredits: number;
  grade4Count: number;
  rank: number;
}

interface HonorRollTableProps {
  students: HonorStudentItem[];
  className?: string;
}

export function HonorRollTable({ students, className }: HonorRollTableProps) {
  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-bold text-xs shadow-sm">
            <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            อันดับ 1
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200 font-bold text-xs shadow-sm">
            <Medal className="w-3.5 h-3.5 text-slate-400 fill-slate-400" />
            อันดับ 2
          </span>
        );
      case 3:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-700/10 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200 font-bold text-xs shadow-sm">
            <Medal className="w-3.5 h-3.5 text-amber-700 fill-amber-700" />
            อันดับ 3
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 font-semibold text-xs">
            {rank}
          </span>
        );
    }
  };

  const getHonorBadge = (gpa: number) => {
    if (gpa >= 3.8) {
      return (
        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300 hover:bg-emerald-100 gap-1 text-[11px]">
          <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" />
          เกียรตินิยมอันดับ 1
        </Badge>
      );
    }
    if (gpa >= 3.5) {
      return (
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border-blue-300 hover:bg-blue-100 gap-1 text-[11px]">
          <Award className="w-3 h-3 fill-blue-500 text-blue-500" />
          เกียรตินิยมอันดับ 2
        </Badge>
      );
    }
    if (gpa >= 3.2) {
      return (
        <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300 border-purple-300 hover:bg-purple-100 text-[11px]">
          ผลการเรียนดีเด่น
        </Badge>
      );
    }
    return null;
  };

  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">
              ทำเนียบนักเรียนเรียนดี (Honor Roll)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              รายชื่อนักเรียนที่มีผลการเรียนยอดเยี่ยมระดับชั้นมัธยมศึกษา
            </p>
          </div>
        </div>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          แสดง {students.length} อันดับแรก
        </span>
      </div>

      {/* Desktop Table (md and up) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50/75 dark:bg-slate-800/40 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th scope="col" className="px-5 py-3.5 text-center w-20">อันดับ</th>
              <th scope="col" className="px-5 py-3.5">รหัสนักเรียน</th>
              <th scope="col" className="px-5 py-3.5">ชื่อ-นามสกุล</th>
              <th scope="col" className="px-5 py-3.5">ห้องเรียน</th>
              <th scope="col" className="px-5 py-3.5 text-center">วิชาเกรด 4.0</th>
              <th scope="col" className="px-5 py-3.5 text-center">หน่วยกิต</th>
              <th scope="col" className="px-5 py-3.5 text-center">GPA</th>
              <th scope="col" className="px-5 py-3.5 text-center">เกียรติบัตร</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {students.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-slate-400">
                  ไม่พบข้อมูลผลการเรียนที่เข้าเกณฑ์
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr
                  key={student.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-5 py-3.5 text-center">
                    {getRankBadge(student.rank)}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-500">
                    {student.studentCode}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-white">
                    {student.fullName}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
                      {student.gradeLevel}/{student.classroom}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {student.grade4Count}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">วิชา</span>
                  </td>
                  <td className="px-5 py-3.5 text-center text-xs text-slate-600 dark:text-slate-400">
                    {student.totalCredits.toFixed(1)}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className="font-bold text-base text-blue-600 dark:text-blue-400">
                      {student.gpa.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    {getHonorBadge(student.gpa)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards (sm and down) */}
      <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
        {students.length === 0 ? (
          <div className="p-5 text-center text-slate-400 text-sm">
            ไม่พบข้อมูลผลการเรียนที่เข้าเกณฑ์
          </div>
        ) : (
          students.map((student) => (
            <div key={student.id} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getRankBadge(student.rank)}
                  <span className="font-medium text-slate-900 dark:text-white text-sm">
                    {student.fullName}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">GPA</span>
                  <span className="font-bold text-base text-blue-600 dark:text-blue-400">
                    {student.gpa.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono">{student.studentCode}</span>
                  <span>•</span>
                  <span>{student.gradeLevel}/{student.classroom}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>เกรด 4:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400">
                    {student.grade4Count} วิชา
                  </strong>
                </div>
              </div>

              {getHonorBadge(student.gpa) && (
                <div className="pt-1">
                  {getHonorBadge(student.gpa)}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
