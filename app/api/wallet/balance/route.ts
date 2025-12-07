import { getAuthenticatedUser } from "@/src/lib/auth-helper";
import { findByAddress } from "@/src/services/db/users";
import { NextResponse } from "next/server";

export async function GET() {
  const me = await getAuthenticatedUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const u = await findByAddress(me);
    if (!u)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ address: me, amount: u.amount ?? 0 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
