"use server";

import { authenticateUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export interface LoginActionState {
  error?: string;
  success?: boolean;
}

export async function loginAction(
  prevState: LoginActionState | null,
  formData: FormData
): Promise<LoginActionState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTarget = formData.get("redirect") as string;

  if (!email || !password) {
    return { error: "กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน" };
  }

  const result = await authenticateUser(email, password);

  if (!result.success || !result.user) {
    return { error: result.error || "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
  }

  // เข้าสู่ระบบสำเร็จ -> Redirect ไปยังหน้าที่ต้องการหรือ Dashboard ของบทบาทนั้น
  const destination = redirectTarget && redirectTarget.startsWith("/")
    ? redirectTarget
    : `/${result.user.role}`;

  redirect(destination);
}
