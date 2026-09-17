import React from "react";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  students,
  courses,
  grades,
  enrollments,
  teachers,
  users,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import {
  StudentGradesClient,
  StudentCourseGradeItem,
} from "@/components/grades/StudentGradesClient";
import { calculateGPA } from "@/lib/validations/grade";

export const metadata = {
  title: "ผลการเรียนและทรานสคริปต์ | SMS School Portal",
  description: "ระบบตรวจสอบผลการเรียนรายวิชา เกรดเฉลี่ย (GPA) และใบแสดงผลการเรียนอย่างเป็นทางการ",
};

export default async function StudentGradesPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") {
    redirect("/login");
  }

  // 1. ดึงข้อมูลนักเรียนจาก userId
  const studentRecord = await db
    .select({
      id: students.id,
      studentCode: students.studentCode,
      nationalId: students.nationalId,
      gradeLevel: students.gradeLevel,
      classroom: students.classroom,
      fullName: users.fullName,
    })
    .from(students)
    .innerJoin(users, eq(students.userId, users.id))
    .where(eq(students.userId, user.id))
    .get();

  if (!studentRecord) {
    redirect("/login");
  }

  const classroomString = `${studentRecord.gradeLevel}/${studentRecord.classroom}`;

  // 2. ดึงข้อมูลครูที่ปรึกษาประจำห้อง (ถ้ามี)
  const advisorRecord = await db
    .select({
      fullName: users.fullName,
    })
    .from(teachers)
    .innerJoin(users, eq(teachers.userId, users.id))
    .where(eq(teachers.roomAdvisor, classroomString))
    .get();

  // 3. ดึงวิชาที่นักเรียนลงทะเบียนเรียน และ join กับผลคะแนนใน grades
  const rawEnrollments = await db
    .select({
      courseId: courses.id,
      courseCode: courses.courseCode,
      courseName: courses.courseName,
      credits: courses.credits,
      gradeLevel: courses.gradeLevel,
      semester: courses.semester,
      academicYear: courses.academicYear,
      gradeId: grades.id,
      homeworkScore: grades.homeworkScore,
      midtermScore: grades.midtermScore,
      finalScore: grades.finalScore,
      totalScore: grades.totalScore,
      gradeLetter: grades.gradeLetter,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .leftJoin(
      grades,
      and(
        eq(grades.studentId, studentRecord.id),
        eq(grades.courseId, courses.id)
      )
    )
    .where(eq(enrollments.studentId, studentRecord.id))
    .all();

  // จัดรูปแบบรายการวิชา
  const courseItems: StudentCourseGradeItem[] = rawEnrollments.map((item) => ({
    id: item.courseId,
    courseCode: item.courseCode,
    courseName: item.courseName,
    credits: item.credits,
    homeworkScore: item.homeworkScore ?? 0,
    midtermScore: item.midtermScore ?? 0,
    finalScore: item.finalScore ?? 0,
    totalScore: item.totalScore ?? 0,
    gradeLetter: item.gradeLetter ?? "0",
  }));

  // คำนวณ GPA จากวิชาทั้งหมด
  const { gpa, totalCredits, passedCredits } = calculateGPA(
    courseItems.map((c) => ({
      credits: c.credits,
      gradeLetter: c.gradeLetter,
    }))
  );

  const academicYear = rawEnrollments[0]?.academicYear ?? "2567";
  const semester = rawEnrollments[0]?.semester ?? 1;

  return (
    <StudentGradesClient
      studentName={studentRecord.fullName}
      studentCode={studentRecord.studentCode}
      nationalId={studentRecord.nationalId}
      classroom={classroomString}
      advisorName={advisorRecord?.fullName ?? "อ.สมศักดิ์ รักเรียน"}
      academicYear={academicYear}
      semester={semester}
      gpa={gpa}
      totalCredits={totalCredits}
      passedCredits={passedCredits}
      courses={courseItems}
    />
  );
}
