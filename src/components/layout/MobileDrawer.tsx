"use client";

import React, { useState, useEffect } from "react";
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
  Menu,
  X,
} from "lucide-react";

interface MobileDrawerProps {
  user: SessionUser;
}

export function MobileDrawer({ user }: MobileDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // ปิด Drawer อัตโนมัติเมื่อเปลี่ยนหน้าจอ
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // ป้องกันการ scroll body เมื่อ Drawer เปิดอยู่
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

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
        return { text: "ผู้ดูแลระบบ", variant: "destructive" as const };
      case "teacher":
        return { text: "คุณครู", variant: "info" as const };
      case "student":
        return { text: "นักเรียน", variant: "success" as const };
    }
  };

  const roleInfo = getRoleLabel();

  return (
    <>
      {/* ปุ่ม Hamburger บนแถบเมนูมือถือ */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-card text-foreground hover:bg-muted transition-colors min-h-[44px] min-w-[44px]"
        aria-label="Open mobile menu"
      >
        <Menu className="w-5 h-5 text-foreground" />
      </button>

      {/* Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden animate-in fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-out Drawer Panel */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border shadow-2xl flex flex-col transition-transform duration-300 ease-in-out md:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <School className="w-4 h-4 text-primary" />
            </div>
            <span className="font-bold text-sm tracking-tight text-foreground">SMS Portal</span>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            เมนูนำทาง
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== `/${user.role}` && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors min-h-[44px]",
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-border bg-muted/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
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
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors border border-destructive/20 min-h-[44px]"
            >
              <LogOut className="w-4 h-4" />
              <span>ออกจากระบบ</span>
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
