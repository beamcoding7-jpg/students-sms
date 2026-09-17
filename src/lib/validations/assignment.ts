import { z } from "zod";

/**
 * Schema สำหรับครูสร้างหรือแก้ไขการบ้าน
 */
export const assignmentSchema = z.object({
  courseId: z.string().min(1, "กรุณาเลือกรหัสวิชา"),
  title: z
    .string()
    .min(3, "ชื่อการบ้านต้องมีความยาวอย่างน้อย 3 ตัวอักษร")
    .max(150, "ชื่อการบ้านต้องไม่เกิน 150 ตัวอักษร"),
  description: z.string().optional(),
  dueDate: z
    .string()
    .min(10, "กรุณาระบุวันครบกำหนดส่งให้ถูกต้อง (YYYY-MM-DD)"),
  maxScore: z
    .number({ invalid_type_error: "คะแนนเต็มต้องเป็นตัวเลข" })
    .min(1, "คะแนนเต็มต้องมีค่าอย่างน้อย 1 คะแนน")
    .max(100, "คะแนนเต็มต้องไม่เกิน 100 คะแนน")
    .default(10),
});

export type AssignmentFormValues = z.infer<typeof assignmentSchema>;

/**
 * Schema สำหรับนักเรียนส่งงาน
 */
export const submissionSchema = z.object({
  assignmentId: z.string().min(1, "ต้องระบุรหัสการบ้าน"),
  content: z
    .string()
    .min(1, "กรุณาระบุคำตอบหรือรายละเอียดงานที่ส่ง"),
  fileUrl: z
    .string()
    .url("กรุณากรอกลิงก์ผลงานในรูปแบบ URL ที่ถูกต้อง (เช่น https://...)")
    .optional()
    .or(z.literal("")),
});

export type SubmissionFormValues = z.infer<typeof submissionSchema>;

/**
 * Schema สำหรับครูตรวจงานและให้คะแนน
 */
export const gradeSubmissionSchema = z.object({
  submissionId: z.string().min(1, "ต้องระบุรหัสการส่งงาน"),
  score: z
    .number({ invalid_type_error: "คะแนนต้องเป็นตัวเลข" })
    .min(0, "คะแนนต้องไม่ต่ำกว่า 0"),
  feedback: z.string().optional(),
});

export type GradeSubmissionFormValues = z.infer<typeof gradeSubmissionSchema>;
