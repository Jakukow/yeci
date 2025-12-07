import { getAuthenticatedUser } from "@/src/lib/auth-helper";
import { findByAddress } from "@/src/services/db/users";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const me = await getAuthenticatedUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");

  if (!address || address.trim() === "") {
    return NextResponse.json(
      { error: "Address query parameter is required" },
      { status: 400 }
    );
  }

  try {
    const user = await findByAddress(address.trim());
    return NextResponse.json({ exists: !!user });
  } catch (e: any) {
    console.error("Error checking user:", e.message);
    return NextResponse.json({ error: "Error checking user" }, { status: 500 });
  }
}
