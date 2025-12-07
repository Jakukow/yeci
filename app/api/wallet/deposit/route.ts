import { NextResponse } from "next/server";

import BN from "bn.js";
import { getAuthenticatedUser } from "@/src/lib/auth-helper";
import { submitSignedTxBase64 } from "@/src/services/solana";
import { incBalance } from "@/src/services/db/users";

export async function POST(req: Request) {
  const me = await getAuthenticatedUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { txBase64 } = body;
    const expected = new BN(String(body.expectedAmount || "0"));

    if (!txBase64)
      return NextResponse.json(
        { error: "Variable txBase64 required" },
        { status: 400 }
      );
    if (expected.lte(new BN(0)))
      return NextResponse.json(
        { error: "Invalid expectedAmount" },
        { status: 400 }
      );

    let signature: string;
    try {
      signature = await submitSignedTxBase64(txBase64);
    } catch (e: any) {
      return NextResponse.json(
        { error: `Chain submit failed: ${e?.message}` },
        { status: 400 }
      );
    }

    await incBalance(me, Number(expected.toString()));

    return NextResponse.json({
      ok: true,
      signature,
      credited: expected.toString(),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
