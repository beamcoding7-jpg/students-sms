"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { CourseRecord, CourseFormDialog } from "./CourseFormDialog";
import { DeleteCourseDialog } from "./DeleteCourseDialog";
import { CourseTable } from "./CourseTable";
import { CourseCardList } from "./CourseCardList";
import { TeacherRecord } from "@/components/teachers/TeacherFormDialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Search,
  BookPlus,
  Download,
  X,
  GraduationCap,
} from "lucide-react";

interface CourseListClientProps {
  initialCourses: CourseRecord[];
  availableTeachers: TeacherRecord[];
}

export function CourseListClient({
  initialCourses,
  availableTeachers,
}: CourseListClientProps) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedSemester, setSelectedSemester] = useState("all");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<CourseRecord | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<CourseRecord | null>(null);

  // การกรองข้อมูลแบบ Real-time
  const filteredCourses = useMemo(() => {
    return initialCourses.filter((c) => {
      const searchLower = search.trim().toLowerCase();
      const matchSearch =
        !searchLower ||
        c.courseCode.toLowerCase().includes(searchLower) ||
        c.courseName.toLowerCase().includes(searchLower) ||
        (c.teacher?.user.fullName && c.teacher.user.fullName.toLowerCase().includes(searchLower));

      if (!matchSearch) return false;

      if (selectedGrade !== "all" && c.gradeLevel !== selectedGrade) {
        return false;
      }

      if (selectedSemester !== "all" && String(c.semester) !== selectedSemester) {
        return false;
      }

      return true;
    });
  }, [initialCourses, search, selectedGrade, selectedSemester]);

  // คำนวณจำนวนวิชาในแต่ละระดับชั้น
  const gradeCounts = useMemo(() => {
    return {
      all: initialCourses.length,
      "ม.4": initialCourses.filter((c) => c.gradeLevel === "ม.4").length,
      "ม.5": initialCourses.filter((c) => c.gradeLevel === "ม.5").length,
      "ม.6": initialCourses.filter((c) => c.gradeLevel === "ม.6").length,
    };
  }, [initialCourses]);

  const handleOpenAdd = () => {
    setCourseToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (course: CourseRecord) => {
    setCourseToEdit(course);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (course: CourseRecord) => {
    setCourseToDelete(course);
    setIsDeleteOpen(true);
  };

  const handleSuccess = () => {
    router.refresh();
  };

  const exportUrl = `/api/courses/export?grade=${encodeURIComponent(
    selectedGrade
  )}&sem=${encodeURIComponent(selectedSemester)}&search=${encodeURIComponent(search)}`;

  return (
    <div className="space-y-6">
      {/* Top Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              หลักสูตรและรายวิชา
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
              {filteredCourses.length} / {initialCourses.length} วิชา
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            กำหนดหลักสูตร หน่วยกิต อาจารย์ผู้สอน และจัดการการลงทะเบียนเรียนของนักเรียน
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <a
            href={exportUrl}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>ส่งออก CSV</span>
          </a>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-sm shadow-indigo-600/20 transition-colors"
          >
            <BookPlus className="w-4 h-4" />
            <span>เพิ่มรายวิชาใหม่</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Control Bar */}
      <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-sm space-y-3.5">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="ค้นหาจากรหัสวิชา, ชื่อวิชา หรือชื่ออาจารย์ผู้สอน..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label="ล้างคำค้นหา"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Semester Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 shrink-0 hidden sm:inline">ภาคเรียน:</span>
            <Select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full md:w-[160px] bg-white dark:bg-slate-950"
            >
              <option value="all">ทุกภาคเรียน</option>
              <option value="1">ภาคเรียนที่ 1</option>
              <option value="2">ภาคเรียนที่ 2</option>
            </Select>
          </div>
        </div>

        {/* Grade Level Pills */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 flex items-center gap-1 shrink-0">
            <GraduationCap className="w-3.5 h-3.5" />
            ระดับชั้น:
          </span>

          {(["all", "ม.4", "ม.5", "ม.6"] as const).map((grade) => {
            const count = gradeCounts[grade] || 0;
            const label = grade === "all" ? "ทั้งหมด" : grade;
            const isSelected = selectedGrade === grade;
            return (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors font-medium ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {label} {count}
              </button>
            );
          })}
        </div>
      </div>

      {/* Responsive View Switch */}
      <div className="hidden md:block">
        <CourseTable
          courses={filteredCourses}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
        />
      </div>

      <div className="block md:hidden">
        <CourseCardList
          courses={filteredCourses}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
        />
      </div>

      {/* Modals */}
      <CourseFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        courseToEdit={courseToEdit}
        availableTeachers={availableTeachers}
        onSuccess={handleSuccess}
      />

      <DeleteCourseDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        course={courseToDelete}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
