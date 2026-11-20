import { neon } from "@neondatabase/serverless";
import assert from "node:assert/strict";
const base = process.env.TEST_URL || "http://localhost:3107";
const message =
  "ITCChase automated support-path verification. Synthetic request; no reply needed.";
const response = await fetch(base + "/api/support", {
  method: "POST",
  headers: { origin: base, "content-type": "application/json" },
  body: JSON.stringify({ email: "validation@itcchase.invalid", message }),
});
assert.equal(response.status, 200);
const sql = neon(process.env.DATABASE_URL_UNPOOLED!);
const rows =
  await sql`SELECT id FROM support_requests WHERE message=${message}`;
assert.ok(rows.length > 0);
await sql`DELETE FROM support_requests WHERE message=${message}`;
console.log(
  "PASS: support request saved privately and synthetic verification record removed.",
);
