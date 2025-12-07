import { NextResponse } from "next/server";

import BN from "bn.js";
import { getAuthenticatedUser } from "@/src/lib/auth-helper";
import { findByAddress, incBalance } from "@/src/services/db/users";
import { withdrawSplToUser } from "@/src/services/solana";

export async function POST(req: Request) {
  const me = await getAuthenticatedUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const amt = new BN(String(body.amount || "0"));

    if (amt.lte(new BN(0)))
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });

    const u = await findByAddress(me);
    if (!u)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (new BN(String(u.amount ?? 0)).lt(amt)) {
      return NextResponse.json(
        { error: "Insufficient funds" },
        { status: 400 }
      );
    }

    await incBalance(me, -Number(amt.toString()));

    try {
      const signature = await withdrawSplToUser(me, amt);
      return NextResponse.json({ ok: true, signature });
    } catch (e: any) {
      await incBalance(me, Number(amt.toString())).catch(() => {});
      return NextResponse.json(
        { error: `Withdraw failed: ${e?.message}` },
        { status: 500 }
      );
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
