import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import path from "path";

// รองรับทั้ง Turso Cloud Database (สำหรับ Deploy บน Vercel) และ Local SQLite (สำหรับพัฒนาในเครื่อง)
const dbPath = path.resolve(process.cwd(), "sqlite.db");
const url = process.env.TURSO_DATABASE_URL || `file:${dbPath}`;
const authToken = process.env.TURSO_AUTH_TOKEN;

export const client = createClient({
  url,
  authToken,
});

export const db = drizzle(client, { schema });
