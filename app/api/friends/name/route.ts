import { getAuthenticatedUser } from "@/src/lib/auth-helper";
import { setName } from "@/src/services/db/friends";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const me = await getAuthenticatedUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { peer, name } = body;

    if (!peer || !name) {
      return NextResponse.json(
        { error: "Peer and name required" },
        { status: 400 }
      );
    }

    await setName(me, peer, name.trim());
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
