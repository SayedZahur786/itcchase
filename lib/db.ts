import "server-only";
import { neon } from "@neondatabase/serverless";
import { cookies } from "next/headers";
import { createHash } from "node:crypto";
import type { Report } from "./match";
export function db() {
  if (!process.env.DATABASE_URL) throw new Error("STORAGE_UNAVAILABLE");
  return neon(process.env.DATABASE_URL);
}
export const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export async function owner() {
  const token = (await cookies()).get("itc_session")?.value;
  return token && /^[a-f0-9]{64}$/.test(token) ? hash(token) : null;
}
export async function rateLimit(key: string, limit: number) {
  const sql = db();
  const rows =
    await sql`INSERT INTO rate_limits(key,count) VALUES (${key},1) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN rate_limits.window_start < now()-interval '1 hour' THEN 1 ELSE rate_limits.count+1 END, window_start=CASE WHEN rate_limits.window_start < now()-interval '1 hour' THEN now() ELSE rate_limits.window_start END RETURNING count`;
  return Number(rows[0].count) <= limit;
}
export async function getReports(): Promise<Report[]> {
  const id = await owner();
  if (!id || !process.env.DATABASE_URL) return [];
  const sql = db();
  const rows =
    await sql`SELECT data FROM reports WHERE owner_hash=${id} AND expires_at>now() ORDER BY created_at DESC LIMIT 100`;
  return rows.map((r) => r.data as Report);
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !!origin && origin === new URL(request.url).origin;
}
