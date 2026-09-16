"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { StudentRecord, StudentFormDialog } from "./StudentFormDialog";
import { DeleteStudentDialog } from "./DeleteStudentDialog";
import { StudentTable } from "./StudentTable";
import { StudentCardList } from "./StudentCardList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  UserPlus,
  Download,
  Filter,
  X,
  Users,
} from "lucide-react";

interface StudentListClientProps {
  initialStudents: StudentRecord[];
}

export function StudentListClient({ initialStudents }: StudentListClientProps) {
  const router = useRouter();

  const [students, setStudents] = useState<StudentRecord[]>(initialStudents);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [selectedRoom, setSelectedRoom] = useState<string>("all");

  // State สำหรับ Dialogs
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<StudentRecord | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<StudentRecord | null>(null);

  // อัปเดต students เมื่อ initialStudents เปลี่ยนแปลงจากการ Revalidate
  React.useEffect(() => {
    setStudents(initialStudents);
  }, [initialStudents]);

  // ตัวกรองและค้นหานักเรียนแบบ Real-time
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // ตัวกรองคำค้นหา (ชื่อ, รหัส, อีเมล, เลขบัตร)
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        s.user.fullName.toLowerCase().includes(q) ||
        s.studentCode.toLowerCase().includes(q) ||
        s.user.email.toLowerCase().includes(q) ||
        (s.nationalId && s.nationalId.includes(q));

      // ตัวกรองระดับชั้น
      const matchGrade = selectedGrade === "all" || s.gradeLevel === selectedGrade;

      // ตัวกรองห้องเรียน
      const matchRoom = selectedRoom === "all" || s.classroom === selectedRoom;

      return matchSearch && matchGrade && matchRoom;
    });
  }, [students, searchQuery, selectedGrade, selectedRoom]);

  // สถิติจำนวนนักเรียนในแต่ละระดับชั้น
  const gradeCounts = useMemo(() => {
    return {
      all: students.length,
      "ม.4": students.filter((s) => s.gradeLevel === "ม.4").length,
      "ม.5": students.filter((s) => s.gradeLevel === "ม.5").length,
      "ม.6": students.filter((s) => s.gradeLevel === "ม.6").length,
    };
  }, [students]);

  const handleOpenAdd = () => {
    setStudentToEdit(null);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (student: StudentRecord) => {
    setStudentToEdit(student);
    setFormDialogOpen(true);
  };

  const handleOpenDelete = (student: StudentRecord) => {
    setStudentToDelete(student);
    setDeleteDialogOpen(true);
  };

  const handleSuccess = () => {
    router.refresh();
  };

  // URL สำหรับดาวน์โหลด CSV ตามตัวกรองปัจจุบัน
  const csvExportUrl = `/api/students/export?grade=${selectedGrade}&room=${selectedRoom}&search=${encodeURIComponent(searchQuery)}`;

  return (
    <div className="space-y-5">
      {/* Header และปุ่ม Action หลัก */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              ทะเบียนข้อมูลนักเรียน
            </h1>
            <Badge variant="secondary" className="text-xs">
              {filteredStudents.length} / {students.length} คน
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            ค้นหา ตรวจสอบ แก้ไขข้อมูล และส่งออกรายชื่อนักเรียนประจำสถานศึกษา
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <a
            href={csvExportUrl}
            download
            className="inline-flex items-center justify-center gap-2 h-10 px-4 py-2 rounded-lg border border-border bg-card text-foreground hover:bg-muted text-sm font-medium transition-colors shadow-sm min-h-[44px]"
          >
            <Download className="w-4 h-4 text-muted-foreground" />
            <span>ส่งออก CSV</span>
          </a>

          <Button onClick={handleOpenAdd} className="gap-2 shadow-md min-h-[44px]">
            <UserPlus className="w-4 h-4" />
            <span>เพิ่มนักเรียนใหม่</span>
          </Button>
        </div>
      </div>

      {/* แถบตัวกรองและช่องค้นหา (Search & Filter Bar) */}
      <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* ช่องค้นหา */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
            <Input
              placeholder="ค้นหาจากชื่อ, รหัสนักเรียน (เช่น STU-1001), หรืออีเมล..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground p-0.5 rounded-full hover:bg-muted"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* เลือกห้องเรียน */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
              ห้องเรียน:
            </span>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="h-11 rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="all">ทุกห้อง</option>
              <option value="1">ห้อง 1</option>
              <option value="2">ห้อง 2</option>
              <option value="3">ห้อง 3</option>
              <option value="4">ห้อง 4</option>
            </select>
          </div>
        </div>

        {/* เม็ดแคปซูลแยกระดับชั้น (Grade Filter Pills) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-muted-foreground font-medium shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>ระดับชั้น:</span>
          </span>

          {(["all", "ม.4", "ม.5", "ม.6"] as const).map((grade) => {
            const isSelected = selectedGrade === grade;
            const label = grade === "all" ? "ทั้งหมด" : grade;
            const count = gradeCounts[grade];

            return (
              <button
                key={grade}
                type="button"
                onClick={() => setSelectedGrade(grade)}
                className={`px-3 py-1.5 rounded-full font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                <span>{label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? "bg-white/20 text-white" : "bg-background/80 text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* มุมมอง Desktop: Data Table */}
      <StudentTable
        students={filteredStudents}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      {/* มุมมอง Mobile: Adaptive Cards Stack */}
      <StudentCardList
        students={filteredStudents}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      {/* Modals สำหรับ เพิ่ม/แก้ไข และ ลบ */}
      <StudentFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        studentToEdit={studentToEdit}
        onSuccess={handleSuccess}
      />

      <DeleteStudentDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        student={studentToDelete}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
