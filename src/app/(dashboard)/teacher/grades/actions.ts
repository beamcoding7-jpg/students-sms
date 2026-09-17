"use server";

import { db } from "@/lib/db";
import { grades, enrollments, students, users, courses } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import {
  batchGradesSchema,
  BatchGradesValues,
  calculateGradeLetter,
} from "@/lib/validations/grade";

export type ActionResponse<T = undefined> = {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
};

export interface StudentGradeRow {
  studentId: string;
  studentCode: string;
  fullName: string;
  classroom: string;
  homeworkScore: number;
  midtermScore: number;
  finalScore: number;
  totalScore: number;
  gradeLetter: string;
  isExisting: boolean;
}

/**
 * ดึงรายชื่อนักเรียนที่ลงทะเบียนในวิชา พร้อมคะแนนและเกรดปัจจุบัน
 */
export async function getCourseGradesAction(
  courseId: string
): Promise<ActionResponse<{ students: StudentGradeRow[]; courseName: string; courseCode: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "teacher" && user.role !== "admin")) {
      return { success: false, error: "คุณไม่มีสิทธิ์ในการเข้าถึงข้อมูลคะแนน" };
    }

    // 1. ดึงข้อมูลรายวิชา
    const course = await db
      .select({
        id: courses.id,
        courseCode: courses.courseCode,
        courseName: courses.courseName,
      })
      .from(courses)
      .where(eq(courses.id, courseId))
      .get();

    if (!course) {
      return { success: false, error: "ไม่พบข้อมูลรายวิชานี้ในระบบ" };
    }

    // 2. ดึงนักเรียนที่ลงทะเบียนในวิชานี้
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
      .where(eq(enrollments.courseId, courseId))
      .orderBy(students.studentCode)
      .all();

    // 3. ดึงคะแนนเดิมที่มีในตาราง grades
    const existingGrades = await db
      .select({
        studentId: grades.studentId,
        homeworkScore: grades.homeworkScore,
        midtermScore: grades.midtermScore,
        finalScore: grades.finalScore,
        totalScore: grades.totalScore,
        gradeLetter: grades.gradeLetter,
      })
      .from(grades)
      .where(eq(grades.courseId, courseId))
      .all();

    const gradeMap = new Map<string, (typeof existingGrades)[0]>();
    for (const g of existingGrades) {
      gradeMap.set(g.studentId, g);
    }

    const rows: StudentGradeRow[] = enrolledStudents.map((s) => {
      const g = gradeMap.get(s.studentId);
      const hw = g ? g.homeworkScore : 0;
      const mid = g ? g.midtermScore : 0;
      const fin = g ? g.finalScore : 0;
      const tot = g ? g.totalScore : hw + mid + fin;
      const letter = g ? g.gradeLetter : calculateGradeLetter(tot);

      return {
        studentId: s.studentId,
        studentCode: s.studentCode,
        fullName: s.fullName,
        classroom: `${s.gradeLevel}/${s.classroom}`,
        homeworkScore: hw,
        midtermScore: mid,
        finalScore: fin,
        totalScore: tot,
        gradeLetter: letter,
        isExisting: Boolean(g),
      };
    });

    return {
      success: true,
      data: {
        students: rows,
        courseName: course.courseName,
        courseCode: course.courseCode,
      },
    };
  } catch (error) {
    console.error("Failed to get course grades:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการโหลดข้อมูลคะแนน" };
  }
}

/**
 * บันทึกคะแนนและคำนวณเกรดแบบ Batch Upsert ใน Transaction
 */
export async function saveCourseGradesAction(data: BatchGradesValues): Promise<ActionResponse> {
  const parseResult = batchGradesSchema.safeParse(data);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.errors[0]?.message || "ข้อมูลคะแนนไม่ถูกต้อง",
    };
  }

  const validData = parseResult.data;

  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "teacher" && user.role !== "admin")) {
      return { success: false, error: "คุณไม่มีสิทธิ์ในการบันทึกคะแนนและตัดเกรด" };
    }

    // ทำงานใน Transaction เพื่อความสมบูรณ์ของข้อมูล
    await db.transaction(async (tx) => {
      for (const rec of validData.records) {
        const totalScore = Math.round((rec.homeworkScore + rec.midtermScore + rec.finalScore) * 10) / 10;
        const gradeLetter = calculateGradeLetter(totalScore);

        // ตรวจสอบว่ามีแถวคะแนนเดิมอยู่แล้วหรือไม่
        const existing = await tx
          .select({ id: grades.id })
          .from(grades)
          .where(and(eq(grades.studentId, rec.studentId), eq(grades.courseId, validData.courseId)))
          .get();

        if (existing) {
          await tx
            .update(grades)
            .set({
              homeworkScore: rec.homeworkScore,
              midtermScore: rec.midtermScore,
              finalScore: rec.finalScore,
              totalScore,
              gradeLetter,
            })
            .where(eq(grades.id, existing.id));
        } else {
          const newId = `grd_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          await tx.insert(grades).values({
            id: newId,
            studentId: rec.studentId,
            courseId: validData.courseId,
            homeworkScore: rec.homeworkScore,
            midtermScore: rec.midtermScore,
            finalScore: rec.finalScore,
            totalScore,
            gradeLetter,
          });
        }
      }
    });

    revalidatePath("/teacher/grades");
    revalidatePath("/student/grades");
    revalidatePath("/admin/grades");

    return {
      success: true,
      message: `บันทึกคะแนนและตัดเกรดเรียบร้อยแล้ว (${validData.records.length} คน)`,
    };
  } catch (error) {
    console.error("Failed to save course grades:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการบันทึกคะแนนลงฐานข้อมูล" };
  }
}
