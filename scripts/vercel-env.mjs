import { spawnSync } from "node:child_process";
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL missing");
for (const [key, value] of [
  ["DATABASE_URL", process.env.DATABASE_URL],
  ["APP_URL", "https://itcchase.vercel.app"],
]) {
  const p = spawnSync("vercel", ["env", "add", key, "production"], {
    input: value,
    encoding: "utf8",
  });
  if (p.status !== 0) {
    console.error(`Unable to add ${key}; check Vercel project settings.`);
    process.exit(1);
  }
  console.log(`${key} configured in production.`);
}
