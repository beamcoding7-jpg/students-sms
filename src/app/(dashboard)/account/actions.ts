"use server";

import { db, client } from "@/lib/db";
import { users, teachers, students } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { getCurrentUser } from "@/lib/auth";

export interface UserProfileData {
  id: string;
  fullName: string;
  email: string;
  role: "admin" | "teacher" | "student";
  createdAt: string;
  // Specific role info
  teacherInfo?: {
    department: string;
    phone: string | null;
    roomAdvisor: string | null;
  } | null;
  studentInfo?: {
    studentCode: string;
    gradeLevel: string;
    classroom: string;
    parentName: string | null;
    parentPhone: string | null;
  } | null;
}

export type ActionResponse<T = undefined> = {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
};

/**
 * ดึงข้อมูลโปรไฟล์ของผู้ใช้ที่ล็อกอินอยู่
 */
export async function getUserProfileAction(): Promise<ActionResponse<UserProfileData>> {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return { success: false, error: "ไม่พบเซสชันการเข้าสู่ระบบ" };
    }

    const user = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, sessionUser.id))
      .get();

    if (!user) {
      return { success: false, error: "ไม่พบบัญชีผู้ใช้งานในระบบ" };
    }

    let teacherInfo = null;
    let studentInfo = null;

    if (user.role === "teacher") {
      const t = await db
        .select({
          department: teachers.department,
          phone: teachers.phone,
          roomAdvisor: teachers.roomAdvisor,
        })
        .from(teachers)
        .where(eq(teachers.userId, user.id))
        .get();
      if (t) teacherInfo = t;
    } else if (user.role === "student") {
      const s = await db
        .select({
          studentCode: students.studentCode,
          gradeLevel: students.gradeLevel,
          classroom: students.classroom,
          parentName: students.parentName,
          parentPhone: students.parentPhone,
        })
        .from(students)
        .where(eq(students.userId, user.id))
        .get();
      if (s) studentInfo = s;
    }

    return {
      success: true,
      data: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        teacherInfo,
        studentInfo,
      },
    };
  } catch (error) {
    console.error("Failed to get profile:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการโหลดข้อมูลโปรไฟล์" };
  }
}

/**
 * เปลี่ยนรหัสผ่านของผู้ใช้ปัจจุบัน
 */
export async function changePasswordAction(
  oldPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<ActionResponse> {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return { success: false, error: "กรุณาเข้าสู่ระบบก่อนเปลี่ยนรหัสผ่าน" };
    }

    if (!oldPassword || !newPassword || !confirmPassword) {
      return { success: false, error: "กรุณากรอกข้อมูลให้ครบทุกช่อง" };
    }

    if (newPassword.length < 6) {
      return { success: false, error: "รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร" };
    }

    if (newPassword !== confirmPassword) {
      return { success: false, error: "รหัสผ่านใหม่และรหัสผ่านยืนยันไม่ตรงกัน" };
    }

    // ตรวจสอบรหัสผ่านเดิม
    const user = await db
      .select({ id: users.id, passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.id, sessionUser.id))
      .get();

    if (!user) {
      return { success: false, error: "ไม่พบข้อมูลผู้ใช้งาน" };
    }

    const isOldMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isOldMatch) {
      return { success: false, error: "รหัสผ่านเดิมไม่ถูกต้อง โปรดตรวจสอบอีกครั้ง" };
    }

    // เข้ารหัสรหัสผ่านใหม่
    const newHash = await bcrypt.hash(newPassword, 10);

    await client.execute({
      sql: "UPDATE users SET password_hash = ? WHERE id = ?",
      args: [newHash, user.id],
    });

    return {
      success: true,
      message: "เปลี่ยนรหัสผ่านใหม่เรียบร้อยแล้ว",
    };
  } catch (error) {
    console.error("Failed to change password:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการบันทึกรหัสผ่านใหม่" };
  }
}
