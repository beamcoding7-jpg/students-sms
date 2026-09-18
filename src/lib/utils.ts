import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * รวม ClassNames ของ Tailwind อย่างปลอดภัยและป้องกัน class conflict
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * แปลงเกรดตัวเลขเป็นข้อความและสีสถานะ
 */
export function getGradeBadge(grade: number | string) {
  const g = typeof grade === "string" ? parseFloat(grade) : grade;
  if (g >= 3.5) return { label: `${g.toFixed(1)} (ดีเยี่ยม)`, color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" };
  if (g >= 3.0) return { label: `${g.toFixed(1)} (ดี)`, color: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300" };
  if (g >= 2.0) return { label: `${g.toFixed(1)} (ปานกลาง)`, color: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" };
  if (g >= 1.0) return { label: `${g.toFixed(1)} (ผ่านเกณฑ์)`, color: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300" };
  return { label: `${g.toFixed(1)} (ไม่ผ่าน)`, color: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300" };
}

/**
 * แปลงสถานะการเช็คชื่อเป็นป้ายกำกับภาษาไทย
 */
export function getAttendanceStatus(status: "present" | "late" | "absent" | "leave") {
  switch (status) {
    case "present":
      return { label: "มาเรียน", color: "bg-emerald-500 text-white" };
    case "late":
      return { label: "มาสาย", color: "bg-amber-500 text-white" };
    case "leave":
      return { label: "ลา", color: "bg-blue-500 text-white" };
    case "absent":
      return { label: "ขาดเรียน", color: "bg-rose-500 text-white" };
  }
}

/**
 * จัดรูปแบบวันที่เป็นภาษาไทย พ.ศ. (เช่น "18 ก.ย. 2569" หรือรวมเวลา)
 */
export function formatThaiDate(dateInput: string | Date | null | undefined, includeTime = false): string {
  if (!dateInput) return "-";
  try {
    const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return String(dateInput);

    return d.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    });
  } catch {
    return String(dateInput);
  }
}

/**
 * จัดรูปแบบเบอร์โทรศัพท์ไทย (เช่น 081-234-5678)
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return "-";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 5)}-${cleaned.slice(5)}`;
  }
  return phone;
}

