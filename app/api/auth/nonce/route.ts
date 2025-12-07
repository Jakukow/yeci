import { upsertWithNonce } from "@/src/services/db/users";
import { loginMessage, makeNonce } from "@/src/services/utils";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const address = body.address?.trim();

    if (!address) {
      return NextResponse.json({ error: "Address required" }, { status: 400 });
    }

    const nonce = makeNonce();
    await upsertWithNonce(address, nonce);

    const message = loginMessage(address, nonce);
    return NextResponse.json({ nonce, message });
  } catch (e: any) {
    console.error("Error in /api/auth/nonce:", e);
    return NextResponse.json(
      { error: e.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
