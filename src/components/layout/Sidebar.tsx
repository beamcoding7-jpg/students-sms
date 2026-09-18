"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SessionUser } from "@/lib/session";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { getNavigationItems, getRoleDisplayInfo } from "@/lib/navigation";
import { UserAccountDialog } from "@/components/shared/UserAccountDialog";
import { School, LogOut, Settings } from "lucide-react";
import { SCHOOL_CONFIG } from "@/config/school";

interface SidebarProps {
  user: SessionUser;
  onLogout?: () => void;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  // ดึงรายการเมนูและข้อมูล Role จาก Single Source of Truth
  const navItems = getNavigationItems(user.role);
  const roleInfo = getRoleDisplayInfo(user.role);

  return (
    <>
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card text-card-foreground shrink-0 h-screen sticky top-0">
        {/* ส่วนหัว Sidebar: ตราโรงเรียน & ชื่อระบบ */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-border">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <School className="w-5 h-5 text-primary" />
          </div>
          <div className="overflow-hidden">
            <span className="font-bold text-sm tracking-tight text-foreground truncate block">
              {SCHOOL_CONFIG.systemName}
            </span>
            <p className="text-xs text-muted-foreground truncate">{SCHOOL_CONFIG.name}</p>
          </div>
        </div>

        {/* เมนูการนำทาง (Nav links) */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            เมนูหลัก
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== `/${user.role}` && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0",
                    isActive ? "text-primary-foreground" : "text-muted-foreground"
                  )}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* ส่วนท้าย Sidebar: ข้อมูลผู้ใช้ & ปุ่มจัดการบัญชี & ปุ่ม Logout */}
        <div className="p-4 border-t border-border bg-muted/30">
          <button
            type="button"
            onClick={() => setIsAccountOpen(true)}
            className="w-full flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-muted transition-colors text-left group cursor-pointer mb-2"
            title="คลิกเพื่อดูโปรไฟล์และเปลี่ยนรหัสผ่าน"
          >
            <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0 shadow-xs">
              {user.fullName.charAt(0)}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {user.fullName}
              </p>
              <Badge variant={roleInfo.badgeVariant} className="text-[10px] px-1.5 py-0 mt-0.5">
                {roleInfo.shortText}
              </Badge>
            </div>
            <Settings className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors border border-destructive/20 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>ออกจากระบบ</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Modal ข้อมูลบัญชีและเปลี่ยนรหัสผ่าน */}
      <UserAccountDialog
        open={isAccountOpen}
        onOpenChange={setIsAccountOpen}
        userRole={user.role}
      />
    </>
  );
}
