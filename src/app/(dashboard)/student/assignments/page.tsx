import React from "react";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  students,
  enrollments,
  courses,
  assignments,
  submissions,
  teachers,
  users,
} from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import {
  StudentAssignmentsClient,
} from "@/components/assignments/StudentAssignmentsClient";
import { StudentAssignmentItem } from "@/components/assignments/SubmitAssignmentDialog";

export const metadata = {
  title: "การบ้านและภาระงานที่มอบหมาย | SMS School Portal",
  description: "ระบบติดตามการบ้าน ส่งงาน และตรวจสอบผลคะแนนประเมินสำหรับนักเรียน",
};

export default async function StudentAssignmentsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") {
    redirect("/login");
  }

  // 1. ดึงข้อมูลนักเรียน
  const studentRecord = await db
    .select({
      id: students.id,
      fullName: users.fullName,
    })
    .from(students)
    .innerJoin(users, eq(students.userId, users.id))
    .where(eq(students.userId, user.id))
    .get();

  if (!studentRecord) {
    redirect("/login");
  }

  // 2. ดึงวิชาที่นักเรียนลงทะเบียนเรียน
  const enrolledCourses = await db
    .select({
      courseId: courses.id,
      courseCode: courses.courseCode,
      courseName: courses.courseName,
      teacherName: users.fullName,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .leftJoin(teachers, eq(courses.teacherId, teachers.id))
    .leftJoin(users, eq(teachers.userId, users.id))
    .where(eq(enrollments.studentId, studentRecord.id))
    .all();

  const courseIds = enrolledCourses.map((c) => c.courseId);
  const courseMap = new Map<string, (typeof enrolledCourses)[0]>();
  for (const c of enrolledCourses) {
    courseMap.set(c.courseId, c);
  }

  // 3. ดึงการบ้านทั้งหมดของวิชาเหล่านี้
  let assignmentItems: StudentAssignmentItem[] = [];

  if (courseIds.length > 0) {
    const rawAssignments = await db
      .select({
        id: assignments.id,
        courseId: assignments.courseId,
        title: assignments.title,
        description: assignments.description,
        dueDate: assignments.dueDate,
        maxScore: assignments.maxScore,
        createdAt: assignments.createdAt,
      })
      .from(assignments)
      .orderBy(desc(assignments.dueDate))
      .all();

    // กรองเฉพาะวิชาที่นักเรียนลงทะเบียน
    const studentAssignments = rawAssignments.filter((a) =>
      courseMap.has(a.courseId)
    );

    // 4. ดึงงานที่นักเรียนคนนี้เคยส่ง
    const studentSubs = await db
      .select()
      .from(submissions)
      .where(eq(submissions.studentId, studentRecord.id))
      .all();

    const subMap = new Map<string, (typeof studentSubs)[0]>();
    for (const s of studentSubs) {
      subMap.set(s.assignmentId, s);
    }

    const todayStr = new Date().toISOString().split("T")[0];

    assignmentItems = studentAssignments.map((a) => {
      const c = courseMap.get(a.courseId)!;
      const sub = subMap.get(a.id);
      const isOverdue = todayStr > a.dueDate;

      return {
        id: a.id,
        courseCode: c.courseCode,
        courseName: c.courseName,
        teacherName: c.teacherName || "อ.สมชาย ทองดี",
        title: a.title,
        description: a.description,
        dueDate: a.dueDate,
        maxScore: a.maxScore,
        isOverdue,
        submission: sub
          ? {
              id: sub.id,
              content: sub.content,
              fileUrl: sub.fileUrl,
              score: sub.score,
              feedback: sub.feedback,
              status: sub.status as any,
              submittedAt: sub.submittedAt,
            }
          : null,
      };
    });
  }

  return (
    <StudentAssignmentsClient
      assignments={assignmentItems}
      studentName={studentRecord.fullName}
    />
  );
}
