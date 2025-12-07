import { NextResponse } from "next/server";

import BN from "bn.js";
import { getAuthenticatedUser } from "@/src/lib/auth-helper";
import { transfer } from "@/src/services/db/users";

export async function POST(req: Request) {
  const from = await getAuthenticatedUser();
  if (!from)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const to = (body.to || "").trim();
    const amountStr = String(body.amount || "0");
    const bn = new BN(amountStr);

    if (!to)
      return NextResponse.json({ error: "To required" }, { status: 400 });
    if (to === from)
      return NextResponse.json(
        { error: "Cannot transfer to self" },
        { status: 400 }
      );
    if (bn.lte(new BN(0)))
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });

    await transfer(from, to, Number(bn.toString()));
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Transfer failed" },
      { status: 400 }
    );
  }
}
