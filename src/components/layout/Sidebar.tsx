"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SessionUser } from "@/lib/session";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  School,
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  Award,
  Bell,
  FileText,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  user: SessionUser;
  onLogout?: () => void;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  // กำหนดเมนูตาม Role
  const getNavItems = () => {
    switch (user.role) {
      case "admin":
        return [
          { href: "/admin", label: "ภาพรวมระบบ", icon: LayoutDashboard },
          { href: "/admin/students", label: "ข้อมูลนักเรียน", icon: Users },
          { href: "/admin/teachers", label: "ข้อมูลครูและบุคลากร", icon: GraduationCap },
          { href: "/admin/courses", label: "หลักสูตรรายวิชา", icon: BookOpen },
          { href: "/admin/attendance", label: "สถิติการเข้าเรียน", icon: CalendarCheck },
          { href: "/admin/schedules", label: "ตารางเรียน/สอน", icon: CalendarDays },
          { href: "/admin/grades", label: "ผลการเรียนภาพรวม", icon: Award },
          { href: "/admin/announcements", label: "ประกาศข่าวสาร", icon: Bell },
        ];
      case "teacher":
        return [
          { href: "/teacher", label: "แดชบอร์ดคุณครู", icon: LayoutDashboard },
          { href: "/teacher/attendance", label: "เช็คชื่อประจำวัน", icon: CalendarCheck },
          { href: "/teacher/grades", label: "บันทึกคะแนนและตัดเกรด", icon: Award },
          { href: "/teacher/schedule", label: "ตารางสอนประจำสัปดาห์", icon: CalendarDays },
          { href: "/teacher/assignments", label: "การบ้านและงานที่มอบหมาย", icon: FileText },
        ];
      case "student":
        return [
          { href: "/student", label: "แดชบอร์ดนักเรียน", icon: LayoutDashboard },
          { href: "/student/grades", label: "ผลการเรียนและเกรด (GPA)", icon: Award },
          { href: "/student/attendance", label: "ประวัติการเข้าเรียน", icon: CalendarCheck },
          { href: "/student/timetable", label: "ตารางเรียนประจำสัปดาห์", icon: CalendarDays },
          { href: "/student/assignments", label: "การบ้านและส่งงาน", icon: FileText },
        ];
    }
  };

  const navItems = getNavItems();

  const getRoleLabel = () => {
    switch (user.role) {
      case "admin":
        return { text: "ผู้ดูแลระบบ (Admin)", variant: "destructive" as const };
      case "teacher":
        return { text: "คุณครู (Teacher)", variant: "info" as const };
      case "student":
        return { text: "นักเรียน (Student)", variant: "success" as const };
    }
  };

  const roleInfo = getRoleLabel();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card text-card-foreground shrink-0 h-screen sticky top-0">
      {/* ส่วนหัว Sidebar: ตราโรงเรียน & ชื่อระบบ */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-border">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <School className="w-5 h-5 text-primary" />
        </div>
        <div className="overflow-hidden">
          <span className="font-bold text-sm tracking-tight text-foreground truncate block">
            SMS School Portal
          </span>
          <p className="text-xs text-muted-foreground truncate">
            โรงเรียนสาธิตวิทยาคม
          </p>
        </div>
      </div>

      {/* เมนูการนำทาง (Nav links) */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          เมนูหลัก
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== `/${user.role}` && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ส่วนท้าย Sidebar: ข้อมูลผู้ใช้ & ปุ่ม Logout */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
            {user.fullName.charAt(0)}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-sm font-semibold text-foreground truncate">{user.fullName}</p>
            <Badge variant={roleInfo.variant} className="text-[10px] px-1.5 py-0 mt-0.5">
              {roleInfo.text}
            </Badge>
          </div>
        </div>

        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors border border-destructive/20"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>ออกจากระบบ</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
