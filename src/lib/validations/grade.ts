import { z } from "zod";

/**
 * Zod Schema สำหรับตรวจสอบคะแนนนักเรียนรายคน
 * คะแนนเก็บ: 0 - 50
 * คะแนนกลางภาค: 0 - 20
 * คะแนนปลายภาค: 0 - 30
 * รวมคะแนนเต็ม 100
 */
export const gradeScoreSchema = z.object({
  studentId: z.string().min(1, "ต้องระบุรหัสนักเรียน"),
  courseId: z.string().min(1, "ต้องระบุรหัสรายวิชา"),
  homeworkScore: z
    .number({ invalid_type_error: "คะแนนต้องเป็นตัวเลข" })
    .min(0, "คะแนนต่ำสุดคือ 0")
    .max(50, "คะแนนเก็บเต็ม 50 คะแนน"),
  midtermScore: z
    .number({ invalid_type_error: "คะแนนต้องเป็นตัวเลข" })
    .min(0, "คะแนนต่ำสุดคือ 0")
    .max(20, "คะแนนกลางภาคเต็ม 20 คะแนน"),
  finalScore: z
    .number({ invalid_type_error: "คะแนนต้องเป็นตัวเลข" })
    .min(0, "คะแนนต่ำสุดคือ 0")
    .max(30, "คะแนนปลายภาคเต็ม 30 คะแนน"),
});

export const batchGradesSchema = z.object({
  courseId: z.string().min(1, "ต้องระบุรหัสรายวิชา"),
  records: z.array(gradeScoreSchema).min(1, "ต้องมีรายชื่อนักเรียนอย่างน้อย 1 คน"),
});

export type GradeScoreValues = z.infer<typeof gradeScoreSchema>;
export type BatchGradesValues = z.infer<typeof batchGradesSchema>;

/**
 * ตัดเกรดอัตโนมัติตามเกณฑ์มาตรฐานสถานศึกษาไทย 8 ระดับ (0 - 4.0)
 */
export function calculateGradeLetter(totalScore: number): string {
  const rounded = Math.round(totalScore * 10) / 10;
  if (rounded >= 80) return "4.0";
  if (rounded >= 75) return "3.5";
  if (rounded >= 70) return "3.0";
  if (rounded >= 65) return "2.5";
  if (rounded >= 60) return "2.0";
  if (rounded >= 55) return "1.5";
  if (rounded >= 50) return "1.0";
  return "0";
}

/**
 * คำนวณเกรดเฉลี่ยถ่วงน้ำหนักตามหน่วยกิต (Weighted GPA)
 */
export function calculateGPA(
  items: Array<{ credits: number; gradeLetter: string }>
): { gpa: number; totalCredits: number; passedCredits: number } {
  let totalPoints = 0;
  let totalCredits = 0;
  let passedCredits = 0;

  for (const item of items) {
    const gradeNum = parseFloat(item.gradeLetter);
    if (!isNaN(gradeNum)) {
      totalPoints += item.credits * gradeNum;
      totalCredits += item.credits;
      if (gradeNum >= 1.0) {
        passedCredits += item.credits;
      }
    }
  }

  const gpa = totalCredits > 0 ? Math.round((totalPoints / totalCredits) * 100) / 100 : 0;
  return { gpa, totalCredits, passedCredits };
}
