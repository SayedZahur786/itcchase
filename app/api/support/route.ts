import { NextResponse } from "next/server";
import { db, hash, rateLimit, sameOrigin } from "@/lib/db";
import { z } from "zod";
const schema = z
  .object({
    email: z.email().max(254),
    message: z.string().trim().min(10).max(2000),
  })
  .strict();
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return NextResponse.json({ error: "Origin rejected." }, { status: 403 });
  const length = Number(request.headers.get("content-length"));
  if (!length || length > 10000)
    return NextResponse.json({ error: "Request too large." }, { status: 413 });
  try {
    if (
      !(await rateLimit(
        "support:" +
          hash(
            process.env.VERCEL
              ? (request.headers.get("x-vercel-forwarded-for") ?? "unknown")
              : "local",
          ),
        5,
      ))
    )
      return NextResponse.json(
        { error: "Please retry in an hour." },
        { status: 429 },
      );
    const result = schema.safeParse(await request.json());
    if (!result.success)
      return NextResponse.json(
        { error: "Enter a valid email and a message of 10–2,000 characters." },
        { status: 400 },
      );
    const sql = db();
    await sql`DELETE FROM support_requests WHERE created_at<now()-interval '30 days'`;
    await sql`INSERT INTO support_requests(email,message) VALUES (${result.data.email},${result.data.message})`;
    return NextResponse.json({ saved: true });
  } catch {
    return NextResponse.json(
      { error: "Support is temporarily unavailable. Please retry later." },
      { status: 503 },
    );
  }
}
