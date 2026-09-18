"use client";

import React, { useState, useEffect, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction, LoginActionState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { School, Lock, Mail, Eye, EyeOff, AlertCircle, HelpCircle } from "lucide-react";
import { SCHOOL_CONFIG } from "@/config/school";
import { SchoolSupportDialog } from "@/components/auth/SchoolSupportDialog";

const REMEMBER_EMAIL_KEY = "sms_remembered_email";

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") || "";

  const [state, formAction, isPending] = useActionState<LoginActionState | null, FormData>(
    loginAction,
    null
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  // โหลดอีเมลที่เคยจำไว้ในเบราว์เซอร์
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY);
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    } catch {
      // Ignored in environments where localStorage is restricted
    }
  }, []);

  // บันทึกหรือล้างอีเมลที่จำไว้เมื่อส่งฟอร์ม
  const handleRememberEmail = () => {
    try {
      if (rememberMe && email) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, email);
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY);
      }
    } catch {
      // Ignored
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <Card className="border-border shadow-2xl backdrop-blur bg-card/95">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner mb-2">
            <School className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            เข้าสู่ระบบสถานศึกษา
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {SCHOOL_CONFIG.name} ({SCHOOL_CONFIG.systemName})
          </CardDescription>
        </CardHeader>

        <form
          action={(formData) => {
            handleRememberEmail();
            formAction(formData);
          }}
        >
          <input type="hidden" name="redirect" value={redirectParam} />

          <CardContent className="space-y-4">
            {state?.error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{state.error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                อีเมลประจำตัว (Email)
              </Label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="name@school.ac.th"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  รหัสผ่าน (Password)
                </Label>
                <button
                  type="button"
                  onClick={() => setIsSupportOpen(true)}
                  className="text-xs text-primary hover:underline font-medium cursor-pointer"
                >
                  ลืมรหัสผ่าน?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground cursor-pointer"
                  aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* จดจำอีเมลผู้ใช้งาน (Remember Me) */}
            <div className="flex items-center space-x-2 pt-1">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer accent-primary"
              />
              <Label htmlFor="rememberMe" className="text-xs text-muted-foreground cursor-pointer select-none">
                จดจำอีเมลบนอุปกรณ์นี้
              </Label>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full text-base font-semibold shadow-md cursor-pointer"
              size="lg"
            >
              {isPending ? "กำลังตรวจสอบสิทธิ์..." : "เข้าสู่ระบบ"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* แถบติดต่อสอบถามและช่วยเหลือสำหรับโรงเรียน */}
      <div className="flex items-center justify-center">
        <button
          type="button"
          onClick={() => setIsSupportOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5 text-primary" />
          <span>พบปัญหาในการเข้าสู่ระบบ หรือ ต้องการคำแนะนำ?</span>
        </button>
      </div>

      {/* Modal รายละเอียดการติดต่อฝ่ายทะเบียนและสารสนเทศ */}
      <SchoolSupportDialog
        open={isSupportOpen}
        onOpenChange={setIsSupportOpen}
      />
    </div>
  );
}
