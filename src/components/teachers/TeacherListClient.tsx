"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { TeacherRecord, TeacherFormDialog } from "./TeacherFormDialog";
import { DeleteTeacherDialog } from "./DeleteTeacherDialog";
import { TeacherTable } from "./TeacherTable";
import { TeacherCardList } from "./TeacherCardList";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { departmentOptions } from "@/lib/validations/teacher";
import {
  Search,
  UserPlus,
  Download,
  X,
  Filter,
  Users,
} from "lucide-react";

interface TeacherListClientProps {
  initialTeachers: TeacherRecord[];
}

export function TeacherListClient({ initialTeachers }: TeacherListClientProps) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedAdvisor, setSelectedAdvisor] = useState("all");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [teacherToEdit, setTeacherToEdit] = useState<TeacherRecord | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<TeacherRecord | null>(null);

  // การกรองข้อมูลแบบ Real-time
  const filteredTeachers = useMemo(() => {
    return initialTeachers.filter((t) => {
      // 1. ตรวจสอบเงื่อนไขค้นหา
      const searchLower = search.trim().toLowerCase();
      const matchSearch =
        !searchLower ||
        t.user.fullName.toLowerCase().includes(searchLower) ||
        t.user.email.toLowerCase().includes(searchLower) ||
        t.department.toLowerCase().includes(searchLower) ||
        (t.phone && t.phone.includes(searchLower)) ||
        (t.roomAdvisor && t.roomAdvisor.toLowerCase().includes(searchLower));

      if (!matchSearch) return false;

      // 2. ตรวจสอบกลุ่มสาระฯ
      if (selectedDept !== "all" && t.department !== selectedDept) {
        return false;
      }

      // 3. ตรวจสอบชั้นประจำห้อง
      if (selectedAdvisor === "has_advisor" && !t.roomAdvisor) {
        return false;
      }
      if (selectedAdvisor === "no_advisor" && t.roomAdvisor) {
        return false;
      }

      return true;
    });
  }, [initialTeachers, search, selectedDept, selectedAdvisor]);

  // คำนวณจำนวนครูในแต่ละกลุ่มสาระฯ
  const deptCounts = useMemo(() => {
    const counts: Record<string, number> = { all: initialTeachers.length };
    for (const d of departmentOptions) {
      counts[d] = initialTeachers.filter((t) => t.department === d).length;
    }
    return counts;
  }, [initialTeachers]);

  const handleOpenAdd = () => {
    setTeacherToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (teacher: TeacherRecord) => {
    setTeacherToEdit(teacher);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (teacher: TeacherRecord) => {
    setTeacherToDelete(teacher);
    setIsDeleteOpen(true);
  };

  const handleSuccess = () => {
    router.refresh();
  };

  // URL สำหรับส่งออก CSV พร้อม Query Parameters
  const exportUrl = `/api/teachers/export?dept=${encodeURIComponent(
    selectedDept
  )}&advisor=${encodeURIComponent(selectedAdvisor)}&search=${encodeURIComponent(search)}`;

  return (
    <div className="space-y-6">
      {/* Top Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              ทำเนียบครูและบุคลากร
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
              {filteredTeachers.length} / {initialTeachers.length} ท่าน
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            ค้นหา ตรวจสอบ มอบหมายชั้นประจำห้อง และจัดการข้อมูลบุคลากรทางการศึกษา
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
            <UserPlus className="w-4 h-4" />
            <span>เพิ่มครูใหม่</span>
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
              placeholder="ค้นหาจากชื่อ, อีเมล, กลุ่มสาระฯ หรือเบอร์โทร..."
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

          {/* Advisor Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 shrink-0 hidden sm:inline">ที่ปรึกษา:</span>
            <Select
              value={selectedAdvisor}
              onChange={(e) => setSelectedAdvisor(e.target.value)}
              className="w-full md:w-[170px] bg-white dark:bg-slate-950"
            >
              <option value="all">ทุกสถานะ</option>
              <option value="has_advisor">มีห้องประจำชั้น</option>
              <option value="no_advisor">ไม่มีห้องประจำชั้น</option>
            </Select>
          </div>
        </div>

        {/* Department Filter Pills */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            กลุ่มสาระฯ:
          </span>

          <button
            onClick={() => setSelectedDept("all")}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors font-medium ${
              selectedDept === "all"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            ทั้งหมด {deptCounts.all}
          </button>

          {departmentOptions.map((dept) => {
            const count = deptCounts[dept] || 0;
            if (count === 0 && selectedDept !== dept) return null; // ซ่อนกลุ่มที่ไม่มีเพื่อความสะอาด
            return (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors font-medium ${
                  selectedDept === dept
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {dept} {count}
              </button>
            );
          })}
        </div>
      </div>

      {/* Responsive View Switch: Desktop Table vs Mobile Cards */}
      <div className="hidden md:block">
        <TeacherTable
          teachers={filteredTeachers}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
        />
      </div>

      <div className="block md:hidden">
        <TeacherCardList
          teachers={filteredTeachers}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
        />
      </div>

      {/* Modals */}
      <TeacherFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        teacherToEdit={teacherToEdit}
        onSuccess={handleSuccess}
      />

      <DeleteTeacherDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        teacher={teacherToDelete}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
