import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  Award,
  Bell,
  FileText,
  LucideIcon,
} from "lucide-react";
import { UserRole } from "./session";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/**
 * รวมรายการเมนูการนำทางของแต่ละบทบาท (Single Source of Truth)
 * ใช้ร่วมกันทั้งใน Desktop Sidebar, Mobile Drawer และ Header
 */
export function getNavigationItems(role: UserRole): NavItem[] {
  switch (role) {
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
    default:
      return [];
  }
}

/**
 * ข้อมูลแสดงผลและสีของ Badge สำหรับแต่ละบทบาท
 */
export function getRoleDisplayInfo(role: UserRole) {
  switch (role) {
    case "admin":
      return {
        text: "ผู้ดูแลระบบ (Admin)",
        badgeVariant: "destructive" as const,
        shortText: "ผู้ดูแลระบบ",
      };
    case "teacher":
      return {
        text: "คุณครู (Teacher)",
        badgeVariant: "info" as const,
        shortText: "คุณครู",
      };
    case "student":
      return {
        text: "นักเรียน (Student)",
        badgeVariant: "success" as const,
        shortText: "นักเรียน",
      };
    default:
      return {
        text: "ผู้ใช้งานทั่วไป",
        badgeVariant: "outline" as const,
        shortText: "ผู้ใช้งาน",
      };
  }
}

