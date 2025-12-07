import { NextResponse } from "next/server";
import { request as requestFriend } from "@/src/services/db/friends";
import { getAuthenticatedUser } from "@/src/lib/auth-helper";

export async function POST(req: Request) {
  const me = await getAuthenticatedUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const peer = body.peer?.trim();
    const name = body.name?.trim();

    if (!peer) {
      return NextResponse.json({ error: "Peer required" }, { status: 400 });
    }

    const doc = await requestFriend(me, peer, name);
    return NextResponse.json(doc);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
