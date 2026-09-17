"use server";

import { db } from "@/lib/db";
import { schedules, courses, teachers, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { scheduleSchema, ScheduleFormValues } from "@/lib/validations/schedule";

export type ActionResponse<T = undefined> = {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
};

// ฟังก์ชันตรวจสอบช่วงเวลาซ้อนทับกัน (Time Overlap)
function isTimeOverlapping(startA: string, endA: string, startB: string, endB: string): boolean {
  return startA < endB && endA > startB;
}

/**
 * ฟังก์ชันตรวจสอบความขัดแย้ง 3 มิติ (Classroom, Teacher, Physical Room)
 */
async function checkScheduleConflict(
  data: ScheduleFormValues,
  excludeScheduleId?: string
): Promise<{ hasConflict: boolean; errorMessage?: string }> {
  // 1. ดึงข้อมูลวิชาที่จะเพิ่ม เพื่อทราบอาจารย์ผู้สอน
  const newCourse = await db
    .select({
      id: courses.id,
      courseCode: courses.courseCode,
      courseName: courses.courseName,
      teacherId: courses.teacherId,
    })
    .from(courses)
    .where(eq(courses.id, data.courseId))
    .get();

  if (!newCourse) {
    return { hasConflict: true, errorMessage: "ไม่พบข้อมูลรายวิชาที่เลือกในระบบ" };
  }

  // 2. ดึงคาบเรียนทั้งหมดในวันเดียวกัน
  const sameDaySchedules = await db
    .select({
      id: schedules.id,
      courseId: schedules.courseId,
      classroom: schedules.classroom,
      dayOfWeek: schedules.dayOfWeek,
      startTime: schedules.startTime,
      endTime: schedules.endTime,
      roomNumber: schedules.roomNumber,
      courseCode: courses.courseCode,
      courseName: courses.courseName,
      teacherId: courses.teacherId,
    })
    .from(schedules)
    .innerJoin(courses, eq(schedules.courseId, courses.id))
    .where(eq(schedules.dayOfWeek, data.dayOfWeek))
    .all();

  for (const existing of sameDaySchedules) {
    // ข้ามตัวเองกรณีเป็นการแก้ไข (Update)
    if (excludeScheduleId && existing.id === excludeScheduleId) {
      continue;
    }

    // ตรวจสอบว่าช่วงเวลาคาบเรียนซ้อนทับกันหรือไม่
    if (isTimeOverlapping(data.startTime, data.endTime, existing.startTime, existing.endTime)) {
      // ตรวจสอบที่ 1: ห้องเรียนเดียวกันมีเรียนวิชาอื่นอยู่แล้วหรือไม่
      if (existing.classroom.trim() === data.classroom.trim()) {
        return {
          hasConflict: true,
          errorMessage: `ห้องเรียน ${data.classroom} มีเรียนวิชา "${existing.courseCode} - ${existing.courseName}" ในช่วงเวลา ${existing.startTime} - ${existing.endTime} น. แล้ว`,
        };
      }

      // ตรวจสอบที่ 2: อาจารย์ผู้สอนมีคาบสอนห้องอื่นในช่วงเวลาดังกล่าวหรือไม่
      if (
        newCourse.teacherId &&
        existing.teacherId &&
        newCourse.teacherId === existing.teacherId
      ) {
        return {
          hasConflict: true,
          errorMessage: `อาจารย์ผู้สอนมีคาบสอนวิชา "${existing.courseCode}" ให้กับห้อง ${existing.classroom} ในช่วงเวลา ${existing.startTime} - ${existing.endTime} น. แล้ว`,
        };
      }

      // ตรวจสอบที่ 3: ห้องสถานที่กายภาพถูกใช้งานอยู่หรือไม่
      if (
        existing.roomNumber.trim().toLowerCase() === data.roomNumber.trim().toLowerCase()
      ) {
        return {
          hasConflict: true,
          errorMessage: `สถานที่/ห้อง "${data.roomNumber}" ถูกใช้งานโดยห้อง ${existing.classroom} (วิชา ${existing.courseCode}) ในช่วงเวลา ${existing.startTime} - ${existing.endTime} น. แล้ว`,
        };
      }
    }
  }

  return { hasConflict: false };
}

/**
 * สร้างคาบเรียนใหม่ พร้อมระบบตรวจสอบคาบชนกันอัตโนมัติ
 */
export async function createScheduleAction(data: ScheduleFormValues): Promise<ActionResponse> {
  const parseResult = scheduleSchema.safeParse(data);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.errors[0]?.message || "ข้อมูลคาบเรียนไม่ถูกต้อง",
    };
  }

  const validData = parseResult.data;

  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return { success: false, error: "เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถจัดตารางเรียนได้" };
    }

    // ตรวจสอบ Conflict 3 มิติ
    const conflict = await checkScheduleConflict(validData);
    if (conflict.hasConflict) {
      return { success: false, error: conflict.errorMessage };
    }

    const newId = `sch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    await db.insert(schedules).values({
      id: newId,
      courseId: validData.courseId,
      classroom: validData.classroom.trim(),
      dayOfWeek: validData.dayOfWeek,
      startTime: validData.startTime,
      endTime: validData.endTime,
      roomNumber: validData.roomNumber.trim(),
    });

    revalidatePath("/admin/schedules");
    revalidatePath("/teacher/schedule");
    revalidatePath("/student/timetable");

    return {
      success: true,
      message: `เพิ่มคาบเรียนห้อง ${validData.classroom} วัน${validData.dayOfWeek} (${validData.startTime} - ${validData.endTime} น.) เรียบร้อยแล้ว`,
    };
  } catch (error) {
    console.error("Failed to create schedule:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการบันทึกข้อมูลตารางเรียน" };
  }
}

/**
 * แก้ไขข้อมูลคาบเรียน พร้อมระบบตรวจสอบคาบชนกัน
 */
export async function updateScheduleAction(
  id: string,
  data: ScheduleFormValues
): Promise<ActionResponse> {
  const parseResult = scheduleSchema.safeParse(data);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.errors[0]?.message || "ข้อมูลคาบเรียนไม่ถูกต้อง",
    };
  }

  const validData = parseResult.data;

  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return { success: false, error: "เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถแก้ไขตารางเรียนได้" };
    }

    // ตรวจสอบ Conflict โดยไม่นับตัวเอง
    const conflict = await checkScheduleConflict(validData, id);
    if (conflict.hasConflict) {
      return { success: false, error: conflict.errorMessage };
    }

    await db
      .update(schedules)
      .set({
        courseId: validData.courseId,
        classroom: validData.classroom.trim(),
        dayOfWeek: validData.dayOfWeek,
        startTime: validData.startTime,
        endTime: validData.endTime,
        roomNumber: validData.roomNumber.trim(),
      })
      .where(eq(schedules.id, id));

    revalidatePath("/admin/schedules");
    revalidatePath("/teacher/schedule");
    revalidatePath("/student/timetable");

    return {
      success: true,
      message: "อัปเดตข้อมูลคาบเรียนเรียบร้อยแล้ว",
    };
  } catch (error) {
    console.error("Failed to update schedule:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการอัปเดตข้อมูลตารางเรียน" };
  }
}

/**
 * ลบคาบเรียนออกจากตาราง
 */
export async function deleteScheduleAction(id: string): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return { success: false, error: "เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถลบคาบเรียนได้" };
    }

    await db.delete(schedules).where(eq(schedules.id, id));

    revalidatePath("/admin/schedules");
    revalidatePath("/teacher/schedule");
    revalidatePath("/student/timetable");

    return {
      success: true,
      message: "ลบคาบเรียนออกจากตารางเรียบร้อยแล้ว",
    };
  } catch (error) {
    console.error("Failed to delete schedule:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการลบคาบเรียน" };
  }
}
