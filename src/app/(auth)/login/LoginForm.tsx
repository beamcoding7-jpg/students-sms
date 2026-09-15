"use client";

import React, { useState, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction, LoginActionState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { School, Lock, Mail, Eye, EyeOff, AlertCircle, Sparkles } from "lucide-react";

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

  // ฟังก์ชันช่วยเติมข้อมูลสำหรับทดสอบ (Quick Test Autofill)
  const setTestAccount = (testEmail: string) => {
    setEmail(testEmail);
    setPassword("password123");
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <Card className="border-border shadow-xl backdrop-blur bg-card/95">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner mb-2">
            <School className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            เข้าสู่ระบบโรงเรียน
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            School & Student Management System (SMS)
          </CardDescription>
        </CardHeader>

        <form action={formAction}>
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
              <Label htmlFor="password" className="text-sm font-medium">
                รหัสผ่าน (Password)
              </Label>
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
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full text-base font-semibold shadow-md"
              size="lg"
            >
              {isPending ? "กำลังตรวจสอบสิทธิ์..." : "เข้าสู่ระบบ"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* กล่องข้อมูลบัญชีสำหรับทดสอบระบบ (Seed Test Credentials Helper) */}
      <div className="p-4 rounded-xl border border-border bg-card/60 backdrop-blur text-xs space-y-2.5">
        <div className="flex items-center gap-1.5 font-semibold text-foreground">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>บัญชีจำลองสำหรับทดสอบระบบ (คลิกเพื่อกรอกอัตโนมัติ):</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          <button
            type="button"
            onClick={() => setTestAccount("admin@school.ac.th")}
            className="text-left p-2 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
          >
            <p className="font-bold text-foreground">ผู้ดูแลระบบ</p>
            <p className="text-[10px] text-muted-foreground truncate">admin@school.ac.th</p>
          </button>
          <button
            type="button"
            onClick={() => setTestAccount("somchai.t@school.ac.th")}
            className="text-left p-2 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
          >
            <p className="font-bold text-foreground">คุณครู</p>
            <p className="text-[10px] text-muted-foreground truncate">somchai.t@school.ac.th</p>
          </button>
          <button
            type="button"
            onClick={() => setTestAccount("somying.s@school.ac.th")}
            className="text-left p-2 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
          >
            <p className="font-bold text-foreground">นักเรียน</p>
            <p className="text-[10px] text-muted-foreground truncate">somying.s@school.ac.th</p>
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground text-center pt-1 border-t border-border">
          รหัสผ่านเริ่มต้นของทุกบัญชีคือ: <code className="px-1.5 py-0.5 rounded bg-muted font-mono font-bold text-foreground">password123</code>
        </p>
      </div>
    </div>
  );
}
