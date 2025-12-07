import { getAuthenticatedUser } from "@/src/lib/auth-helper";
import { remove } from "@/src/services/db/friends";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ peer: string }> } // W Next.js 15 params jest Promise
) {
  const me = await getAuthenticatedUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { peer } = await params;
    const trimmedPeer = peer?.trim();

    if (!trimmedPeer) {
      return NextResponse.json({ error: "Peer required" }, { status: 400 });
    }

    await remove(me, trimmedPeer);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
