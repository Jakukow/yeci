import { getAuthenticatedUser } from "@/src/lib/auth-helper";
import { listAccepted } from "@/src/services/db/friends";
import { NextResponse } from "next/server";

export async function GET() {
  const me = await getAuthenticatedUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const friends = await listAccepted(me);
    return NextResponse.json(friends);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
