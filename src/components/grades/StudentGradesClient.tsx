"use client";

import React, { useState } from "react";
import {
  Award,
  BookOpen,
  Printer,
  CheckCircle2,
  TrendingUp,
  School,
  FileText,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getGradeBadgeClass } from "./TeacherGradebookClient";

export interface StudentCourseGradeItem {
  id: string;
  courseCode: string;
  courseName: string;
  credits: number;
  homeworkScore: number;
  midtermScore: number;
  finalScore: number;
  totalScore: number;
  gradeLetter: string;
}

interface StudentGradesClientProps {
  studentName: string;
  studentCode: string;
  nationalId?: string | null;
  classroom: string;
  advisorName?: string | null;
  academicYear: string;
  semester: number;
  gpa: number;
  totalCredits: number;
  passedCredits: number;
  courses: StudentCourseGradeItem[];
}

export function StudentGradesClient({
  studentName,
  studentCode,
  nationalId,
  classroom,
  advisorName,
  academicYear,
  semester,
  gpa,
  totalCredits,
  passedCredits,
  courses,
}: StudentGradesClientProps) {
  const [showOfficialTranscript, setShowOfficialTranscript] = useState(false);

  // กำหนดสถานะผลการเรียนตามเกณฑ์สถานศึกษาไทย
  const getAcademicStanding = (gpaVal: number) => {
    if (gpaVal >= 3.5) {
      return {
        text: "ผลการเรียนดีเด่น (เกียรตินิยม)",
        color: "text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300",
      };
    }
    if (gpaVal >= 3.0) {
      return {
        text: "ผลการเรียนดีมาก",
        color: "text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/60 border-blue-300",
      };
    }
    if (gpaVal >= 2.0) {
      return {
        text: "ผลการเรียนผ่านเกณฑ์ปกติ",
        color: "text-foreground bg-muted border-border",
      };
    }
    return {
      text: "ภาคทัณฑ์ / ต้องปรับปรุง",
      color: "text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/60 border-rose-300",
    };
  };

  const standing = getAcademicStanding(gpa);

  const handlePrint = () => {
    setShowOfficialTranscript(true);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* ส่วนหัวหน้าจอ (ซ่อนตอนพิมพ์) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Award className="w-6 h-6 text-primary" />
            ผลการเรียนและระดับผลการเรียน (GPA)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {studentName} ({studentCode}) • ชั้นมัธยมศึกษาปีที่ {classroom}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowOfficialTranscript((prev) => !prev)}
            className="gap-2 bg-card text-foreground border-border hover:bg-muted font-medium shadow-xs"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>{showOfficialTranscript ? "ซ่อนตัวอย่างทรานสคริปต์" : "ดูตัวอย่างทรานสคริปต์ (A4)"}</span>
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={handlePrint}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์ทรานสคริปต์</span>
          </Button>
        </div>
      </div>

      {/* GPA Summary Hero Card (ซ่อนตอนพิมพ์แบบ Official) */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-6 shadow-sm print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  ผลการเรียนประจำภาคเรียนที่ {semester}/{academicYear}
                </span>
                <h2 className="text-xl font-bold text-foreground">เกรดเฉลี่ยสะสมประจำภาคเรียน</h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">สถานะวิชาการ:</span>
              <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-bold border", standing.color)}>
                {standing.text}
              </span>
            </div>

            {/* แถบ Progress แสดงความคืบหน้า GPA บนสเกล 4.00 */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-muted-foreground">สเกลคะแนนเกรดเฉลี่ย (0.00 – 4.00)</span>
                <span className="font-bold text-primary">{gpa.toFixed(2)} / 4.00</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden p-0.5 border border-border/50">
                <div
                  style={{ width: `${Math.min((gpa / 4.0) * 100, 100)}%` }}
                  className="bg-primary h-full rounded-full transition-all duration-700"
                />
              </div>
            </div>
          </div>

          {/* วงแหวนตัวเลข GPA เด่นชัด */}
          <div className="flex flex-col items-center justify-center p-6 bg-card/80 backdrop-blur rounded-2xl border border-border min-w-[160px] shrink-0 self-center sm:self-auto shadow-xs">
            <span className="text-4xl sm:text-5xl font-black text-primary tracking-tight">
              {gpa.toFixed(2)}
            </span>
            <span className="text-xs text-muted-foreground mt-1 font-semibold">เกรดเฉลี่ย (GPA)</span>
            <span className="text-[11px] text-muted-foreground mt-0.5">
              ผ่าน {passedCredits} / {totalCredits} หน่วยกิต
            </span>
          </div>
        </div>
      </div>

      {/* ตารางคะแนนและเกรดรายวิชาสำหรับดูหน้าเว็บ (Interactive View) */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm print:hidden">
        <div className="p-4 border-b border-border bg-card flex items-center justify-between">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            รายวิชาที่ลงทะเบียนเรียน ({courses.length} วิชา)
          </h3>
          <span className="text-xs text-muted-foreground">
            รวม {totalCredits} หน่วยกิต
          </span>
        </div>

        {/* 1. Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border text-xs">
              <tr>
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 w-28">รหัสวิชา</th>
                <th className="py-3 px-4">ชื่อรายวิชา</th>
                <th className="py-3 px-4 w-24 text-center">หน่วยกิต</th>
                <th className="py-3 px-4 w-24 text-center">เก็บ (50)</th>
                <th className="py-3 px-4 w-24 text-center">กลางภาค (20)</th>
                <th className="py-3 px-4 w-24 text-center">ปลายภาค (30)</th>
                <th className="py-3 px-4 w-24 text-center font-bold">รวม (100)</th>
                <th className="py-3 px-4 w-24 text-center font-bold">เกรด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {courses.map((c, idx) => (
                <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3.5 px-4 text-center text-xs text-muted-foreground">
                    {idx + 1}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs font-bold text-primary">
                    {c.courseCode}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-foreground">
                    {c.courseName}
                  </td>
                  <td className="py-3.5 px-4 text-center text-xs text-muted-foreground">
                    {c.credits}
                  </td>
                  <td className="py-3.5 px-4 text-center text-xs text-muted-foreground">
                    {c.homeworkScore}
                  </td>
                  <td className="py-3.5 px-4 text-center text-xs text-muted-foreground">
                    {c.midtermScore}
                  </td>
                  <td className="py-3.5 px-4 text-center text-xs text-muted-foreground">
                    {c.finalScore}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-sm text-foreground">
                    {c.totalScore}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={cn(
                        "px-3 py-1 rounded-lg text-xs tracking-tight shadow-xs",
                        getGradeBadgeClass(c.gradeLetter)
                      )}
                    >
                      {c.gradeLetter}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 2. Mobile Cards */}
        <div className="block sm:hidden divide-y divide-border">
          {courses.map((c, idx) => (
            <div key={c.id} className="p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-primary">
                    {c.courseCode} ({c.credits} นก.)
                  </span>
                  <h4 className="font-bold text-sm text-foreground">{c.courseName}</h4>
                </div>
                <span
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-bold shadow-xs",
                    getGradeBadgeClass(c.gradeLetter)
                  )}
                >
                  เกรด {c.gradeLetter}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 bg-muted/30 p-2 rounded-lg">
                <span>เก็บ {c.homeworkScore}</span>
                <span>กลางภาค {c.midtermScore}</span>
                <span>ปลายภาค {c.finalScore}</span>
                <span className="font-bold text-foreground">รวม {c.totalScore}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ส่วนใบรายงานผลการเรียนทางการ (Official Transcript - Print View) */}
      {/* แสดงเฉพาะเวลาสั่งพิมพ์ (@media print) หรือกดดูตัวอย่าง */}
      {/* ========================================================================= */}
      <div
        id="official-transcript"
        className={cn(
          "bg-white text-black p-8 rounded-xl border border-gray-300 space-y-6 shadow-sm",
          "print:block print:p-0 print:border-none print:shadow-none print:m-0",
          !showOfficialTranscript && "hidden print:block"
        )}
      >
        {/* หัวหนังสือราชการ */}
        <div className="text-center space-y-1 border-b border-gray-400 pb-4">
          <div className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center mx-auto mb-1">
            <School className="w-6 h-6 text-black" />
          </div>
          <h2 className="text-lg font-bold text-black tracking-tight">โรงเรียนสาธิตวิทยาคม</h2>
          <p className="text-sm font-semibold text-gray-800">
            ใบรายงานผลการเรียนประจำภาคเรียน (Academic Transcript)
          </p>
          <p className="text-xs text-gray-600">
            ภาคเรียนที่ {semester} ปีการศึกษา {academicYear}
          </p>
        </div>

        {/* ข้อมูลนักเรียน */}
        <div className="grid grid-cols-2 gap-2 text-xs border border-gray-300 p-3 rounded-lg bg-gray-50/50">
          <div>
            <span className="text-gray-600">ชื่อ - นามสกุล: </span>
            <span className="font-bold text-black">{studentName}</span>
          </div>
          <div>
            <span className="text-gray-600">รหัสนักเรียน: </span>
            <span className="font-bold text-black font-mono">{studentCode}</span>
          </div>
          <div>
            <span className="text-gray-600">ระดับชั้น: </span>
            <span className="font-bold text-black">ชั้นมัธยมศึกษาปีที่ {classroom}</span>
          </div>
          <div>
            <span className="text-gray-600">ครูที่ปรึกษา: </span>
            <span className="font-bold text-black">{advisorName || "อ.สมชาย ทองดี"}</span>
          </div>
        </div>

        {/* ตารางผลการเรียนทางการ */}
        <table className="w-full text-left text-xs border-collapse border border-gray-400">
          <thead>
            <tr className="bg-gray-100 text-black border-b border-gray-400 font-bold">
              <th className="py-2 px-3 border-r border-gray-300 text-center w-12">ลำดับ</th>
              <th className="py-2 px-3 border-r border-gray-300 w-24">รหัสวิชา</th>
              <th className="py-2 px-3 border-r border-gray-300">ชื่อรายวิชา</th>
              <th className="py-2 px-3 border-r border-gray-300 text-center w-20">หน่วยกิต</th>
              <th className="py-2 px-3 border-r border-gray-300 text-center w-24">คะแนนรวม (100)</th>
              <th className="py-2 px-3 text-center w-20 font-bold">ระดับผลการเรียน</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300 text-gray-900">
            {courses.map((c, idx) => (
              <tr key={c.id}>
                <td className="py-2 px-3 text-center border-r border-gray-300">{idx + 1}</td>
                <td className="py-2 px-3 font-mono font-semibold border-r border-gray-300">
                  {c.courseCode}
                </td>
                <td className="py-2 px-3 border-r border-gray-300">{c.courseName}</td>
                <td className="py-2 px-3 text-center border-r border-gray-300">{c.credits}</td>
                <td className="py-2 px-3 text-center font-mono border-r border-gray-300">
                  {c.totalScore}
                </td>
                <td className="py-2 px-3 text-center font-bold font-mono">{c.gradeLetter}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 text-black font-bold border-t border-gray-400">
              <td colSpan={3} className="py-2 px-3 text-right border-r border-gray-300">
                รวมหน่วยกิตที่เรียน: {totalCredits} หน่วยกิต (ผ่าน {passedCredits} หน่วยกิต)
              </td>
              <td colSpan={3} className="py-2 px-3 text-right">
                เกรดเฉลี่ยสะสม (GPA): <span className="text-base font-black font-mono ml-1">{gpa.toFixed(2)}</span>
              </td>
            </tr>
          </tfoot>
        </table>

        {/* ช่องลงนาม */}
        <div className="grid grid-cols-3 gap-4 pt-10 text-center text-xs text-gray-800">
          <div className="space-y-8">
            <p>ลงชื่อ......................................................</p>
            <p>({advisorName || "อ.สมชาย ทองดี"})<br />ครูที่ปรึกษาประจำชั้น</p>
          </div>
          <div className="space-y-8">
            <p>ลงชื่อ......................................................</p>
            <p>(นางสาวนภา รักษ์งาน)<br />หัวหน้างานทะเบียนและวัดผล</p>
          </div>
          <div className="space-y-8">
            <p>ลงชื่อ......................................................</p>
            <p>(ดร.วิชัย ศรีสวัสดิ์)<br />ผู้อำนวยการโรงเรียนสาธิตวิทยาคม</p>
          </div>
        </div>
      </div>
    </div>
  );
}
