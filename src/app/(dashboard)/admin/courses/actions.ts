"use server";

import { db, client } from "@/lib/db";
import { courses, enrollments, students, schedules, grades, assignments, submissions } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { courseSchema, CourseFormValues } from "@/lib/validations/course";

export type ActionResponse = {
  success: boolean;
  error?: string;
  count?: number;
};

/**
 * สร้างรายวิชาใหม่
 */
export async function createCourseAction(data: CourseFormValues): Promise<ActionResponse> {
  const parseResult = courseSchema.safeParse(data);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.errors[0]?.message || "ข้อมูลไม่ถูกต้อง",
    };
  }

  const validData = parseResult.data;

  try {
    // 1. ตรวจสอบความซ้ำซ้อนของรหัสวิชา
    const existingCourse = await db
      .select({ id: courses.id })
      .from(courses)
      .where(eq(courses.courseCode, validData.courseCode.trim().toUpperCase()))
      .get();

    if (existingCourse) {
      return {
        success: false,
        error: `รหัสวิชา ${validData.courseCode.toUpperCase()} มีอยู่ในระบบแล้ว`,
      };
    }

    const timestamp = Date.now();
    const courseId = `crs_${timestamp}`;

    await client.execute({
      sql: `INSERT INTO courses (id, course_code, course_name, credits, teacher_id, grade_level, semester, academic_year) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        courseId,
        validData.courseCode.trim().toUpperCase(),
        validData.courseName.trim(),
        validData.credits,
        validData.teacherId?.trim() || null,
        validData.gradeLevel,
        validData.semester,
        validData.academicYear.trim(),
      ],
    });

    revalidatePath("/admin/courses");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to create course:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการบันทึกข้อมูลรายวิชา" };
  }
}

/**
 * แก้ไขข้อมูลรายวิชา
 */
export async function updateCourseAction(
  courseId: string,
  data: CourseFormValues
): Promise<ActionResponse> {
  const parseResult = courseSchema.safeParse(data);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.errors[0]?.message || "ข้อมูลไม่ถูกต้อง",
    };
  }

  const validData = parseResult.data;

  try {
    const existingCourse = await db
      .select({ id: courses.id, courseCode: courses.courseCode })
      .from(courses)
      .where(eq(courses.id, courseId))
      .get();

    if (!existingCourse) {
      return { success: false, error: "ไม่พบข้อมูลรายวิชานี้ในระบบ" };
    }

    // ตรวจสอบรหัสวิชาซ้ำ
    const duplicateCode = await db
      .select({ id: courses.id })
      .from(courses)
      .where(eq(courses.courseCode, validData.courseCode.trim().toUpperCase()))
      .get();

    if (duplicateCode && duplicateCode.id !== courseId) {
      return {
        success: false,
        error: `รหัสวิชา ${validData.courseCode.toUpperCase()} ถูกใช้งานโดยวิชาอื่นแล้ว`,
      };
    }

    await client.execute({
      sql: `UPDATE courses 
            SET course_code = ?, course_name = ?, credits = ?, teacher_id = ?, grade_level = ?, semester = ?, academic_year = ? 
            WHERE id = ?`,
      args: [
        validData.courseCode.trim().toUpperCase(),
        validData.courseName.trim(),
        validData.credits,
        validData.teacherId?.trim() || null,
        validData.gradeLevel,
        validData.semester,
        validData.academicYear.trim(),
        courseId,
      ],
    });

    revalidatePath("/admin/courses");
    revalidatePath(`/admin/courses/${courseId}`);
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to update course:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการอัปเดตข้อมูลรายวิชา" };
  }
}

/**
 * ลบข้อมูลรายวิชา (ตารางที่เชื่อมโยงจะถูก CASCADE ลบโดยอัตโนมัติตาม Foreign Key)
 */
export async function deleteCourseAction(courseId: string): Promise<ActionResponse> {
  try {
    const existingCourse = await db
      .select({ id: courses.id })
      .from(courses)
      .where(eq(courses.id, courseId))
      .get();

    if (!existingCourse) {
      return { success: false, error: "ไม่พบรายวิชาที่ต้องการลบ" };
    }

    // 1. ลบการบ้านและการส่งงานของวิชานี้
    const courseAssignments = await db
      .select({ id: assignments.id })
      .from(assignments)
      .where(eq(assignments.courseId, courseId))
      .all();
    const assignmentIds = courseAssignments.map((a) => a.id);

    if (assignmentIds.length > 0) {
      await db.delete(submissions).where(inArray(submissions.assignmentId, assignmentIds));
      await db.delete(assignments).where(eq(assignments.courseId, courseId));
    }

    // 2. ลบตารางเรียน (schedules), ผลการเรียน (grades), การลงทะเบียน (enrollments)
    await db.delete(schedules).where(eq(schedules.courseId, courseId));
    await db.delete(grades).where(eq(grades.courseId, courseId));
    await db.delete(enrollments).where(eq(enrollments.courseId, courseId));

    // 3. ลบรายวิชา
    await db.delete(courses).where(eq(courses.id, courseId));

    revalidatePath("/admin/courses");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete course:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการลบรายวิชา" };
  }
}

/**
 * ลงทะเบียนนักเรียนทั้งห้องเรียนเข้าสู่วิชานี้ (Classroom Bulk Enrollment)
 */
export async function enrollClassroomAction(
  courseId: string,
  gradeLevel: string,
  classroom: string
): Promise<ActionResponse> {
  try {
    // 1. ดึงนักเรียนทั้งหมดในระดับชั้นและห้องนั้น
    const roomStudents = await db
      .select({ id: students.id })
      .from(students)
      .where(and(eq(students.gradeLevel, gradeLevel), eq(students.classroom, classroom)))
      .all();

    if (roomStudents.length === 0) {
      return {
        success: false,
        error: `ไม่พบนักเรียนในชั้น ${gradeLevel} ห้อง ${classroom}`,
      };
    }

    // 2. ดึงนักเรียนที่ลงทะเบียนในวิชานี้อยู่แล้ว
    const existingEnrollments = await db
      .select({ studentId: enrollments.studentId })
      .from(enrollments)
      .where(eq(enrollments.courseId, courseId))
      .all();

    const enrolledSet = new Set(existingEnrollments.map((e) => e.studentId));

    // 3. กรองเฉพาะคนที่ยังไม่ได้ลงทะเบียน
    const toEnroll = roomStudents.filter((s) => !enrolledSet.has(s.id));

    if (toEnroll.length === 0) {
      return {
        success: false,
        error: `นักเรียนทุกคนในชั้น ${gradeLevel} ห้อง ${classroom} ได้ลงทะเบียนวิชานี้แล้ว`,
      };
    }

    // 4. บันทึกลงตาราง enrollments
    const now = Date.now();
    for (let i = 0; i < toEnroll.length; i++) {
      const s = toEnroll[i];
      await client.execute({
        sql: "INSERT INTO enrollments (id, student_id, course_id) VALUES (?, ?, ?)",
        args: [`enr_${now}_${i}`, s.id, courseId],
      });
    }

    revalidatePath(`/admin/courses/${courseId}`);
    revalidatePath("/admin/courses");
    return { success: true, count: toEnroll.length };
  } catch (error) {
    console.error("Failed to bulk enroll classroom:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการลงทะเบียนนักเรียนทั้งห้อง" };
  }
}

/**
 * ถอนการลงทะเบียนนักเรียนออกจากวิชา (Unenroll)
 */
export async function unenrollStudentAction(
  enrollmentId: string,
  courseId: string
): Promise<ActionResponse> {
  try {
    await client.execute({
      sql: "DELETE FROM enrollments WHERE id = ?",
      args: [enrollmentId],
    });

    revalidatePath(`/admin/courses/${courseId}`);
    revalidatePath("/admin/courses");
    return { success: true };
  } catch (error) {
    console.error("Failed to unenroll student:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการถอนรายวิชา" };
  }
}
