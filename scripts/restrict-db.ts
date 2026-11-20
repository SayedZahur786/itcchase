import { neon } from "@neondatabase/serverless";
import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
const admin = process.env.DATABASE_URL_UNPOOLED;
if (!admin) throw new Error("Direct admin URL required");
const sql = neon(admin);
const password = randomBytes(32).toString("hex");
const roles =
  await sql`SELECT rolname FROM pg_roles WHERE rolname='itcchase_runtime'`;
if (!roles.length)
  await sql.query(`CREATE ROLE itcchase_runtime LOGIN PASSWORD '${password}'`);
else
  throw new Error(
    "Runtime role already exists; refusing to rotate implicitly.",
  );
await sql.query("GRANT CONNECT ON DATABASE neondb TO itcchase_runtime");
await sql.query("GRANT USAGE ON SCHEMA public TO itcchase_runtime");
await sql.query(
  "GRANT SELECT, INSERT, UPDATE, DELETE ON reports, rate_limits, events TO itcchase_runtime",
);
await sql.query("GRANT INSERT, DELETE ON support_requests TO itcchase_runtime");
await sql.query(
  "GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO itcchase_runtime",
);
const url = new URL(process.env.DATABASE_URL!);
url.username = "itcchase_runtime";
url.password = password;
const source = readFileSync(".env.local", "utf8")
  .split("\n")
  .filter((l) => !l.startsWith("DATABASE_URL="))
  .join("\n");
writeFileSync(
  ".env.local",
  source + "\nDATABASE_URL=" + JSON.stringify(url.toString()) + "\n",
  { mode: 0o600 },
);
console.log(
  "Restricted runtime role created; local pooled runtime URL updated.",
);
