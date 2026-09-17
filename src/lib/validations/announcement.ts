import { z } from "zod";

/**
 * หมวดหมู่ของประกาศข่าวสาร
 * academic = ข่าววิชาการ
 * activity = กิจกรรมโรงเรียน
 * general = ข่าวประชาสัมพันธ์ทั่วไป
 * urgent = ข่าวด่วนที่สุด
 */
export const announcementCategoryEnum = z.enum([
  "academic",
  "activity",
  "general",
  "urgent",
]);

export const announcementTargetRoleEnum = z.enum([
  "all",
  "teacher",
  "student",
]);

export const announcementSchema = z.object({
  title: z
    .string()
    .min(3, "หัวข้อประกาศต้องมีความยาวอย่างน้อย 3 ตัวอักษร")
    .max(200, "หัวข้อประกาศต้องไม่เกิน 200 ตัวอักษร"),
  content: z
    .string()
    .min(5, "เนื้อหาประกาศต้องมีความยาวอย่างน้อย 5 ตัวอักษร"),
  category: announcementCategoryEnum.default("general"),
  targetRole: announcementTargetRoleEnum.default("all"),
  isPinned: z.boolean().default(false),
});

export type AnnouncementFormValues = z.infer<typeof announcementSchema>;
