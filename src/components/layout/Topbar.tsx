"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { SessionUser } from "@/lib/session";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { MobileDrawer } from "./MobileDrawer";
import { UserAccountDialog } from "@/components/shared/UserAccountDialog";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";

import { SCHOOL_CONFIG } from "@/config/school";

interface TopbarProps {
  user: SessionUser;
}

export function Topbar({ user }: TopbarProps) {
  const pathname = usePathname();
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  // สร้าง Title ภาษาไทย
  const getPageTitle = () => {
    if (pathname.includes("/students")) return "จัดการข้อมูลนักเรียน";
    if (pathname.includes("/teachers")) return "จัดการข้อมูลครูและบุคลากร";
    if (pathname.includes("/courses")) return "หลักสูตรรายวิชา";
    if (pathname.includes("/attendance")) return "การเช็คชื่อเข้าเรียน";
    if (
      pathname.includes("/schedules") ||
      pathname.includes("/schedule") ||
      pathname.includes("/timetable")
    )
      return "ตารางเรียนและตารางสอน";
    if (pathname.includes("/grades")) return "ผลการเรียนและบันทึกคะแนน";
    if (pathname.includes("/assignments")) return "การบ้านและงานที่มอบหมาย";
    if (pathname.includes("/announcements")) return "ประกาศข่าวสารโรงเรียน";
    if (pathname.includes("/settings")) return "ตั้งค่าระบบสถานศึกษา";

    switch (user.role) {
      case "admin":
        return "ภาพรวมระบบผู้ดูแล";
      case "teacher":
        return "แดชบอร์ดคุณครู";
      case "student":
        return "แดชบอร์ดนักเรียน";
      default:
        return "ระบบบริหารสถานศึกษา";
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-4 md:px-8 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0">
        {/* ฝั่งซ้าย: Mobile Drawer + Page Title */}
        <div className="flex items-center gap-3">
          <MobileDrawer user={user} onOpenAccount={() => setIsAccountOpen(true)} />
          <div>
            <span className="text-base md:text-lg font-bold text-foreground truncate block">
              {getPageTitle()}
            </span>
          </div>
        </div>

        {/* ฝั่งขวา: Academic Year Badge + ThemeToggle + User Profile Trigger */}
        <div className="flex items-center gap-2 md:gap-4">
          <Badge
            variant="outline"
            className="hidden sm:inline-flex text-xs font-normal border-primary/30 text-primary bg-primary/5"
          >
            ภาคเรียนที่ {SCHOOL_CONFIG.semester}/{SCHOOL_CONFIG.academicYear}
          </Badge>

          <ThemeToggle />

          {/* ปุ่มโปรไฟล์สำหรับ Desktop */}
          <button
            type="button"
            onClick={() => setIsAccountOpen(true)}
            className="hidden lg:flex items-center gap-2 pl-2 border-l border-border hover:opacity-80 transition-opacity text-left cursor-pointer group"
            title="คลิกเพื่อดูข้อมูลบัญชีและเปลี่ยนรหัสผ่าน"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              {user.fullName.charAt(0)}
            </div>
            <div className="text-left leading-tight">
              <p className="text-xs font-semibold text-foreground truncate max-w-[130px]">
                {user.fullName}
              </p>
              <p className="text-[10px] text-muted-foreground capitalize">{user.role}</p>
            </div>
          </button>

          {/* ปุ่มโปรไฟล์สำหรับ Mobile / Tablet */}
          <button
            type="button"
            onClick={() => setIsAccountOpen(true)}
            className="lg:hidden w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs"
            aria-label="ข้อมูลบัญชีผู้ใช้"
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Modal จัดการข้อมูลบัญชี & เปลี่ยนรหัสผ่าน */}
      <UserAccountDialog
        open={isAccountOpen}
        onOpenChange={setIsAccountOpen}
        userRole={user.role}
      />
    </>
  );
}
