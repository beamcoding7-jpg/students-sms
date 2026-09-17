import { z } from "zod";

export const courseSchema = z.object({
  courseCode: z.string().min(3, "รหัสวิชาต้องมีอย่างน้อย 3 ตัวอักษร เช่น ว31101"),
  courseName: z.string().min(3, "ชื่อวิชาต้องมีความยาวอย่างน้อย 3 ตัวอักษร เช่น วิทยาการคำนวณ 1"),
  credits: z.coerce
    .number({ invalid_type_error: "กรุณาระบุหน่วยกิตเป็นตัวเลข" })
    .min(0.5, "หน่วยกิตต่ำสุดคือ 0.5")
    .max(4.0, "หน่วยกิตสูงสุดคือ 4.0"),
  teacherId: z.string().optional().or(z.literal("")),
  gradeLevel: z.enum(["ม.4", "ม.5", "ม.6"], {
    errorMap: () => ({ message: "กรุณาเลือกระดับชั้น (ม.4, ม.5 หรือ ม.6)" }),
  }),
  semester: z.coerce
    .number()
    .int()
    .min(1, "ภาคเรียนต้องเป็น 1 หรือ 2")
    .max(2, "ภาคเรียนต้องเป็น 1 หรือ 2"),
  academicYear: z.string().regex(/^\d{4}$/, "ปีการศึกษาต้องเป็นตัวเลข 4 หลัก เช่น 2569"),
});

export type CourseFormValues = z.infer<typeof courseSchema>;
