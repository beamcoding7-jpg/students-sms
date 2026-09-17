import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { courses, teachers, users, enrollments, students } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { CourseDetailClient, EnrolledStudent } from "@/components/courses/CourseDetailClient";

interface CourseDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: CourseDetailPageProps) {
  const { id } = await params;
  const course = await db
    .select({ courseCode: courses.courseCode, courseName: courses.courseName })
    .from(courses)
    .where(eq(courses.id, id))
    .get();

  if (!course) return { title: "ไม่พบรายวิชา | SMS School Portal" };

  return {
    title: `${course.courseCode} ${course.courseName} | SMS School Portal`,
    description: `ข้อมูลและรายชื่อนักเรียนที่ลงทะเบียนเรียนในวิชา ${course.courseName}`,
  };
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { id } = await params;

  // 1. ดึงข้อมูลรายวิชาพร้อมครูผู้สอน
  const rawCourse = await db
    .select({
      id: courses.id,
      courseCode: courses.courseCode,
      courseName: courses.courseName,
      credits: courses.credits,
      gradeLevel: courses.gradeLevel,
      semester: courses.semester,
      academicYear: courses.academicYear,
      teacherId: courses.teacherId,
      teacherDept: teachers.department,
      teacherPhone: teachers.phone,
      teacherName: users.fullName,
      teacherEmail: users.email,
    })
    .from(courses)
    .leftJoin(teachers, eq(courses.teacherId, teachers.id))
    .leftJoin(users, eq(teachers.userId, users.id))
    .where(eq(courses.id, id))
    .get();

  if (!rawCourse) {
    notFound();
  }

  // 2. ดึงรายชื่อนักเรียนที่ลงทะเบียนในวิชานี้
  const rawEnrollments = await db
    .select({
      enrollmentId: enrollments.id,
      studentId: students.id,
      studentCode: students.studentCode,
      fullName: users.fullName,
      gradeLevel: students.gradeLevel,
      classroom: students.classroom,
      parentName: students.parentName,
      parentPhone: students.parentPhone,
    })
    .from(enrollments)
    .innerJoin(students, eq(enrollments.studentId, students.id))
    .innerJoin(users, eq(students.userId, users.id))
    .where(eq(enrollments.courseId, id))
    .orderBy(desc(students.gradeLevel), students.classroom, students.studentCode)
    .all();

  const formattedCourse = {
    id: rawCourse.id,
    courseCode: rawCourse.courseCode,
    courseName: rawCourse.courseName,
    credits: rawCourse.credits,
    gradeLevel: rawCourse.gradeLevel,
    semester: rawCourse.semester,
    academicYear: rawCourse.academicYear,
  };

  const formattedTeacher = rawCourse.teacherId && rawCourse.teacherName
    ? {
        id: rawCourse.teacherId,
        fullName: rawCourse.teacherName,
        email: rawCourse.teacherEmail || "",
        department: rawCourse.teacherDept || "",
        phone: rawCourse.teacherPhone || null,
      }
    : null;

  const formattedEnrollments: EnrolledStudent[] = rawEnrollments.map((e) => ({
    enrollmentId: e.enrollmentId,
    studentId: e.studentId,
    studentCode: e.studentCode,
    fullName: e.fullName,
    gradeLevel: e.gradeLevel,
    classroom: e.classroom,
    parentName: e.parentName,
    parentPhone: e.parentPhone,
  }));

  return (
    <CourseDetailClient
      course={formattedCourse}
      teacher={formattedTeacher}
      enrolledStudents={formattedEnrollments}
    />
  );
}
