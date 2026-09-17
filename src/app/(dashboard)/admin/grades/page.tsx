import React from "react";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { grades, students, courses, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import {
  AdminGradesClient,
  AdminGradeRecord,
} from "@/components/grades/AdminGradesClient";
import { GradeDistributionData } from "@/components/grades/GradeDistributionChart";
import { HonorStudentItem } from "@/components/grades/HonorRollTable";
import { calculateGPA } from "@/lib/validations/grade";

export const metadata = {
  title: "ระบบบริหารจัดการผลการเรียนและทรานสคริปต์ | SMS School Portal",
  description: "ระบบบริหารจัดการผลการเรียน วิเคราะห์สัมฤทธิผลทางการศึกษา และจัดอันดับนักเรียนเรียนดี",
};

export default async function AdminGradesPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    redirect("/login");
  }

  // 1. ดึงรายการผลการเรียนทั้งหมด
  const rawGrades = await db
    .select({
      id: grades.id,
      studentId: grades.studentId,
      studentCode: students.studentCode,
      studentName: users.fullName,
      gradeLevel: students.gradeLevel,
      classroom: students.classroom,
      courseId: grades.courseId,
      courseCode: courses.courseCode,
      courseName: courses.courseName,
      credits: courses.credits,
      homeworkScore: grades.homeworkScore,
      midtermScore: grades.midtermScore,
      finalScore: grades.finalScore,
      totalScore: grades.totalScore,
      gradeLetter: grades.gradeLetter,
    })
    .from(grades)
    .innerJoin(students, eq(grades.studentId, students.id))
    .innerJoin(users, eq(students.userId, users.id))
    .innerJoin(courses, eq(grades.courseId, courses.id))
    .all();

  // 2. ดึงรายการวิชาทั้งหมดสำหรับ Filter
  const coursesList = await db
    .select({
      id: courses.id,
      courseCode: courses.courseCode,
      courseName: courses.courseName,
    })
    .from(courses)
    .all();

  // 3. รวมระดับชั้นทั้งหมดที่มีในผลการเรียน
  const gradeLevelsList = Array.from(
    new Set(rawGrades.map((g) => g.gradeLevel))
  ).sort();

  // 4. คำนวณการกระจายตัวของผลการเรียน 8 ระดับ
  const gradeLetters = ["4.0", "3.5", "3.0", "2.5", "2.0", "1.5", "1.0", "0"];
  const totalRecords = rawGrades.length;

  const gradeDistribution: GradeDistributionData[] = gradeLetters.map(
    (letter) => {
      const count = rawGrades.filter((g) => g.gradeLetter === letter).length;
      const percentage =
        totalRecords > 0 ? Math.round((count / totalRecords) * 100) : 0;
      return {
        gradeLetter: letter,
        count,
        percentage,
      };
    }
  );

  // 5. คำนวณ Honor Roll (จัดกลุ่มผลการเรียนตามนักเรียน)
  const studentMap = new Map<
    string,
    {
      id: string;
      studentCode: string;
      fullName: string;
      gradeLevel: string;
      classroom: string;
      items: Array<{ credits: number; gradeLetter: string }>;
    }
  >();

  for (const record of rawGrades) {
    if (!studentMap.has(record.studentId)) {
      studentMap.set(record.studentId, {
        id: record.studentId,
        studentCode: record.studentCode,
        fullName: record.studentName,
        gradeLevel: record.gradeLevel,
        classroom: record.classroom,
        items: [],
      });
    }

    studentMap.get(record.studentId)!.items.push({
      credits: record.credits,
      gradeLetter: record.gradeLetter,
    });
  }

  // คำนวณ GPA และจัดอันดับ
  const honorRollCalculated: Array<Omit<HonorStudentItem, "rank">> = [];

  studentMap.forEach((s) => {
    const { gpa, totalCredits } = calculateGPA(s.items);
    const grade4Count = s.items.filter((item) => item.gradeLetter === "4.0").length;

    honorRollCalculated.push({
      id: s.id,
      studentCode: s.studentCode,
      fullName: s.fullName,
      gradeLevel: s.gradeLevel,
      classroom: s.classroom,
      gpa,
      totalCredits,
      grade4Count,
    });
  });

  // เรียงลำดับตาม GPA จากสูงไปต่ำ ถ้า GPA เท่ากันให้เรียงตามจำนวนวิชาที่ได้เกรด 4.0
  honorRollCalculated.sort((a, b) => {
    if (b.gpa !== a.gpa) return b.gpa - a.gpa;
    return b.grade4Count - a.grade4Count;
  });

  const honorRoll: HonorStudentItem[] = honorRollCalculated.map(
    (item, index) => ({
      ...item,
      rank: index + 1,
    })
  );

  return (
    <AdminGradesClient
      initialGrades={rawGrades}
      gradeDistribution={gradeDistribution}
      honorRoll={honorRoll}
      coursesList={coursesList}
      gradeLevelsList={gradeLevelsList}
    />
  );
}
