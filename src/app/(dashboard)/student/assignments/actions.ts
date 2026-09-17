"use server";

import { db } from "@/lib/db";
import { assignments, submissions, students, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { submissionSchema, SubmissionFormValues } from "@/lib/validations/assignment";

export type ActionResponse<T = undefined> = {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
};

/**
 * นักเรียนส่งงาน / อัปเดตงานที่ส่ง
 */
export async function submitAssignmentAction(
  data: SubmissionFormValues
): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "student") {
      return { success: false, error: "เฉพาะนักเรียนเท่านั้นที่มีสิทธิ์ส่งงาน" };
    }

    const validated = submissionSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "ข้อมูลการส่งงานไม่ถูกต้อง",
      };
    }

    const { assignmentId, content, fileUrl } = validated.data;

    // ดึง studentId จาก userId
    const studentRecord = await db
      .select({ id: students.id })
      .from(students)
      .where(eq(students.userId, user.id))
      .get();

    if (!studentRecord) {
      return { success: false, error: "ไม่พบข้อมูลนักเรียนในระบบ" };
    }

    // ดึงข้อมูลการบ้านเพื่อตรวจกำหนดส่ง
    const asg = await db
      .select({ dueDate: assignments.dueDate })
      .from(assignments)
      .where(eq(assignments.id, assignmentId))
      .get();

    if (!asg) {
      return { success: false, error: "ไม่พบข้อมูลการบ้านนี้" };
    }

    const now = new Date();
    const nowIso = now.toISOString();
    const todayStr = nowIso.split("T")[0];

    // ตรวจสอบว่าส่งช้ากว่ากำหนดหรือไม่
    const isLate = todayStr > asg.dueDate;
    const initialStatus = isLate ? "late" : "submitted";

    // ตรวจว่าเคยส่งงานนี้แล้วหรือไม่
    const existing = await db
      .select({ id: submissions.id, status: submissions.status })
      .from(submissions)
      .where(
        and(
          eq(submissions.assignmentId, assignmentId),
          eq(submissions.studentId, studentRecord.id)
        )
      )
      .get();

    if (existing) {
      // ถ้าเคยตรวจให้คะแนนแล้ว ห้ามส่งซ้ำ
      if (existing.status === "graded") {
        return {
          success: false,
          error: "งานนี้ได้รับการตรวจและบันทึกคะแนนแล้ว ไม่สามารถแก้ไขได้",
        };
      }

      await db
        .update(submissions)
        .set({
          content,
          fileUrl: fileUrl || null,
          status: initialStatus,
          submittedAt: nowIso,
        })
        .where(eq(submissions.id, existing.id));
    } else {
      const newId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await db.insert(submissions).values({
        id: newId,
        assignmentId,
        studentId: studentRecord.id,
        content,
        fileUrl: fileUrl || null,
        status: initialStatus,
        submittedAt: nowIso,
      });
    }

    revalidatePath("/student/assignments");
    revalidatePath("/teacher/assignments");
    revalidatePath("/student");
    revalidatePath("/teacher");

    return {
      success: true,
      message: isLate ? "ส่งงานเรียบร้อยแล้ว (ส่งช้ากว่ากำหนด)" : "ส่งงานเรียบร้อยแล้ว",
    };
  } catch (error) {
    console.error("Failed to submit assignment:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการส่งงาน" };
  }
}
