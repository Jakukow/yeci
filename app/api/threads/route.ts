import { getAuthenticatedUser } from "@/src/lib/auth-helper";
import { getOrCreate, listForUser } from "@/src/services/db/threads";
import { NextResponse } from "next/server";

export async function GET() {
  const me = await getAuthenticatedUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const threads = await listForUser(me);
    return NextResponse.json(threads);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const me = await getAuthenticatedUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const peer = body.peer?.trim();

    if (!peer) {
      return NextResponse.json({ error: "Peer required" }, { status: 400 });
    }

    if (peer === me) {
      return NextResponse.json(
        { error: "Cannot create thread with self" },
        { status: 400 }
      );
    }

    const thread = await getOrCreate(me, peer);
    return NextResponse.json(thread);
  } catch (e: any) {
    if (e.message === "not friends" || e.message === "Not friends") {
      return NextResponse.json({ error: e.message }, { status: 403 });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
