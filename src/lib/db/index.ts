import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import path from "path";

// สร้าง LibSQL Client ชี้ไปยังไฟล์ SQLite ท้องถิ่น (ฟรี 100% รันในเครื่อง)
const dbPath = path.resolve(process.cwd(), "sqlite.db");
export const client = createClient({
  url: `file:${dbPath}`,
});

export const db = drizzle(client, { schema });
