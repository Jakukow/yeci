import { getAuthenticatedUser } from "@/src/lib/auth-helper";
import { listPending } from "@/src/services/db/friends";
import { NextResponse } from "next/server";

export async function GET() {
  const me = await getAuthenticatedUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const pending = await listPending(me);
    return NextResponse.json(pending);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
