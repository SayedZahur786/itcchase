import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { db, hash, owner, rateLimit, sameOrigin } from "@/lib/db";
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return NextResponse.json({ error: "Origin rejected." }, { status: 403 });
  if (!process.env.DATABASE_URL)
    return NextResponse.json(
      {
        error:
          "Live uploads are not available yet. Explore the sample reconciliation.",
      },
      { status: 503 },
    );
  try {
    if (
      !(await rateLimit(
        `session:${hash(process.env.VERCEL ? (request.headers.get("x-vercel-forwarded-for") ?? "unknown") : "local")}`,
        20,
      ))
    )
      return NextResponse.json(
        { error: "Too many sessions. Try again in an hour." },
        { status: 429 },
      );
    const response = NextResponse.json({ ready: true });
    if (!(await owner())) {
      const token = randomBytes(32).toString("hex");
      const sql = db();
      await sql.transaction([
        sql`DELETE FROM sessions WHERE expires_at<now()`,
        sql`INSERT INTO sessions(owner_hash) VALUES (${hash(token)})`,
      ]);
      response.cookies.set("itc_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }
    return response;
  } catch {
    return NextResponse.json(
      { error: "Storage is temporarily unavailable. Please retry later." },
      { status: 503 },
    );
  }
}
