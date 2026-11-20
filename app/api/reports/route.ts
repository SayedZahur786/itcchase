import { NextResponse } from "next/server";
import { db, owner, sameOrigin } from "@/lib/db";
export async function DELETE(request: Request) {
  if (!sameOrigin(request))
    return NextResponse.json({ error: "Origin rejected." }, { status: 403 });
  try {
    const id = await owner();
    if (!id)
      return NextResponse.json({ error: "Session required." }, { status: 401 });
    const sql = db();
    await sql.transaction([
      sql`DELETE FROM reports WHERE owner_hash=${id}`,
      sql`DELETE FROM sessions WHERE owner_hash=${id}`,
    ]);
    const response = NextResponse.json({ deleted: true });
    response.cookies.delete("itc_session");
    return response;
  } catch {
    return NextResponse.json(
      { error: "Deletion failed. Please retry later." },
      { status: 503 },
    );
  }
}
