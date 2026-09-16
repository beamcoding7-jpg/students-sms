import { z } from "zod";

export const studentSchema = z.object({
  fullName: z.string().min(3, "ชื่อ-นามสกุลต้องมีความยาวอย่างน้อย 3 ตัวอักษร"),
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
  studentCode: z
    .string()
    .regex(/^STU-\d{4}$/, "รหัสนักเรียนต้องอยู่ในรูปแบบ STU-xxxx เช่น STU-1026"),
  nationalId: z
    .string()
    .regex(/^\d{13}$/, "เลขประจำตัวประชาชนต้องเป็นตัวเลข 13 หลัก")
    .optional()
    .or(z.literal("")),
  gradeLevel: z.enum(["ม.4", "ม.5", "ม.6"], {
    errorMap: () => ({ message: "กรุณาเลือกระดับชั้น (ม.4, ม.5 หรือ ม.6)" }),
  }),
  classroom: z.string().min(1, "กรุณาระบุห้องเรียน เช่น 1, 2"),
  dateOfBirth: z.string().optional().or(z.literal("")),
  parentName: z.string().optional().or(z.literal("")),
  parentPhone: z
    .string()
    .regex(/^0\d{1,2}-?\d{3}-?\d{4}$/, "รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง เช่น 081-234-5678")
    .optional()
    .or(z.literal("")),
});

export type StudentFormValues = z.infer<typeof studentSchema>;
