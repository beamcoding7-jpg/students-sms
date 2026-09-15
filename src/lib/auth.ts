import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";
import { encryptSession, decryptSession, SessionUser } from "./session";

export const SESSION_COOKIE_NAME = "sms_session";

/**
 * ตรวจสอบความถูกต้องของ Email และ Password และสร้าง Session Cookie
 */
export async function authenticateUser(email: string, passwordPlain: string): Promise<{ success: boolean; user?: SessionUser; error?: string }> {
  try {
    const user = await db.select().from(users).where(eq(users.email, email.trim().toLowerCase())).get();
    if (!user) {
      return { success: false, error: "ไม่พบบัญชีผู้ใช้งานนี้ในระบบ" };
    }

    const isMatch = await bcrypt.compare(passwordPlain, user.passwordHash);
    if (!isMatch) {
      return { success: false, error: "รหัสผ่านไม่ถูกต้อง โปรดลองใหม่อีกครั้ง" };
    }

    const sessionUser: SessionUser = {
      id: user.id,
      email: user.email,
      role: user.role as "admin" | "teacher" | "student",
      fullName: user.fullName,
    };

    // สร้าง Session Cookie
    const token = encryptSession(sessionUser);
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 วัน
      path: "/",
    });

    return { success: true, user: sessionUser };
  } catch (error) {
    console.error("Authentication error:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์" };
  }
}

/**
 * ดึงข้อมูลผู้ใช้งานปัจจุบันจาก Session Cookie
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie) return null;
    return decryptSession(sessionCookie.value);
  } catch {
    return null;
  }
}

/**
 * ออกจากระบบ (Logout) ลบ Session Cookie
 */
export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
