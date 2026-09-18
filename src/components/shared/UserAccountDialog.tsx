"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  getUserProfileAction,
  changePasswordAction,
  UserProfileData,
} from "@/app/(dashboard)/account/actions";
import { getRoleDisplayInfo } from "@/lib/navigation";
import { formatThaiDate, formatPhoneNumber } from "@/lib/utils";
import {
  User,
  KeyRound,
  Shield,
  Phone,
  Mail,
  Calendar,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  School,
} from "lucide-react";

interface UserAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userRole: "admin" | "teacher" | "student";
}

export function UserAccountDialog({ open, onOpenChange, userRole }: UserAccountDialogProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Password Form State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );
  const [isPending, startTransition] = useTransition();

  const roleInfo = getRoleDisplayInfo(userRole);

  // โหลดข้อมูลโปรไฟล์เมื่อเปิด Dialog
  useEffect(() => {
    if (open) {
      setFeedback(null);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setLoadingProfile(true);
      getUserProfileAction().then((res) => {
        setLoadingProfile(false);
        if (res.success && res.data) {
          setProfile(res.data);
        }
      });
    }
  }, [open]);

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (newPassword.length < 6) {
      setFeedback({ type: "error", message: "รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setFeedback({ type: "error", message: "รหัสผ่านใหม่และรหัสผ่านยืนยันไม่ตรงกัน" });
      return;
    }

    startTransition(async () => {
      const res = await changePasswordAction(oldPassword, newPassword, confirmPassword);
      if (res.success) {
        setFeedback({
          type: "success",
          message: res.message || "เปลี่ยนรหัสผ่านสำเร็จเรียบร้อยแล้ว",
        });
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setFeedback({
          type: "error",
          message: res.error || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน",
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        {/* Header แถบด้านบน */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-border">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-sm">
                {profile?.fullName ? profile.fullName.charAt(0) : "U"}
              </div>
              <div className="text-left">
                <DialogTitle className="text-lg font-bold text-foreground">
                  {profile?.fullName || "กำลังโหลด..."}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={roleInfo.badgeVariant} className="text-[10px] px-2 py-0.5">
                    {roleInfo.text}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{profile?.email}</span>
                </div>
              </div>
            </div>
            <DialogDescription className="sr-only">
              ข้อมูลบัญชีผู้ใช้งานและการเปลี่ยนรหัสผ่าน
            </DialogDescription>
          </DialogHeader>

          {/* Tab Selector */}
          <div className="flex items-center gap-2 mt-4 bg-muted/50 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setActiveTab("profile");
                setFeedback(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "profile"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>ข้อมูลบัญชี</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("password");
                setFeedback(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "password"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>เปลี่ยนรหัสผ่าน</span>
            </button>
          </div>
        </div>

        {/* เนื้อหาแท็บ */}
        <div className="p-6">
          {feedback && (
            <div
              className={`flex items-center gap-2 p-3 rounded-xl text-xs font-medium mb-4 animate-in fade-in ${
                feedback.type === "success"
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  : "bg-destructive/10 border border-destructive/20 text-destructive"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="space-y-4">
              {loadingProfile ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="text-xs">กำลังโหลดข้อมูลโปรไฟล์...</span>
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-card border border-border space-y-2">
                    <div className="flex justify-between items-center py-1 border-b border-border/50">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" /> อีเมล
                      </span>
                      <span className="font-medium text-foreground">{profile?.email}</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-border/50">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5" /> สิทธิ์การใช้งาน
                      </span>
                      <span className="font-semibold capitalize text-foreground">
                        {profile?.role}
                      </span>
                    </div>

                    {profile?.teacherInfo && (
                      <>
                        <div className="flex justify-between items-center py-1 border-b border-border/50">
                          <span className="text-muted-foreground flex items-center gap-1.5">
                            <School className="w-3.5 h-3.5" /> กลุ่มสาระ/แผนก
                          </span>
                          <span className="font-medium text-foreground">
                            {profile.teacherInfo.department}
                          </span>
                        </div>
                        {profile.teacherInfo.roomAdvisor && (
                          <div className="flex justify-between items-center py-1 border-b border-border/50">
                            <span className="text-muted-foreground">ครูประจำชั้น</span>
                            <span className="font-medium text-foreground">
                              ห้อง {profile.teacherInfo.roomAdvisor}
                            </span>
                          </div>
                        )}
                        {profile.teacherInfo.phone && (
                          <div className="flex justify-between items-center py-1">
                            <span className="text-muted-foreground flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5" /> เบอร์โทรศัพท์
                            </span>
                            <span className="font-medium text-foreground">
                              {formatPhoneNumber(profile.teacherInfo.phone)}
                            </span>
                          </div>
                        )}
                      </>
                    )}

                    {profile?.studentInfo && (
                      <>
                        <div className="flex justify-between items-center py-1 border-b border-border/50">
                          <span className="text-muted-foreground">รหัสนักเรียน</span>
                          <span className="font-semibold text-primary">
                            {profile.studentInfo.studentCode}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-border/50">
                          <span className="text-muted-foreground">ระดับชั้น / ห้องเรียน</span>
                          <span className="font-medium text-foreground">
                            {profile.studentInfo.gradeLevel}/{profile.studentInfo.classroom}
                          </span>
                        </div>
                        {profile.studentInfo.parentName && (
                          <div className="flex justify-between items-center py-1">
                            <span className="text-muted-foreground">ผู้ปกครอง</span>
                            <span className="font-medium text-foreground">
                              {profile.studentInfo.parentName}
                            </span>
                          </div>
                        )}
                      </>
                    )}

                    <div className="flex justify-between items-center py-1">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> บันทึกในระบบเมื่อ
                      </span>
                      <span className="text-muted-foreground">
                        {formatThaiDate(profile?.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 text-center">
                    <p className="text-[11px] text-muted-foreground">
                      ต้องการแก้ไขข้อมูลส่วนบุคคล กรุณาติดต่อฝ่ายธุรการหรือผู้ดูแลระบบ
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "password" && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="oldPassword" className="text-xs font-medium">
                  รหัสผ่านปัจจุบัน
                </Label>
                <div className="relative">
                  <Input
                    id="oldPassword"
                    type={showOld ? "text" : "password"}
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pr-9 h-9 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOld(!showOld)}
                    className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground"
                    aria-label={showOld ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                  >
                    {showOld ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="newPassword" className="text-xs font-medium">
                  รหัสผ่านใหม่ (ขั้นต่ำ 6 ตัวอักษร)
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNew ? "text" : "password"}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="อย่างน้อย 6 ตัวอักษร"
                    className="pr-9 h-9 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground"
                    aria-label={showNew ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                  >
                    {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-medium">
                  ยืนยันรหัสผ่านใหม่อีกครั้ง
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="พิมพ์รหัสผ่านใหม่อีกครั้ง"
                    className="pr-9 h-9 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground"
                    aria-label={showConfirm ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                  >
                    {showConfirm ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full text-xs font-semibold h-9 shadow-xs gap-2"
              >
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isPending ? "กำลังตรวจสอบและบันทึก..." : "บันทึกรหัสผ่านใหม่"}</span>
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
