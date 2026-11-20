import { neon } from "@neondatabase/serverless";
import { createHash, randomBytes } from "node:crypto";
import assert from "node:assert/strict";
const base = "http://localhost:3107";
const sql = neon(process.env.DATABASE_URL!);
const token = randomBytes(32).toString("hex");
const id = createHash("sha256").update(token).digest("hex");
const headers = { origin: base, cookie: `itc_session=${token}` };
await sql`INSERT INTO rate_limits(key,count) VALUES (${`upload:${id}`},10)`;
let response = await fetch(base + "/api/reconcile", {
  method: "POST",
  headers: { ...headers, "x-forwarded-for": "203.0.113.20" },
  body: "bounded body",
});
assert.equal(response.status, 429);
response = await fetch(base + "/api/reconcile", {
  method: "POST",
  headers: { ...headers, "x-forwarded-for": "203.0.113.21" },
  body: "bounded body",
});
assert.equal(response.status, 429);
await sql`DELETE FROM rate_limits WHERE key=${`upload:${id}`}`;
const form = new FormData();
form.set("purchase", new Blob(["not a table"]), "bad.csv");
form.set("statement", new Blob(["not a table"]), "bad.csv");
response = await fetch(base + "/api/reconcile", {
  method: "POST",
  headers,
  body: form,
});
assert.equal(response.status, 400);
assert.match((await response.json()).error, /supported invoice table/);
response = await fetch(base + "/api/support", {
  method: "POST",
  headers: { origin: base, "content-type": "application/json" },
  body: JSON.stringify({ email: "invalid", message: "Short" }),
});
assert.equal(response.status, 400);
const role = await sql`SELECT current_user`;
assert.equal(role[0].current_user, "itcchase_runtime");
let denied = false;
try {
  await sql.query("CREATE TABLE forbidden_runtime_probe(id int)");
} catch {
  denied = true;
}
assert.equal(denied, true);
await sql`DELETE FROM rate_limits WHERE key=${`upload:${id}`}`;
console.log(
  "PASS: durable limit, spoofed-header resistance, malformed files, invalid support and runtime DDL denial.",
);
