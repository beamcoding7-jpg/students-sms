"use server";

import { db } from "@/lib/db";
import { attendance, students, users, teachers } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { batchAttendanceSchema, BatchAttendanceValues } from "@/lib/validations/attendance";

export type ActionResponse<T = undefined> = {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
};

export interface ClassroomStudentAttendance {
  id: string; // studentId (std_xxx)
  studentCode: string;
  fullName: string;
  gradeLevel: string;
  classroom: string;
  parentName: string | null;
  parentPhone: string | null;
  status: "present" | "late" | "absent" | "leave";
  remarks: string;
  isExisting: boolean;
}

/**
 * ดึงรายชื่อนักเรียนในระดับชั้นและห้องเรียน พร้อมสถานะการเช็คชื่อเดิมในวันที่เลือก (ถ้ามี)
 */
export async function getAttendanceForDateAction(
  date: string,
  gradeLevel: string,
  classroom: string
): Promise<ActionResponse<{ students: ClassroomStudentAttendance[]; isAlreadyMarked: boolean }>> {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "teacher" && user.role !== "admin")) {
      return { success: false, error: "คุณไม่มีสิทธิ์ในการเข้าถึงข้อมูลการเช็คชื่อ" };
    }

    // 1. ดึงรายชื่อนักเรียนในห้องเรียนที่เลือก
    const roomStudents = await db
      .select({
        id: students.id,
        studentCode: students.studentCode,
        fullName: users.fullName,
        gradeLevel: students.gradeLevel,
        classroom: students.classroom,
        parentName: students.parentName,
        parentPhone: students.parentPhone,
      })
      .from(students)
      .innerJoin(users, eq(students.userId, users.id))
      .where(and(eq(students.gradeLevel, gradeLevel), eq(students.classroom, classroom)))
      .orderBy(students.studentCode)
      .all();

    if (roomStudents.length === 0) {
      return {
        success: true,
        data: {
          students: [],
          isAlreadyMarked: false,
        },
      };
    }

    const studentIds = roomStudents.map((s) => s.id);

    // 2. ดึงประวัติการเข้าเรียนในวันที่กำหนดของนักเรียนกลุ่มนี้
    const existingRecords = await db
      .select({
        studentId: attendance.studentId,
        status: attendance.status,
        remarks: attendance.remarks,
      })
      .from(attendance)
      .where(and(eq(attendance.date, date), inArray(attendance.studentId, studentIds)))
      .all();

    const recordMap = new Map<string, { status: "present" | "late" | "absent" | "leave"; remarks: string | null }>();
    for (const rec of existingRecords) {
      recordMap.set(rec.studentId, {
        status: rec.status as "present" | "late" | "absent" | "leave",
        remarks: rec.remarks,
      });
    }

    const isAlreadyMarked = existingRecords.length > 0;

    // 3. รวมข้อมูลนักเรียนกับสถานะเช็คชื่อ (ถ้ายังไม่เคยเช็คชื่อ ให้ค่าเริ่มต้นเป็น "present")
    const combined: ClassroomStudentAttendance[] = roomStudents.map((s) => {
      const existing = recordMap.get(s.id);
      return {
        id: s.id,
        studentCode: s.studentCode,
        fullName: s.fullName,
        gradeLevel: s.gradeLevel,
        classroom: s.classroom,
        parentName: s.parentName,
        parentPhone: s.parentPhone,
        status: existing ? existing.status : "present",
        remarks: existing?.remarks || "",
        isExisting: !!existing,
      };
    });

    return {
      success: true,
      data: {
        students: combined,
        isAlreadyMarked,
      },
    };
  } catch (error) {
    console.error("Failed to fetch attendance:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการโหลดข้อมูลการเข้าเรียน" };
  }
}

/**
 * บันทึกการเข้าเรียนแบบ Idempotent Batch Upsert
 * ลบข้อมูลเดิมของนักเรียนในรายการ ณ วันที่ดังกล่าว แล้วแทนที่ด้วยชุดใหม่
 */
export async function saveAttendanceAction(data: BatchAttendanceValues): Promise<ActionResponse> {
  const parseResult = batchAttendanceSchema.safeParse(data);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.errors[0]?.message || "ข้อมูลการเช็คชื่อไม่ถูกต้อง",
    };
  }

  const validData = parseResult.data;

  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "teacher" && user.role !== "admin")) {
      return { success: false, error: "คุณไม่มีสิทธิ์ในการบันทึกเวลาเรียน" };
    }

    const studentIds = validData.records.map((r) => r.studentId);

    // ใช้ Transaction เพื่อความสมบูรณ์ของข้อมูล (ACID)
    await db.transaction(async (tx) => {
      // 1. ลบข้อมูลเดิมเฉพาะของนักเรียนกลุ่มนี้ในวันที่ระบุ
      await tx
        .delete(attendance)
        .where(and(eq(attendance.date, validData.date), inArray(attendance.studentId, studentIds)));

      // 2. บันทึกข้อมูลสถานะล่าสุด
      for (const rec of validData.records) {
        const recordId = `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        await tx.insert(attendance).values({
          id: recordId,
          studentId: rec.studentId,
          date: validData.date,
          status: rec.status,
          remarks: rec.remarks?.trim() ? rec.remarks.trim() : null,
          markedBy: user.id,
        });
      }
    });

    // ล้าง Cache ในหน้าต่างๆ เพื่อให้อัปเดตทันที
    revalidatePath("/teacher/attendance");
    revalidatePath("/admin/attendance");
    revalidatePath("/student/attendance");

    return {
      success: true,
      message: `บันทึกข้อมูลการเข้าเรียนห้อง ${validData.gradeLevel}/${validData.classroom} เรียบร้อยแล้ว (${validData.records.length} คน)`,
    };
  } catch (error) {
    console.error("Failed to save attendance:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการบันทึกข้อมูลลงฐานข้อมูล" };
  }
}
