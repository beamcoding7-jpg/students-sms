import React from "react";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { teachers, courses, enrollments, students, users, grades } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { TeacherGradebookClient } from "@/components/grades/TeacherGradebookClient";
import { StudentGradeRow } from "./actions";
import { calculateGradeLetter } from "@/lib/validations/grade";

export const metadata = {
  title: "บันทึกคะแนนและตัดเกรด | SMS School Portal",
  description: "ระบบบันทึกคะแนนสอบและคำนวณเกรดอัตโนมัติสำหรับคุณครู",
};

export default async function TeacherGradesPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    redirect("/login");
  }

  // 1. ดึงข้อมูลครูจาก userId
  const teacherRecord = await db
    .select()
    .from(teachers)
    .where(eq(teachers.userId, user.id))
    .get();

  if (!teacherRecord) {
    redirect("/login");
  }

  // 2. ดึงรายวิชาทั้งหมดที่ครูท่านนี้สอน
  const teacherCourses = await db
    .select({
      id: courses.id,
      courseCode: courses.courseCode,
      courseName: courses.courseName,
      credits: courses.credits,
    })
    .from(courses)
    .where(eq(courses.teacherId, teacherRecord.id))
    .orderBy(courses.courseCode)
    .all();

  if (teacherCourses.length === 0) {
    return (
      <div className="p-8 text-center space-y-2">
        <p className="font-bold text-lg text-foreground">ไม่พบรายวิชาที่ได้รับมอบหมายสอน</p>
        <p className="text-sm text-muted-foreground">
          กรุณาติดต่อผู้ดูแลระบบ (Admin) เพื่อกำหนดรายวิชาให้กับบัญชีของคุณ
        </p>
      </div>
    );
  }

  // 3. ตั้งต้นวิชาแรก
  const initialCourse = teacherCourses[0];

  // 4. ดึงนักเรียนที่ลงทะเบียนในวิชานี้
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
    .where(eq(enrollments.courseId, initialCourse.id))
    .orderBy(students.studentCode)
    .all();

  // 5. ดึงคะแนนเดิมจากตาราง grades
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
    .where(eq(grades.courseId, initialCourse.id))
    .all();

  const gradeMap = new Map<string, (typeof existingGrades)[0]>();
  for (const g of existingGrades) {
    gradeMap.set(g.studentId, g);
  }

  const initialRows: StudentGradeRow[] = enrolledStudents.map((s) => {
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

  return (
    <TeacherGradebookClient
      courses={teacherCourses}
      initialCourseId={initialCourse.id}
      initialStudents={initialRows}
      teacherName={user.fullName}
    />
  );
}
