import React from "react";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  teachers,
  courses,
  assignments,
  submissions,
  enrollments,
  users,
} from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import {
  TeacherAssignmentsClient,
} from "@/components/assignments/TeacherAssignmentsClient";
import {
  TeacherCourseOption,
  TeacherAssignmentItem,
} from "@/components/assignments/AssignmentFormDialog";

export const metadata = {
  title: "ระบบมอบหมายการบ้านและตรวจงาน | SMS School Portal",
  description: "ระบบบริหารจัดการการบ้าน มอบหมายงาน ตรวจสอบผลงาน และให้คะแนนนักเรียน",
};

export default async function TeacherAssignmentsPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    redirect("/login");
  }

  // 1. ดึงข้อมูลครู
  const teacherRecord = await db
    .select()
    .from(teachers)
    .where(eq(teachers.userId, user.id))
    .get();

  // ถ้าเป็น admin ให้ดึงวิชาทั้งหมด หรือถ้าเป็นครูให้ดึงเฉพาะวิชาที่ตนสอน
  const rawCourses = teacherRecord
    ? await db
        .select({
          id: courses.id,
          courseCode: courses.courseCode,
          courseName: courses.courseName,
        })
        .from(courses)
        .where(eq(courses.teacherId, teacherRecord.id))
        .all()
    : await db
        .select({
          id: courses.id,
          courseCode: courses.courseCode,
          courseName: courses.courseName,
        })
        .from(courses)
        .all();

  const coursesList: TeacherCourseOption[] = rawCourses.map((c) => ({
    id: c.id,
    courseCode: c.courseCode,
    courseName: c.courseName,
  }));

  // 2. ดึงการบ้านทั้งหมดของวิชาเหล่านี้
  const courseIds = coursesList.map((c) => c.id);

  let rawAssignments: any[] = [];
  if (courseIds.length > 0) {
    rawAssignments = await db
      .select({
        id: assignments.id,
        courseId: assignments.courseId,
        title: assignments.title,
        description: assignments.description,
        dueDate: assignments.dueDate,
        maxScore: assignments.maxScore,
        createdAt: assignments.createdAt,
        courseCode: courses.courseCode,
        courseName: courses.courseName,
      })
      .from(assignments)
      .innerJoin(courses, eq(assignments.courseId, courses.id))
      .orderBy(desc(assignments.createdAt))
      .all();
  }

  // 3. ดึงสถิตินักเรียนที่ลงทะเบียนเรียน และงานที่ส่ง
  const assignmentItems: TeacherAssignmentItem[] = await Promise.all(
    rawAssignments.map(async (asg) => {
      // นักเรียนทั้งหมดในวิชานี้
      const enrolled = await db
        .select({ studentId: enrollments.studentId })
        .from(enrollments)
        .where(eq(enrollments.courseId, asg.courseId))
        .all();

      // งานที่ส่งแล้ว
      const subs = await db
        .select({ status: submissions.status })
        .from(submissions)
        .where(eq(submissions.assignmentId, asg.id))
        .all();

      const totalStudents = enrolled.length;
      const submittedCount = subs.length;
      const gradedCount = subs.filter((s) => s.status === "graded").length;

      return {
        id: asg.id,
        courseId: asg.courseId,
        courseCode: asg.courseCode,
        courseName: asg.courseName,
        title: asg.title,
        description: asg.description,
        dueDate: asg.dueDate,
        maxScore: asg.maxScore,
        totalStudents,
        submittedCount,
        gradedCount,
        createdAt: asg.createdAt,
      };
    })
  );

  return (
    <TeacherAssignmentsClient
      courses={coursesList}
      initialAssignments={assignmentItems}
      teacherName={user.fullName}
    />
  );
}
