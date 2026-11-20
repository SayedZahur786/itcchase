import { NextResponse } from "next/server";
import { db, owner, rateLimit, sameOrigin } from "@/lib/db";
import { parseInvoices } from "@/lib/parse";
import { demoInvoices } from "@/lib/demo";
import { reconcile } from "@/lib/match";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return NextResponse.json({ error: "Origin rejected." }, { status: 403 });
  if (!process.env.DATABASE_URL)
    return NextResponse.json(
      {
        error:
          "Live uploads need database setup. Use the sample to explore the workflow.",
      },
      { status: 503 },
    );
  const id = await owner();
  if (!id)
    return NextResponse.json(
      { error: "Start a new upload session." },
      { status: 401 },
    );
  const length = Number(request.headers.get("content-length"));
  if (!length || length > 4.3 * 1024 * 1024)
    return NextResponse.json(
      { error: "Combined upload must be below 4 MB." },
      { status: 413 },
    );
  try {
    if (!(await rateLimit(`upload:${id}`, 10)))
      return NextResponse.json(
        { error: "Hourly upload limit reached. Retry in one hour." },
        { status: 429 },
      );
  } catch {
    return NextResponse.json(
      { error: "Upload protection is unavailable. Retry later." },
      { status: 503 },
    );
  }
  let report;
  try {
    const form = await request.formData();
    const purchase = form.get("purchase");
    const statement = form.get("statement");
    if (!(purchase instanceof File) || !(statement instanceof File))
      throw new Error("Choose both purchase register and GSTR-2B files.");
    const purchases = parseInvoices(
      new Uint8Array(await purchase.arrayBuffer()),
      purchase.name,
    );
    const isDemo = JSON.stringify(purchases) === JSON.stringify(demoInvoices());
    report = reconcile(
      purchases,
      parseInvoices(
        new Uint8Array(await statement.arrayBuffer()),
        statement.name,
      ),
      isDemo,
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error && error.message.length < 240
            ? error.message
            : "Could not read these files. Use the supported templates.",
      },
      { status: 400 },
    );
  }
  try {
    const sql = db();
    await sql.transaction([
      sql`DELETE FROM reports WHERE expires_at<now()`,
      sql`DELETE FROM rate_limits WHERE window_start<now()-interval '2 hours'`,
      sql`DELETE FROM events WHERE created_at<now()-interval '90 days'`,
      sql`INSERT INTO reports(id,owner_hash,data) VALUES (${report.id},${id},${JSON.stringify(report)}::jsonb)`,
      ...(report.demo
        ? []
        : [sql`INSERT INTO events(kind) VALUES ('reconciliation_completed')`]),
    ]);
    return NextResponse.json({ id: report.id });
  } catch {
    return NextResponse.json(
      {
        error:
          "The report could not be saved. No successful run was recorded. Please retry.",
      },
      { status: 503 },
    );
  }
}
