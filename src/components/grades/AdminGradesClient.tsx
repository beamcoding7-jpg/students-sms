"use client";

import React, { useState, useMemo } from "react";
import {
  GraduationCap,
  TrendingUp,
  Award,
  CheckCircle2,
  FileSpreadsheet,
  Search,
  Filter,
  Users,
  BookOpen,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  GradeDistributionChart,
  GradeDistributionData,
} from "./GradeDistributionChart";
import { HonorRollTable, HonorStudentItem } from "./HonorRollTable";
import { getGradeBadgeClass } from "./TeacherGradebookClient";

export interface AdminGradeRecord {
  id: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  gradeLevel: string;
  classroom: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  homeworkScore: number;
  midtermScore: number;
  finalScore: number;
  totalScore: number;
  gradeLetter: string;
}

interface AdminGradesClientProps {
  initialGrades: AdminGradeRecord[];
  gradeDistribution: GradeDistributionData[];
  honorRoll: HonorStudentItem[];
  coursesList: Array<{ id: string; courseCode: string; courseName: string }>;
  gradeLevelsList: string[];
}

export function AdminGradesClient({
  initialGrades,
  gradeDistribution,
  honorRoll,
  coursesList,
  gradeLevelsList,
}: AdminGradesClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGradeLevel, setSelectedGradeLevel] = useState<string>("all");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");

  // กรองรายการผลการเรียนตามเงื่อนไขที่เลือก
  const filteredGrades = useMemo(() => {
    return initialGrades.filter((record) => {
      const matchSearch =
        searchQuery === "" ||
        record.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.studentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.courseCode.toLowerCase().includes(searchQuery.toLowerCase());

      const matchGradeLevel =
        selectedGradeLevel === "all" || record.gradeLevel === selectedGradeLevel;

      const matchCourse =
        selectedCourse === "all" || record.courseId === selectedCourse;

      return matchSearch && matchGradeLevel && matchCourse;
    });
  }, [initialGrades, searchQuery, selectedGradeLevel, selectedCourse]);

  // คำนวณ KPI สถิติภาพรวม
  const kpiStats = useMemo(() => {
    const totalRecords = initialGrades.length;
    if (totalRecords === 0) {
      return {
        avgGPA: "0.00",
        totalRecords: 0,
        passRate: "100",
        honorCount: 0,
      };
    }

    // คำนวณ Average GPA จากคะแนนเกรดทั้งหมด
    const sumPoints = initialGrades.reduce((sum, r) => sum + parseFloat(r.gradeLetter || "0"), 0);
    const avgGPA = (sumPoints / totalRecords).toFixed(2);

    // นักเรียนที่ผ่าน (เกรด >= 1.0)
    const passedCount = initialGrades.filter((r) => parseFloat(r.gradeLetter) >= 1.0).length;
    const passRate = Math.round((passedCount / totalRecords) * 100).toString();

    // จำนวนนักเรียนใน Honor Roll ที่ GPA >= 3.50
    const honorCount = honorRoll.filter((s) => s.gpa >= 3.5).length;

    return {
      avgGPA,
      totalRecords,
      passRate,
      honorCount,
    };
  }, [initialGrades, honorRoll]);

  // URL สำหรับดาวน์โหลด CSV พร้อม Query Parameters
  const exportUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedGradeLevel !== "all") params.set("gradeLevel", selectedGradeLevel);
    if (selectedCourse !== "all") params.set("courseId", selectedCourse);
    if (searchQuery) params.set("query", searchQuery);
    return `/api/grades/export?${params.toString()}`;
  }, [selectedGradeLevel, selectedCourse, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <GraduationCap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            ระบบวัดและประเมินผลการเรียน
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            แดชบอร์ดบริหารข้อมูลเกรด ทรานสคริปต์ และวิเคราะห์สัมฤทธิผลทางการศึกษาทั้งสถานศึกษา
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a href={exportUrl} download="grades_report.csv">
            <Button
              variant="outline"
              className="gap-2 border-emerald-600/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              ส่งออกเกรด (CSV)
            </Button>
          </a>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: School Average Grade */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              เกรดเฉลี่ยรวม
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {kpiStats.avgGPA}
            </span>
            <span className="text-xs text-slate-400">/ 4.00</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">จากผลสอบทุกรายวิชา</p>
        </div>

        {/* Card 2: Total Grades */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              บันทึกคะแนนรวม
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {kpiStats.totalRecords}
            </span>
            <span className="text-xs text-slate-400">รายการ</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">ในระบบปัจจุบัน</p>
        </div>

        {/* Card 3: Pass Rate */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              อัตราการสอบผ่าน
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {kpiStats.passRate}%
            </span>
            <span className="text-xs text-slate-400">ผ่านเกณฑ์</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">เกรดตั้งแต่ 1.0 ขึ้นไป</p>
        </div>

        {/* Card 4: Honor Students */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              นักเรียนเรียนดีเด่น
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400">
              {kpiStats.honorCount}
            </span>
            <span className="text-xs text-slate-400">คน</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">GPA ตั้งแต่ 3.50 ขึ้นไป</p>
        </div>
      </div>

      {/* Analytics Row: Grade Distribution & Honor Roll */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GradeDistributionChart
          data={gradeDistribution}
          totalStudents={initialGrades.length}
        />
        <HonorRollTable students={honorRoll.slice(0, 5)} />
      </div>

      {/* Detailed Grades Section with Filter & Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {/* Controls bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">
              รายละเอียดผลการเรียนนักเรียน
            </h3>
            <p className="text-xs text-slate-500">
              พบ {filteredGrades.length} จากทั้งหมด {initialGrades.length} รายการ
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative w-full sm:w-56">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="ค้นหาชื่อ, รหัส, วิชา..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            {/* Grade Level Select */}
            <select
              value={selectedGradeLevel}
              onChange={(e) => setSelectedGradeLevel(e.target.value)}
              className="h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">ทุกระดับชั้น</option>
              {gradeLevelsList.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>

            {/* Course Select */}
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="h-9 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[180px] truncate"
            >
              <option value="all">ทุกรายวิชา</option>
              {coursesList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.courseCode} - {c.courseName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50/75 dark:bg-slate-800/40 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th scope="col" className="px-5 py-3.5">รหัสนักเรียน</th>
                <th scope="col" className="px-5 py-3.5">ชื่อ-นามสกุล</th>
                <th scope="col" className="px-5 py-3.5">ห้องเรียน</th>
                <th scope="col" className="px-5 py-3.5">รหัส/ชื่อวิชา</th>
                <th scope="col" className="px-5 py-3.5 text-center">คะแนนเก็บ (50)</th>
                <th scope="col" className="px-5 py-3.5 text-center">กลางภาค (20)</th>
                <th scope="col" className="px-5 py-3.5 text-center">ปลายภาค (30)</th>
                <th scope="col" className="px-5 py-3.5 text-center font-bold">รวม (100)</th>
                <th scope="col" className="px-5 py-3.5 text-center font-bold">ระดับผลการเรียน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredGrades.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-8 text-center text-slate-400">
                    ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา
                  </td>
                </tr>
              ) : (
                filteredGrades.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-500">
                      {record.studentCode}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-white">
                      {record.studentName}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
                        {record.gradeLevel}/{record.classroom}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400 mr-1.5">
                        {record.courseCode}
                      </span>
                      <span className="text-slate-800 dark:text-slate-200">
                        {record.courseName}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center font-mono text-slate-600 dark:text-slate-300">
                      {record.homeworkScore}
                    </td>
                    <td className="px-5 py-3.5 text-center font-mono text-slate-600 dark:text-slate-300">
                      {record.midtermScore}
                    </td>
                    <td className="px-5 py-3.5 text-center font-mono text-slate-600 dark:text-slate-300">
                      {record.finalScore}
                    </td>
                    <td className="px-5 py-3.5 text-center font-bold text-slate-900 dark:text-white font-mono">
                      {record.totalScore}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getGradeBadgeClass(
                          record.gradeLetter
                        )}`}
                      >
                        {record.gradeLetter}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards Stack */}
        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {filteredGrades.length === 0 ? (
            <div className="p-5 text-center text-slate-400 text-sm">
              ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา
            </div>
          ) : (
            filteredGrades.map((record) => (
              <div key={record.id} className="p-4 space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white text-sm">
                      {record.studentName}
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      {record.studentCode} • {record.gradeLevel}/{record.classroom}
                    </div>
                  </div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getGradeBadgeClass(
                      record.gradeLetter
                    )}`}
                  >
                    เกรด {record.gradeLetter}
                  </span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg space-y-1.5">
                  <div className="font-medium text-slate-900 dark:text-white">
                    <span className="font-mono text-blue-600 dark:text-blue-400 mr-1">
                      {record.courseCode}
                    </span>
                    {record.courseName}
                  </div>
                  <div className="grid grid-cols-4 gap-1 text-center pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                    <div>
                      <span className="text-[10px] text-slate-400 block">เก็บ (50)</span>
                      <span className="font-semibold text-xs">{record.homeworkScore}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">กลาง (20)</span>
                      <span className="font-semibold text-xs">{record.midtermScore}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">ปลาย (30)</span>
                      <span className="font-semibold text-xs">{record.finalScore}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-blue-600 block font-medium">รวม (100)</span>
                      <span className="font-bold text-xs text-blue-600">{record.totalScore}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
