import crypto from "crypto";

export type UserRole = "admin" | "teacher" | "student";

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
}

const SESSION_SECRET = process.env.SESSION_SECRET || "students-sms-super-secret-key-change-in-prod";

/**
 * เข้ารหัสและ Sign ข้อมูลผู้ใช้เป็น Session Token
 */
export function encryptSession(user: SessionUser): string {
  const payload = JSON.stringify({ ...user, iat: Date.now() });
  const hmac = crypto.createHmac("sha256", SESSION_SECRET);
  hmac.update(payload);
  const signature = hmac.digest("base64url");
  const encodedPayload = Buffer.from(payload).toString("base64url");
  return `${encodedPayload}.${signature}`;
}

/**
 * ถอดรหัสและ Verify ลายเซ็นต์ของ Session Token
 */
export function decryptSession(token: string): SessionUser | null {
  try {
    const [encodedPayload, signature] = token.split(".");
    if (!encodedPayload || !signature) return null;

    const payload = Buffer.from(encodedPayload, "base64url").toString("utf-8");
    const hmac = crypto.createHmac("sha256", SESSION_SECRET);
    hmac.update(payload);
    const expectedSignature = hmac.digest("base64url");

    if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return JSON.parse(payload) as SessionUser;
    }
    return null;
  } catch {
    return null;
  }
}
