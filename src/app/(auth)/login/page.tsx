import React, { Suspense } from "react";
import { LoginForm } from "./LoginForm";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-background via-muted/30 to-background px-4 py-6">
      {/* Top right: Theme Toggle */}
      <div className="flex justify-end max-w-5xl mx-auto w-full">
        <ThemeToggle />
      </div>

      {/* Main Form Center */}
      <div className="flex-1 flex items-center justify-center my-6">
        <Suspense fallback={<div className="text-center text-muted-foreground">กำลังโหลด...</div>}>
          <LoginForm />
        </Suspense>
      </div>

      {/* Footer copyright */}
      <footer className="text-center text-xs text-muted-foreground py-4">
        © 2569 โรงเรียนสาธิตวิทยาคม • School & Student Management System (SMS)
      </footer>
    </div>
  );
}
