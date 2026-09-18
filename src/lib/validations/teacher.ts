import { z } from "zod";

// กลุ่มสาระการเรียนรู้มาตรฐานโรงเรียนไทย
export const departmentOptions = [
  "วิทยาศาสตร์และเทคโนโลยี",
  "คณิตศาสตร์",
  "ภาษาไทย",
  "ภาษาต่างประเทศ",
  "สังคมศึกษา ศาสนา และวัฒนธรรม",
  "สุขศึกษาและพลศึกษา",
  "ศิลปะ",
  "การงานอาชีพ",
] as const;

export const teacherSchema = z.object({
  fullName: z.string().min(3, "ชื่อ-นามสกุลต้องมีความยาวอย่างน้อย 3 ตัวอักษร"),
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง (เช่น somchai.t@wstr.ac.th)"),
  department: z.string().min(1, "กรุณาเลือกกลุ่มสาระการเรียนรู้"),
  phone: z
    .string()
    .regex(/^0\d{1,2}-?\d{3}-?\d{4}$/, "รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง เช่น 081-234-5671")
    .optional()
    .or(z.literal("")),
  roomAdvisor: z.string().optional().or(z.literal("")), // เช่น "ม.4/1" หรือ ""
});

export type TeacherFormValues = z.infer<typeof teacherSchema>;
