import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import path from "path";
import fs from "fs";
import { INITIAL_DB_BASE64 } from "./initial-db";

let dbPath = path.resolve(process.cwd(), "sqlite.db");

// บน Vercel Serverless directory /var/task เป็น read-only filesystem
// ทำให้ SQLite ไม่สามารถสร้าง lock หรือ WAL file ได้ (Error: ConnectionFailed: 14)
// จึงนำ sqlite.db ไปไว้ที่ /tmp/sqlite.db ซึ่งเป็น filesystem ที่อ่าน-เขียนได้ใน AWS Lambda/Vercel
if (process.env.VERCEL && !process.env.TURSO_DATABASE_URL) {
  const tmpDbPath = path.join("/tmp", "sqlite.db");
  if (!fs.existsSync(tmpDbPath)) {
    let restored = false;
    const candidatePaths = [
      path.join(process.cwd(), "sqlite.db"),
      path.join("/var/task", "sqlite.db"),
      path.resolve("sqlite.db"),
    ];

    for (const candidate of candidatePaths) {
      if (fs.existsSync(candidate)) {
        try {
          fs.copyFileSync(candidate, tmpDbPath);
          restored = true;
          break;
        } catch (e) {
          console.error(`Failed to copy database from ${candidate} to ${tmpDbPath}:`, e);
        }
      }
    }

    // หากไม่พบไฟล์บน filesystem ให้กู้คืนฐานข้อมูลจาก INITIAL_DB_BASE64 ทันที
    if (!restored) {
      try {
        fs.writeFileSync(tmpDbPath, Buffer.from(INITIAL_DB_BASE64, "base64"));
        restored = true;
      } catch (e) {
        console.error("Failed to restore initial database from base64:", e);
      }
    }
  }
  dbPath = tmpDbPath;
}

const url = process.env.TURSO_DATABASE_URL || `file:${dbPath}`;
const authToken = process.env.TURSO_AUTH_TOKEN;

export const client = createClient({
  url,
  authToken,
});

export const db = drizzle(client, { schema });
