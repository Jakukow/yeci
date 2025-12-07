import { NextResponse } from "next/server";

import { ObjectId } from "mongodb";
import { getAuthenticatedUser } from "@/src/lib/auth-helper";
import clientPromise from "@/src/lib/mongodb";
import { ThreadDoc } from "@/src/models/types";
import { Collections } from "@/src/models/collections";
import { add } from "@/src/services/db/messages";

export async function POST(req: Request) {
  const me = await getAuthenticatedUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { threadId, content, kind } = body;

    if (!threadId || !content) {
      return NextResponse.json(
        { error: "ThreadId and content required" },
        { status: 400 }
      );
    }

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
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const msg = await add(threadId, me, content, (kind as any) || "text");

    await threads.updateOne({ _id: tid }, { $set: { updatedAt: new Date() } });

    return NextResponse.json(msg);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
