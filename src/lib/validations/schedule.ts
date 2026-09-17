import { z } from "zod";

/**
 * วันในสัปดาห์สำหรับจัดการตารางเรียน (จันทร์ – ศุกร์)
 */
export const dayOfWeekEnum = z.enum(["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์"], {
  errorMap: () => ({ message: "กรุณาเลือกวันในสัปดาห์ (จันทร์ - ศุกร์)" }),
});

export type DayOfWeek = z.infer<typeof dayOfWeekEnum>;

/**
 * Zod Schema สำหรับตรวจสอบข้อมูลคาบเรียนในตาราง
 */
export const scheduleSchema = z
  .object({
    courseId: z.string().min(1, "กรุณาเลือกรายวิชา"),
    classroom: z.string().min(1, "กรุณาระบุห้องเรียน (เช่น ม.4/1)"),
    dayOfWeek: dayOfWeekEnum,
    startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "รูปแบบเวลาต้องเป็น HH:MM (เช่น 08:30)"),
    endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "รูปแบบเวลาต้องเป็น HH:MM (เช่น 10:10)"),
    roomNumber: z.string().min(1, "กรุณาระบุห้องเรียน/สถานที่ (เช่น ห้อง 411)"),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "เวลาสิ้นสุดคาบเรียนต้องมากกว่าเวลาเริ่มต้น",
    path: ["endTime"],
  });

export type ScheduleFormValues = z.infer<typeof scheduleSchema>;
