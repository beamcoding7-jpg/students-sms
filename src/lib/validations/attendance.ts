import { z } from "zod";

/**
 * นิยามสถานะการเข้าเรียน 4 รูปแบบ
 * present = มาเรียน
 * late = มาสาย
 * absent = ขาดเรียน
 * leave = ลา (ป่วย/กิจ)
 */
export const attendanceStatusEnum = z.enum(["present", "late", "absent", "leave"], {
  errorMap: () => ({ message: "สถานะการเข้าเรียนไม่ถูกต้อง" }),
});

export type AttendanceStatus = z.infer<typeof attendanceStatusEnum>;

/**
 * ข้อมูลการเข้าเรียนของนักเรียนแต่ละคน
 */
export const studentAttendanceRecordSchema = z.object({
  studentId: z.string().min(1, "ต้องระบุรหัสนักเรียน"),
  status: attendanceStatusEnum,
  remarks: z.string().optional().or(z.literal("")),
});

export type StudentAttendanceRecord = z.infer<typeof studentAttendanceRecordSchema>;

/**
 * ข้อมูลการบันทึกการเข้าเรียนแบบกลุ่มทั้งห้องเรียน (Batch Attendance)
 */
export const batchAttendanceSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "รูปแบบวันที่ต้องเป็น YYYY-MM-DD"),
  gradeLevel: z.string().min(1, "ต้องระบุระดับชั้น"),
  classroom: z.string().min(1, "ต้องระบุห้องเรียน"),
  records: z.array(studentAttendanceRecordSchema).min(1, "ต้องมีรายชื่อนักเรียนอย่างน้อย 1 คน"),
});

export type BatchAttendanceValues = z.infer<typeof batchAttendanceSchema>;
