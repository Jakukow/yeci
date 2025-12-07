import clientPromise from "@/src/lib/mongodb";
import { Collections } from "@/src/models/collections";
import { MessageDoc, MessageKind } from "@/src/models/types";
import { ObjectId } from "mongodb";

async function getCollection() {
  const client = await clientPromise;
  return client
    .db(process.env.DATABASE_NAME)
    .collection<MessageDoc>(Collections.Messages);
}

export async function add(
  threadId: string,
  sender: string,
  content: string,
  kind: MessageKind = "text"
) {
  const collection = await getCollection();
  const now = new Date();

  const doc: MessageDoc = {
    threadId: new ObjectId(threadId),
    sender,
    content,
    kind,
    createdAt: now,
  };

  const res = await collection.insertOne(doc as any);
  return { ...doc, _id: res.insertedId } as any;
}

export async function list(threadId: string, limit = 50, cursor?: string) {
  const collection = await getCollection();
  const q: any = { threadId: new ObjectId(threadId) };

  if (cursor) {
    q._id = { $lt: new ObjectId(cursor) };
  }

  return collection.find(q).sort({ _id: -1 }).limit(limit).toArray();
}
