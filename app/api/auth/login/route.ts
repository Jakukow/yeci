import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { findByAddress, rotateNonce } from "@/src/services/db/users";
import { loginMessage, makeNonce } from "@/src/services/utils";
import { verifySolanaSignature } from "@/src/services/solana";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const JWT_EXPIRES_IN = "7d";

export async function POST(req: Request) {
  try {
    const { address, signature } = await req.json();

    if (!address || !signature) {
      return NextResponse.json(
        { error: "Missing address or signature" },
        { status: 400 }
      );
    }

    const user = await findByAddress(address);
    if (!user) {
      return NextResponse.json(
        { error: "Call /api/auth/nonce first" },
        { status: 400 }
      );
    }

    const message = loginMessage(address, user.nonce);
    const isValid = verifySolanaSignature(address, message, signature);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const nextNonce = makeNonce();
    await rotateNonce(address, nextNonce);

    const token = jwt.sign({ sub: address }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    const isProd = process.env.NODE_ENV === "production";
    const cookieStore = await cookies();

    cookieStore.set("accessToken", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("Error in /api/auth/login:", e);
    return NextResponse.json(
      { error: "Internal login error" },
      { status: 500 }
    );
  }
}
