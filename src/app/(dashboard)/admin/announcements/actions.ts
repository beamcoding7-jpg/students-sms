"use server";

import { db } from "@/lib/db";
import { announcements, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import {
  announcementSchema,
  AnnouncementFormValues,
} from "@/lib/validations/announcement";

export type ActionResponse<T = undefined> = {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
};

/**
 * สร้างประกาศข่าวสารใหม่ (เฉพาะผู้ดูแลระบบ)
 */
export async function createAnnouncementAction(
  data: AnnouncementFormValues
): Promise<ActionResponse<{ id: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return { success: false, error: "คุณไม่มีสิทธิ์ในการสร้างประกาศข่าวสาร" };
    }

    const validated = announcementSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "ข้อมูลประกาศไม่ถูกต้อง",
      };
    }

    const { title, content, category, targetRole, isPinned } = validated.data;
    const newId = `anc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();

    await db.insert(announcements).values({
      id: newId,
      title,
      content,
      category,
      authorId: user.id,
      targetRole,
      isPinned: isPinned ? 1 : 0,
      createdAt: nowIso,
    });

    revalidatePath("/admin/announcements");
    revalidatePath("/admin");
    revalidatePath("/teacher");
    revalidatePath("/student");

    return {
      success: true,
      message: "สร้างประกาศข่าวสารเรียบร้อยแล้ว",
      data: { id: newId },
    };
  } catch (error) {
    console.error("Failed to create announcement:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการสร้างประกาศข่าวสาร" };
  }
}

/**
 * แก้ไขประกาศข่าวสาร
 */
export async function updateAnnouncementAction(
  id: string,
  data: AnnouncementFormValues
): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return { success: false, error: "คุณไม่มีสิทธิ์ในการแก้ไขประกาศข่าวสาร" };
    }

    const validated = announcementSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "ข้อมูลประกาศไม่ถูกต้อง",
      };
    }

    const { title, content, category, targetRole, isPinned } = validated.data;

    await db
      .update(announcements)
      .set({
        title,
        content,
        category,
        targetRole,
        isPinned: isPinned ? 1 : 0,
      })
      .where(eq(announcements.id, id));

    revalidatePath("/admin/announcements");
    revalidatePath("/admin");
    revalidatePath("/teacher");
    revalidatePath("/student");

    return {
      success: true,
      message: "แก้ไขประกาศข่าวสารเรียบร้อยแล้ว",
    };
  } catch (error) {
    console.error("Failed to update announcement:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการแก้ไขประกาศข่าวสาร" };
  }
}

/**
 * ลบประกาศข่าวสาร
 */
export async function deleteAnnouncementAction(id: string): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return { success: false, error: "คุณไม่มีสิทธิ์ในการลบประกาศข่าวสาร" };
    }

    await db.delete(announcements).where(eq(announcements.id, id));

    revalidatePath("/admin/announcements");
    revalidatePath("/admin");
    revalidatePath("/teacher");
    revalidatePath("/student");

    return {
      success: true,
      message: "ลบประกาศข่าวสารเรียบร้อยแล้ว",
    };
  } catch (error) {
    console.error("Failed to delete announcement:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการลบประกาศข่าวสาร" };
  }
}

/**
 * สลับสถานะปักหมุดข่าวสำคัญ (Toggle Pin)
 */
export async function togglePinAnnouncementAction(
  id: string,
  currentPinned: boolean
): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return { success: false, error: "คุณไม่มีสิทธิ์ในการจัดการการปักหมุด" };
    }

    await db
      .update(announcements)
      .set({
        isPinned: currentPinned ? 0 : 1,
      })
      .where(eq(announcements.id, id));

    revalidatePath("/admin/announcements");
    revalidatePath("/admin");
    revalidatePath("/teacher");
    revalidatePath("/student");

    return {
      success: true,
      message: currentPinned ? "ถอนหมุดประกาศเรียบร้อยแล้ว" : "ปักหมุดข่าวสำคัญแล้ว",
    };
  } catch (error) {
    console.error("Failed to toggle pin announcement:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการปักหมุดประกาศ" };
  }
}
