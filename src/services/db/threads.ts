import clientPromise from "@/src/lib/mongodb";
import { Collections } from "@/src/models/collections";
import { ThreadDoc } from "@/src/models/types";
import { get as getFriend } from "./friends";
function getKey(a: string, b: string): [string, string] {
  return [a, b].sort() as [string, string];
}

async function getCollection() {
  const client = await clientPromise;
  return client
    .db(process.env.DATABASE_NAME)
    .collection<ThreadDoc>(Collections.Threads);
}

export async function getOrCreate(a: string, b: string) {
  const collection = await getCollection();
  const participants = getKey(a, b);

  const existing = await collection.findOne({ participants });
  if (existing) return existing;

  const rel = await getFriend(a, b);

  if (!rel || rel.status !== "accepted") {
    throw new Error("Not friends");
  }

  const now = new Date();
  const doc: ThreadDoc = { participants, createdAt: now, updatedAt: now };

  const res = await collection.insertOne(doc);
  return { ...doc, _id: res.insertedId };
}

export async function listForUser(address: string, limit = 50) {
  const collection = await getCollection();
  return collection
    .find({ participants: address })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .toArray();
}
