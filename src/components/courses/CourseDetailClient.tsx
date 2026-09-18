"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BulkEnrollDialog } from "./BulkEnrollDialog";
import { unenrollStudentAction } from "@/app/(dashboard)/admin/courses/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  ArrowLeft,
  BookOpen,
  Users,
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  UserCheck,
  Search,
  UserMinus,
  Loader2,
  AlertCircle,
} from "lucide-react";

export interface EnrolledStudent {
  enrollmentId: string;
  studentId: string;
  studentCode: string;
  fullName: string;
  gradeLevel: string;
  classroom: string;
  parentName: string | null;
  parentPhone: string | null;
}

interface CourseDetailClientProps {
  course: {
    id: string;
    courseCode: string;
    courseName: string;
    credits: number;
    gradeLevel: string;
    semester: number;
    academicYear: string;
  };
  teacher: {
    id: string;
    fullName: string;
    email: string;
    department: string;
    phone: string | null;
  } | null;
  enrolledStudents: EnrolledStudent[];
}

export function CourseDetailClient({
  course,
  teacher,
  enrolledStudents,
}: CourseDetailClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [unenrollLoading, setUnenrollLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [unenrollTarget, setUnenrollTarget] = useState<{ id: string; name: string } | null>(null);

  // Filter enrolled students
  const filteredStudents = enrolledStudents.filter((s) => {
    const q = search.trim().toLowerCase();
    return (
      !q ||
      s.fullName.toLowerCase().includes(q) ||
      s.studentCode.toLowerCase().includes(q) ||
      `${s.gradeLevel}/${s.classroom}`.includes(q)
    );
  });

  const handleUnenroll = (enrollmentId: string, studentName: string) => {
    setUnenrollTarget({ id: enrollmentId, name: studentName });
  };

  const handleConfirmUnenroll = async () => {
    if (!unenrollTarget) return;

    setUnenrollLoading(unenrollTarget.id);
    setActionError(null);

    try {
      const res = await unenrollStudentAction(unenrollTarget.id, course.id);
      if (!res.success) {
        setActionError(res.error || "ไม่สามารถถอนรายวิชาได้");
      } else {
        setUnenrollTarget(null);
        router.refresh();
      }
    } catch {
      setActionError("เกิดข้อผิดพลาดในการถอนรายวิชา");
    } finally {
      setUnenrollLoading(null);
    }
  };

  const teacherInitial = teacher
    ? teacher.fullName.replace(/^(ดร\.|อ\.|นาย|นาง|น\.ส\.)\s*/, "")[0]
    : "ค";

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: "หลักสูตรรายวิชา", href: "/admin/courses" },
          { label: `${course.courseCode} ${course.courseName}` },
        ]}
        homeHref="/admin"
      />

      {/* Back button */}
      <div>
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับไปหน้ารายการวิชา</span>
        </Link>
      </div>

      {/* Hero Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-700 text-white p-6 sm:p-8 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono font-bold text-sm bg-white/20 backdrop-blur-md px-3 py-1 rounded-xl text-white border border-white/20">
                {course.courseCode}
              </span>
              <span className="text-xs font-semibold bg-emerald-500/80 backdrop-blur-md text-white px-3 py-1 rounded-xl">
                {course.credits.toFixed(1)} หน่วยกิต
              </span>
              <span className="text-xs font-medium bg-white/10 backdrop-blur-md text-white/90 px-3 py-1 rounded-xl">
                {course.gradeLevel} • ภาคเรียนที่ {course.semester}/{course.academicYear}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {course.courseName}
            </h1>

            <p className="text-sm text-white/80 max-w-2xl">
              รายวิชาในหลักสูตรสถานศึกษา ระดับชั้น {course.gradeLevel} ภาคเรียนที่ {course.semester} ปีการศึกษา {course.academicYear}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={() => setIsBulkOpen(true)}
              className="bg-white hover:bg-slate-100 text-indigo-900 font-bold shadow-sm shadow-indigo-950/20"
            >
              <UserCheck className="w-4 h-4 mr-2 text-indigo-600" />
              ลงทะเบียนทั้งห้องเรียน
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Cards: Teacher info & Course stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Teacher In Charge */}
        <div className="md:col-span-2 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">
            <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>อาจารย์ผู้สอนประจำรายวิชา</span>
          </div>

          {teacher ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                  {teacherInitial}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {teacher.fullName}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    กลุ่มสาระการเรียนรู้ {teacher.department}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs">
                {teacher.phone && (
                  <a
                    href={`tel:${teacher.phone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{teacher.phone}</span>
                  </a>
                )}
                <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-mono">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{teacher.email}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-sm text-slate-500 dark:text-slate-400">
              ⚠️ ยังไม่ได้ระบุอาจารย์ผู้สอนประจำรายวิชานี้ (สามารถแก้ไขได้ที่หน้าหลักสูตร)
            </div>
          )}
        </div>

        {/* Course Stats */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>สถิติการลงทะเบียน</span>
          </div>

          <div className="pt-2">
            <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {enrolledStudents.length}{" "}
              <span className="text-sm font-medium text-slate-500">คน</span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              จำนวนนักเรียนที่ลงทะเบียนเรียนในภาคเรียนนี้
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex justify-between">
            <span>ชั่วโมงสอนโดยประมาณ:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {course.credits * 2} คาบ/สัปดาห์
            </span>
          </div>
        </div>
      </div>

      {actionError && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex items-center gap-3 text-rose-700 dark:text-rose-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Enrolled Students Section */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>รายชื่อนักเรียนที่ลงทะเบียนในรายวิชานี้</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              แสดงนักเรียนทั้งหมด {filteredStudents.length} / {enrolledStudents.length} คน
            </p>
          </div>

          {/* Search box within course */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="ค้นหาชื่อ, รหัสนักเรียน, หรือห้อง..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs bg-white dark:bg-slate-950"
            />
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <Users className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              ยังไม่มีนักเรียนลงทะเบียนในรายวิชานี้ หรือไม่ตรงกับคำค้นหา
            </p>
            <p className="text-xs text-slate-400 mt-1">
              คลิกปุ่ม &quot;ลงทะเบียนทั้งห้องเรียน&quot; ด้านบนเพื่อเพิ่มนักเรียนเข้าสู่วิชานี้
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800/80">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 font-semibold uppercase text-slate-500 dark:text-slate-400">
                    <th className="py-3 px-4">รหัสนักเรียน</th>
                    <th className="py-3 px-4">ชื่อ-นามสกุล</th>
                    <th className="py-3 px-4">ระดับชั้น/ห้อง</th>
                    <th className="py-3 px-4">ผู้ปกครอง & เบอร์ติดต่อ</th>
                    <th className="py-3 px-4 text-right">ถอนรายวิชา</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredStudents.map((s) => (
                    <tr
                      key={s.enrollmentId}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                        <Link
                          href={`/admin/students/${s.studentId}`}
                          className="hover:text-indigo-600 transition-colors"
                        >
                          {s.studentCode}
                        </Link>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                        <Link
                          href={`/admin/students/${s.studentId}`}
                          className="hover:text-indigo-600 transition-colors"
                        >
                          {s.fullName}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {s.gradeLevel}/{s.classroom}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {s.parentName || "-"} {s.parentPhone && `(${s.parentPhone})`}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleUnenroll(s.enrollmentId, s.fullName)}
                          disabled={unenrollLoading === s.enrollmentId}
                          title="ถอนนักเรียนออกจากรายวิชา"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          {unenrollLoading === s.enrollmentId ? (
                            <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                          ) : (
                            <UserMinus className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="block md:hidden space-y-3">
              {filteredStudents.map((s) => (
                <div
                  key={s.enrollmentId}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                        {s.studentCode}
                      </span>
                      <span className="px-1.5 py-0.2 rounded font-semibold bg-slate-200 dark:bg-slate-700 text-[11px]">
                        {s.gradeLevel}/{s.classroom}
                      </span>
                    </div>
                    <div className="font-medium text-slate-900 dark:text-white">
                      {s.fullName}
                    </div>
                    {s.parentPhone && (
                      <div className="text-[11px] text-slate-400">
                        ผู้ปกครอง: {s.parentPhone}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleUnenroll(s.enrollmentId, s.fullName)}
                    disabled={unenrollLoading === s.enrollmentId}
                    aria-label={`ถอน ${s.fullName}`}
                    className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    {unenrollLoading === s.enrollmentId ? (
                      <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                    ) : (
                      <UserMinus className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bulk Enroll Dialog */}
      <BulkEnrollDialog
        open={isBulkOpen}
        onOpenChange={setIsBulkOpen}
        courseId={course.id}
        courseCode={course.courseCode}
        courseName={course.courseName}
        defaultGrade={course.gradeLevel}
        onSuccess={() => router.refresh()}
      />

      {/* Confirmation Dialog สำหรับถอนรายวิชา */}
      <ConfirmDialog
        open={Boolean(unenrollTarget)}
        onOpenChange={(open) => !open && setUnenrollTarget(null)}
        title="ยืนยันการถอนรายวิชา"
        description={`ต้องการถอนนักเรียน "${unenrollTarget?.name}" ออกจากรายวิชา ${course.courseCode} ${course.courseName} ใช่หรือไม่?`}
        confirmLabel="ถอนนักเรียน"
        cancelLabel="ยกเลิก"
        isDestructive={true}
        isLoading={Boolean(unenrollLoading)}
        onConfirm={handleConfirmUnenroll}
      />
    </div>
  );
}
