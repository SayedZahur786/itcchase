import { neon } from "@neondatabase/serverless";
import { readFileSync, readdirSync } from "node:fs";
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
const sql = neon(process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL);
for (const file of readdirSync("migrations")
  .filter((f) => f.endsWith(".sql"))
  .sort())
  for (const statement of readFileSync("migrations/" + file, "utf8")
    .split(";")
    .filter((s) => s.trim()))
    await sql.query(statement);
const roles =
  await sql`SELECT rolname FROM pg_roles WHERE rolname='itcchase_runtime'`;
if (roles.length)
  await sql.query(
    "GRANT SELECT, INSERT, DELETE ON sessions TO itcchase_runtime",
  );
if (roles.length)
  await sql.query(
    "GRANT SELECT (created_at) ON support_requests TO itcchase_runtime",
  );
console.log("Migration applied.");
