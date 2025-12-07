import { getAuthenticatedUser } from "@/src/lib/auth-helper";
import { accept } from "@/src/services/db/friends";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const me = await getAuthenticatedUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const peer = body.peer?.trim();

    if (!peer) {
      return NextResponse.json({ error: "Peer required" }, { status: 400 });
    }

    const result = await accept(me, peer);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
