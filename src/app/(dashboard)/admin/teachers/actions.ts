"use server";

import { db, client } from "@/lib/db";
import { users, teachers, courses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { teacherSchema, TeacherFormValues } from "@/lib/validations/teacher";

export type ActionResponse = {
  success: boolean;
  error?: string;
};

/**
 * สร้างข้อมูลครูใหม่ พร้อมเปิดบัญชีเข้าสู่ระบบ (Atomic Transaction)
 */
export async function createTeacherAction(data: TeacherFormValues): Promise<ActionResponse> {
  const parseResult = teacherSchema.safeParse(data);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.errors[0]?.message || "ข้อมูลไม่ถูกต้อง",
    };
  }

  const validData = parseResult.data;

  try {
    // 1. ตรวจสอบความซ้ำซ้อนของอีเมล
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, validData.email.trim().toLowerCase()))
      .get();

    if (existingUser) {
      return { success: false, error: `อีเมล ${validData.email} มีการใช้งานแล้วในระบบ` };
    }

    // 2. Hash รหัสผ่านเริ่มต้น
    const defaultPasswordHash = await bcrypt.hash("password123", 10);
    const now = new Date().toISOString();
    const timestamp = Date.now();
    const userId = `usr_tch_${timestamp}`;
    const teacherId = `tch_${timestamp}`;

    // 3. บันทึกบัญชี User และข้อมูล Teacher (ใช้ Parameterized Queries)
    await client.execute({
      sql: "INSERT INTO users (id, email, password_hash, role, full_name, avatar_url, created_at) VALUES (?, ?, ?, 'teacher', ?, NULL, ?)",
      args: [userId, validData.email.trim().toLowerCase(), defaultPasswordHash, validData.fullName.trim(), now],
    });

    await client.execute({
      sql: "INSERT INTO teachers (id, user_id, department, phone, room_advisor) VALUES (?, ?, ?, ?, ?)",
      args: [
        teacherId,
        userId,
        validData.department.trim(),
        validData.phone?.trim() || null,
        validData.roomAdvisor?.trim() || null,
      ],
    });

    revalidatePath("/admin/teachers");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to create teacher:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการบันทึกข้อมูลครูลงฐานข้อมูล" };
  }
}

/**
 * แก้ไขข้อมูลคุณครู
 */
export async function updateTeacherAction(
  teacherId: string,
  data: TeacherFormValues
): Promise<ActionResponse> {
  const parseResult = teacherSchema.safeParse(data);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.errors[0]?.message || "ข้อมูลไม่ถูกต้อง",
    };
  }

  const validData = parseResult.data;

  try {
    const existingTeacher = await db
      .select({ id: teachers.id, userId: teachers.userId })
      .from(teachers)
      .where(eq(teachers.id, teacherId))
      .get();

    if (!existingTeacher) {
      return { success: false, error: "ไม่พบข้อมูลคุณครูในระบบ" };
    }

    // ตรวจสอบอีเมลซ้ำ (กรณีเปลี่ยนอีเมล)
    const duplicateEmail = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, validData.email.trim().toLowerCase()))
      .get();

    if (duplicateEmail && duplicateEmail.id !== existingTeacher.userId) {
      return { success: false, error: `อีเมล ${validData.email} ถูกใช้งานโดยผู้ใช้อื่นแล้ว` };
    }

    // อัปเดตตาราง users
    await client.execute({
      sql: "UPDATE users SET full_name = ?, email = ? WHERE id = ?",
      args: [validData.fullName.trim(), validData.email.trim().toLowerCase(), existingTeacher.userId],
    });

    // อัปเดตตาราง teachers
    await client.execute({
      sql: "UPDATE teachers SET department = ?, phone = ?, room_advisor = ? WHERE id = ?",
      args: [
        validData.department.trim(),
        validData.phone?.trim() || null,
        validData.roomAdvisor?.trim() || null,
        teacherId,
      ],
    });

    revalidatePath("/admin/teachers");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to update teacher:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการอัปเดตข้อมูลคุณครู" };
  }
}

/**
 * ลบข้อมูลคุณครู (ปลดการผูกวิชาสอนก่อนอย่างปลอดภัย)
 */
export async function deleteTeacherAction(teacherId: string): Promise<ActionResponse> {
  try {
    const existingTeacher = await db
      .select({ id: teachers.id, userId: teachers.userId })
      .from(teachers)
      .where(eq(teachers.id, teacherId))
      .get();

    if (!existingTeacher) {
      return { success: false, error: "ไม่พบข้อมูลคุณครูที่ต้องการลบ" };
    }

    // 1. ปลดครูผู้สอนในตาราง courses ให้เป็น NULL เพื่อไม่ให้วิชาสูญหาย
    await client.execute({
      sql: "UPDATE courses SET teacher_id = NULL WHERE teacher_id = ?",
      args: [teacherId],
    });

    // 2. ลบข้อมูลในตาราง teachers
    await client.execute({
      sql: "DELETE FROM teachers WHERE id = ?",
      args: [teacherId],
    });

    // 3. ลบข้อมูลผู้ใช้ในตาราง users
    await client.execute({
      sql: "DELETE FROM users WHERE id = ?",
      args: [existingTeacher.userId],
    });

    revalidatePath("/admin/teachers");
    revalidatePath("/admin/courses");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete teacher:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการลบข้อมูลคุณครู" };
  }
}
