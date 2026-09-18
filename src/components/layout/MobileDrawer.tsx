"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SessionUser } from "@/lib/session";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { getNavigationItems, getRoleDisplayInfo } from "@/lib/navigation";
import { School, LogOut, Menu, X, Settings } from "lucide-react";

interface MobileDrawerProps {
  user: SessionUser;
  onOpenAccount?: () => void;
}

export function MobileDrawer({ user, onOpenAccount }: MobileDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // ป้องกัน Hydration Mismatch สำหรับ React Portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // ปิด Drawer อัตโนมัติเมื่อเปลี่ยนเส้นทางหน้าจอ
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // ปิด Drawer เมื่อผู้ใช้กดปุ่ม Escape บนคีย์บอร์ด
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

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

  const navItems = getNavigationItems(user.role);
  const roleInfo = getRoleDisplayInfo(user.role);

  // ส่วนของ Drawer ที่จะ Render ออกมาผ่าน React Portal ไปยัง document.body
  const drawerPortal = (
    <div
      className={cn(
        "fixed inset-0 z-50 md:hidden transition-all duration-300",
        isOpen ? "pointer-events-auto" : "pointer-events-none delay-200"
      )}
      role="dialog"
      aria-modal="true"
      aria-label="เมนูนำทางบนอุปกรณ์มือถือ"
    >
      {/* Backdrop สีทึบหลังเปิด Drawer พร้อม Fade in/out */}
      <div
        onClick={() => setIsOpen(false)}
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        aria-hidden="true"
      />

      {/* แถบเมนูด้านข้าง (Slide-over drawer) เต็มความสูง 100dvh และรองรับ Safe Area */}
      <div
        className={cn(
          "fixed top-0 bottom-0 left-0 h-[100dvh] w-72 max-w-[85vw] bg-card text-card-foreground border-r border-border shadow-2xl flex flex-col transition-transform duration-300 ease-in-out pb-[env(safe-area-inset-bottom)]",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* ส่วนหัว Drawer */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <School className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-foreground block">
                SMS School Portal
              </span>
              <p className="text-[11px] text-muted-foreground">โรงเรียนสาธิตวิทยาคม</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            aria-label="ปิดเมนูนำทาง"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            เมนูนำทาง
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
                  "flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors min-h-[44px]",
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 shrink-0",
                    isActive ? "text-primary-foreground" : "text-muted-foreground"
                  )}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-border bg-muted/30 shrink-0">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onOpenAccount?.();
            }}
            className="w-full flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-muted transition-colors text-left group mb-2 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
              {user.fullName.charAt(0)}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-semibold text-foreground truncate">{user.fullName}</p>
              <Badge variant={roleInfo.badgeVariant} className="text-[10px] px-1.5 py-0 mt-0.5">
                {roleInfo.shortText}
              </Badge>
            </div>
            <Settings className="w-4 h-4 text-muted-foreground" />
          </button>

          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors border border-destructive/20 min-h-[44px] cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>ออกจากระบบ</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ปุ่ม Hamburger บนแถบเมนูมือถือ */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
        aria-label="เปิดเมนูนำทาง"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Render Drawer & Backdrop ผ่าน Portal ไปยัง body เพื่อหลุดพ้นจาก Containing Block ของ header */}
      {mounted && createPortal(drawerPortal, document.body)}
    </>
  );
}
