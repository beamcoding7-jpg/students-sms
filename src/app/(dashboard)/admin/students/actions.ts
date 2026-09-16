"use server";

import { db, client } from "@/lib/db";
import { users, students, courses, enrollments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { studentSchema, StudentFormValues } from "@/lib/validations/student";

export type ActionResponse = {
  success: boolean;
  error?: string;
};

/**
 * สร้างข้อมูลนักเรียนใหม่ พร้อมบัญชีเข้าสู่ระบบ (Atomic Transaction)
 */
export async function createStudentAction(data: StudentFormValues): Promise<ActionResponse> {
  const parseResult = studentSchema.safeParse(data);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.errors[0]?.message || "ข้อมูลไม่ถูกต้อง",
    };
  }

  const validData = parseResult.data;

  try {
    // 1. ตรวจสอบความซ้ำซ้อนของรหัสนักเรียน
    const existingStudent = await db
      .select({ id: students.id })
      .from(students)
      .where(eq(students.studentCode, validData.studentCode.trim()))
      .get();

    if (existingStudent) {
      return { success: false, error: `รหัสนักเรียน ${validData.studentCode} มีอยู่ในระบบแล้ว` };
    }

    // 2. ตรวจสอบความซ้ำซ้อนของอีเมล
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, validData.email.trim().toLowerCase()))
      .get();

    if (existingUser) {
      return { success: false, error: `อีเมล ${validData.email} มีการใช้งานแล้วในระบบ` };
    }

    // 3. Hash รหัสผ่านเริ่มต้น
    const defaultPasswordHash = await bcrypt.hash("password123", 10);
    const now = new Date().toISOString();
    const timestamp = Date.now();
    const userId = `usr_std_${timestamp}`;
    const studentId = `std_${timestamp}`;

    // 4. บันทึก User และ Student
    await client.executeMultiple(`
      INSERT INTO users (id, email, password_hash, role, full_name, avatar_url, created_at)
      VALUES ('${userId}', '${validData.email.trim().toLowerCase()}', '${defaultPasswordHash}', 'student', '${validData.fullName.trim()}', NULL, '${now}');

      INSERT INTO students (id, user_id, student_code, national_id, grade_level, classroom, date_of_birth, parent_name, parent_phone)
      VALUES ('${studentId}', '${userId}', '${validData.studentCode.trim()}', '${validData.nationalId?.trim() || ""}', '${validData.gradeLevel}', '${validData.classroom.trim()}', '${validData.dateOfBirth || ""}', '${validData.parentName?.trim() || ""}', '${validData.parentPhone?.trim() || ""}');
    `);

    // 5. ลงทะเบียนเรียนในวิชาของระดับชั้นนั้นโดยอัตโนมัติ
    const gradeCourses = await db
      .select({ id: courses.id })
      .from(courses)
      .where(eq(courses.gradeLevel, validData.gradeLevel))
      .all();

    for (const c of gradeCourses) {
      await db.insert(enrollments).values({
        id: `enr_${timestamp}_${c.id}`,
        studentId: studentId,
        courseId: c.id,
      });
    }

    revalidatePath("/admin/students");
    return { success: true };
  } catch (error) {
    console.error("Failed to create student:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการบันทึกข้อมูลลงฐานข้อมูล" };
  }
}

/**
 * แก้ไขข้อมูลนักเรียน
 */
export async function updateStudentAction(
  studentId: string,
  data: StudentFormValues
): Promise<ActionResponse> {
  const parseResult = studentSchema.safeParse(data);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.errors[0]?.message || "ข้อมูลไม่ถูกต้อง",
    };
  }

  const validData = parseResult.data;

  try {
    const student = await db.select().from(students).where(eq(students.id, studentId)).get();
    if (!student) {
      return { success: false, error: "ไม่พบข้อมูลนักเรียนที่ต้องการแก้ไข" };
    }

    // ตรวจสอบรหัสนักเรียนซ้ำ (กรณีเปลี่ยนรหัส)
    if (student.studentCode !== validData.studentCode) {
      const codeExist = await db
        .select({ id: students.id })
        .from(students)
        .where(eq(students.studentCode, validData.studentCode.trim()))
        .get();
      if (codeExist) {
        return { success: false, error: `รหัสนักเรียน ${validData.studentCode} ซ้ำกับนักเรียนท่านอื่น` };
      }
    }

    // อัปเดตข้อมูลนักเรียน
    await db
      .update(students)
      .set({
        studentCode: validData.studentCode.trim(),
        nationalId: validData.nationalId?.trim() || null,
        gradeLevel: validData.gradeLevel,
        classroom: validData.classroom.trim(),
        dateOfBirth: validData.dateOfBirth || null,
        parentName: validData.parentName?.trim() || null,
        parentPhone: validData.parentPhone?.trim() || null,
      })
      .where(eq(students.id, studentId));

    // อัปเดตข้อมูลผู้ใช้ (ชื่อและอีเมล)
    await db
      .update(users)
      .set({
        fullName: validData.fullName.trim(),
        email: validData.email.trim().toLowerCase(),
      })
      .where(eq(users.id, student.userId));

    revalidatePath("/admin/students");
    revalidatePath(`/admin/students/${studentId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update student:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" };
  }
}

/**
 * ลบข้อมูลนักเรียน (Cascading Delete ผ่าน users table)
 */
export async function deleteStudentAction(studentId: string): Promise<ActionResponse> {
  try {
    const student = await db.select().from(students).where(eq(students.id, studentId)).get();
    if (!student) {
      return { success: false, error: "ไม่พบข้อมูลนักเรียนที่ต้องการลบ" };
    }

    // ลบจากตาราง users ซึ่งจะ cascade ลบ student และข้อมูลที่เกี่ยวข้องทั้งหมด
    await db.delete(users).where(eq(users.id, student.userId));

    revalidatePath("/admin/students");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete student:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการลบข้อมูลนักเรียน" };
  }
}
