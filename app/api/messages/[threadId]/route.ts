import { NextResponse } from "next/server";

import { ObjectId } from "mongodb";
import { getAuthenticatedUser } from "@/src/lib/auth-helper";
import clientPromise from "@/src/lib/mongodb";
import { ThreadDoc } from "@/src/models/types";
import { Collections } from "@/src/models/collections";
import { list } from "@/src/services/db/messages";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const me = await getAuthenticatedUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { threadId } = await params;

    if (!ObjectId.isValid(threadId)) {
      return NextResponse.json({ error: "Invalid thread ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const threads = client
      .db(process.env.DATABASE_NAME)
      .collection<ThreadDoc>(Collections.Threads);
    const tid = new ObjectId(threadId);

    const thread = await threads.findOne({ _id: tid });

    if (!thread || !thread.participants.includes(me)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit")) || 50;
    const cursor = searchParams.get("cursor") || undefined;

    const messagesList = await list(threadId, limit, cursor);

    return NextResponse.json(messagesList);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
