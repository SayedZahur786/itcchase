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
console.log("Migration applied.");
