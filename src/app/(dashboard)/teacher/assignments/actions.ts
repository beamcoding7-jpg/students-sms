"use server";

import { db } from "@/lib/db";
import {
  assignments,
  submissions,
  courses,
  students,
  users,
  enrollments,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import {
  assignmentSchema,
  AssignmentFormValues,
  gradeSubmissionSchema,
  GradeSubmissionFormValues,
} from "@/lib/validations/assignment";

export type ActionResponse<T = undefined> = {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
};

export interface StudentSubmissionDetail {
  studentId: string;
  studentCode: string;
  fullName: string;
  classroom: string;
  submissionId: string | null;
  content: string | null;
  fileUrl: string | null;
  score: number | null;
  feedback: string | null;
  status: "pending" | "submitted" | "graded" | "late";
  submittedAt: string | null;
}

/**
 * ครูสร้างการบ้านใหม่
 */
export async function createAssignmentAction(
  data: AssignmentFormValues
): Promise<ActionResponse<{ id: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "teacher" && user.role !== "admin")) {
      return { success: false, error: "คุณไม่มีสิทธิ์ในการมอบหมายการบ้าน" };
    }

    const validated = assignmentSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "ข้อมูลการบ้านไม่ถูกต้อง",
      };
    }

    const { courseId, title, description, dueDate, maxScore } = validated.data;
    const newId = `asg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();

    await db.insert(assignments).values({
      id: newId,
      courseId,
      title,
      description: description || null,
      dueDate,
      maxScore,
      createdBy: user.id,
      createdAt: nowIso,
    });

    revalidatePath("/teacher/assignments");
    revalidatePath("/student/assignments");
    revalidatePath("/teacher");
    revalidatePath("/student");

    return {
      success: true,
      message: "สร้างและมอบหมายการบ้านเรียบร้อยแล้ว",
      data: { id: newId },
    };
  } catch (error) {
    console.error("Failed to create assignment:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการสร้างการบ้าน" };
  }
}

/**
 * แก้ไขข้อมูลการบ้าน
 */
export async function updateAssignmentAction(
  id: string,
  data: AssignmentFormValues
): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "teacher" && user.role !== "admin")) {
      return { success: false, error: "คุณไม่มีสิทธิ์ในการแก้ไขการบ้าน" };
    }

    const validated = assignmentSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "ข้อมูลการบ้านไม่ถูกต้อง",
      };
    }

    const { courseId, title, description, dueDate, maxScore } = validated.data;

    await db
      .update(assignments)
      .set({
        courseId,
        title,
        description: description || null,
        dueDate,
        maxScore,
      })
      .where(eq(assignments.id, id));

    revalidatePath("/teacher/assignments");
    revalidatePath("/student/assignments");

    return {
      success: true,
      message: "แก้ไขการบ้านเรียบร้อยแล้ว",
    };
  } catch (error) {
    console.error("Failed to update assignment:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการแก้ไขการบ้าน" };
  }
}

/**
 * ลบการบ้าน
 */
export async function deleteAssignmentAction(id: string): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "teacher" && user.role !== "admin")) {
      return { success: false, error: "คุณไม่มีสิทธิ์ในการลบการบ้าน" };
    }

    await db.delete(assignments).where(eq(assignments.id, id));

    revalidatePath("/teacher/assignments");
    revalidatePath("/student/assignments");

    return {
      success: true,
      message: "ลบการบ้านเรียบร้อยแล้ว",
    };
  } catch (error) {
    console.error("Failed to delete assignment:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการลบการบ้าน" };
  }
}

/**
 * ดึงรายการส่งงานของนักเรียนในรายวิชาสำหรับการบ้านชิ้นนี้
 */
export async function getAssignmentSubmissionsAction(
  assignmentId: string
): Promise<ActionResponse<StudentSubmissionDetail[]>> {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "teacher" && user.role !== "admin")) {
      return { success: false, error: "คุณไม่มีสิทธิ์ในการเข้าถึงข้อมูลการส่งงาน" };
    }

    // 1. ดึงข้อมูลการบ้านเพื่อหารหัสวิชา
    const asg = await db
      .select({ courseId: assignments.courseId })
      .from(assignments)
      .where(eq(assignments.id, assignmentId))
      .get();

    if (!asg) {
      return { success: false, error: "ไม่พบข้อมูลการบ้านนี้ในระบบ" };
    }

    // 2. ดึงนักเรียนทั้งหมดที่ลงทะเบียนในวิชานี้
    const enrolledStudents = await db
      .select({
        studentId: students.id,
        studentCode: students.studentCode,
        fullName: users.fullName,
        gradeLevel: students.gradeLevel,
        classroom: students.classroom,
      })
      .from(enrollments)
      .innerJoin(students, eq(enrollments.studentId, students.id))
      .innerJoin(users, eq(students.userId, users.id))
      .where(eq(enrollments.courseId, asg.courseId))
      .orderBy(students.studentCode)
      .all();

    // 3. ดึงงานที่ส่งแล้วสำหรับการบ้านนี้
    const subList = await db
      .select()
      .from(submissions)
      .where(eq(submissions.assignmentId, assignmentId))
      .all();

    const subMap = new Map<string, (typeof subList)[0]>();
    for (const s of subList) {
      subMap.set(s.studentId, s);
    }

    const result: StudentSubmissionDetail[] = enrolledStudents.map((stu) => {
      const sub = subMap.get(stu.studentId);
      return {
        studentId: stu.studentId,
        studentCode: stu.studentCode,
        fullName: stu.fullName,
        classroom: `${stu.gradeLevel}/${stu.classroom}`,
        submissionId: sub?.id ?? null,
        content: sub?.content ?? null,
        fileUrl: sub?.fileUrl ?? null,
        score: sub?.score ?? null,
        feedback: sub?.feedback ?? null,
        status: (sub?.status ?? "pending") as any,
        submittedAt: sub?.submittedAt ?? null,
      };
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Failed to get submissions:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการโหลดข้อมูลการส่งงาน" };
  }
}

/**
 * ครูตรวจงาน ให้คะแนน และใส่ Feedback
 */
export async function gradeSubmissionAction(
  data: GradeSubmissionFormValues
): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "teacher" && user.role !== "admin")) {
      return { success: false, error: "คุณไม่มีสิทธิ์ในการตรวจงาน" };
    }

    const validated = gradeSubmissionSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "ข้อมูลการให้คะแนนไม่ถูกต้อง",
      };
    }

    const { submissionId, score, feedback } = validated.data;

    await db
      .update(submissions)
      .set({
        score,
        feedback: feedback || null,
        status: "graded",
      })
      .where(eq(submissions.id, submissionId));

    revalidatePath("/teacher/assignments");
    revalidatePath("/student/assignments");

    return {
      success: true,
      message: "บันทึกผลการตรวจและคะแนนเรียบร้อยแล้ว",
    };
  } catch (error) {
    console.error("Failed to grade submission:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการบันทึกคะแนน" };
  }
}
