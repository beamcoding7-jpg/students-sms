"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SCHOOL_CONFIG } from "@/config/school";
import {
  HelpCircle,
  Building2,
  Phone,
  Mail,
  Clock,
  KeyRound,
  GraduationCap,
  Users,
} from "lucide-react";

interface SchoolSupportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SchoolSupportDialog({
  open,
  onOpenChange,
}: SchoolSupportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-foreground">
            <HelpCircle className="w-5 h-5 text-primary" />
            <span>ช่วยเหลือการเข้าสู่ระบบและกู้คืนรหัสผ่าน</span>
          </DialogTitle>
          <DialogDescription>
            แนวทางการเข้าใช้งานสำหรับนักเรียน ครู และบุคลากรของ{SCHOOL_CONFIG.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          {/* ข้อมูลคำแนะนำสำหรับนักเรียนและครู */}
          <div className="space-y-3">
            <div className="p-3 rounded-xl border border-border bg-muted/40 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-foreground text-sm">
                <GraduationCap className="w-4 h-4 text-primary" />
                <span>สำหรับนักเรียน</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                ใช้อีเมลทางการของโรงเรียน (เช่น <code className="text-primary font-mono">รหัสนักเรียน@school.ac.th</code>) ในการเข้าสู่ระบบ หากเป็นการเข้าใช้งานครั้งแรกหรือลืมรหัสผ่าน สามารถติดต่ออาจารย์ที่ปรึกษาประจำชั้นหรือเจ้าหน้าที่งานทะเบียน
              </p>
            </div>

            <div className="p-3 rounded-xl border border-border bg-muted/40 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-foreground text-sm">
                <Users className="w-4 h-4 text-primary" />
                <span>สำหรับครูและบุคลากร</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                ใช้อีเมลประจำตัวบุคลากรในการเข้าสู่ระบบ หากลืมรหัสผ่านสามารถขอรีเซ็ตรหัสผ่านได้ที่ฝ่ายเทคโนโลยีสารสนเทศของโรงเรียน
              </p>
            </div>
          </div>

          {/* ช่องทางติดต่อฝ่ายทะเบียน/สารสนเทศ */}
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
            <div className="flex items-center gap-2 font-semibold text-foreground text-sm">
              <KeyRound className="w-4 h-4 text-primary" />
              <span>ติดต่อฝ่ายสารสนเทศและงานทะเบียน</span>
            </div>

            <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground">
              <div className="flex items-start gap-2.5">
                <Building2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-foreground">{SCHOOL_CONFIG.support.department}</span>
                  <p>{SCHOOL_CONFIG.support.room}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span>โทรศัพท์: <strong className="text-foreground font-mono">{SCHOOL_CONFIG.support.phone}</strong></span>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span>อีเมลกลาง: <strong className="text-foreground font-mono">{SCHOOL_CONFIG.support.email}</strong></span>
              </div>

              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-primary shrink-0" />
                <span>เวลาทำการ: {SCHOOL_CONFIG.support.workingHours}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            เข้าใจแล้ว / ปิดหน้าต่าง
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
