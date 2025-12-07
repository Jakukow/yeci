import clientPromise from "@/src/lib/mongodb";
import { Collections } from "@/src/models/collections";
import { FriendDoc } from "@/src/models/types";

function getKey(a: string, b: string): [string, string] {
  return [a, b].sort() as [string, string];
}

async function getCollection() {
  const client = await clientPromise;
  return client
    .db(process.env.DATABASE_NAME)
    .collection<FriendDoc>(Collections.Friends);
}

export async function get(a: string, b: string) {
  const collection = await getCollection();
  const participants = getKey(a, b);
  return collection.findOne({ participants });
}

export async function listAccepted(me: string) {
  const collection = await getCollection();
  return collection
    .find({ status: "accepted", participants: { $in: [me] } })
    .sort({ updatedAt: -1 })
    .toArray();
}

export async function listPending(me: string) {
  const collection = await getCollection();
  return collection
    .find({ status: "pending", participants: { $in: [me] } })
    .sort({ updatedAt: -1 })
    .toArray();
}

export async function request(me: string, peer: string, name: string) {
  if (me === peer) throw new Error("Cannot friend self");

  const collection = await getCollection();
  const participants = getKey(me, peer);
  const existing = await collection.findOne({ participants });

  if (existing) {
    if (existing.status === "accepted") return existing;

    if (existing.status === "pending" && existing.requestedBy !== me) {
      return accept(me, peer);
    }

    await collection.updateOne(
      { _id: existing._id },
      { $set: { ["names." + me]: name, updatedAt: new Date() } }
    );

    return {
      ...existing,
      names: {
        ...(existing.names || {}),
        [me]: name || (existing.names || {})[me],
      },
    } as any;
  }

  const now = new Date();
  const doc: FriendDoc = {
    participants,
    status: "pending",
    requestedBy: me,
    names: { [me]: name },
    createdAt: now,
    updatedAt: now,
  };

  const res = await collection.insertOne(doc);
  return { ...doc, _id: res.insertedId };
}

export async function accept(me: string, peer: string) {
  const collection = await getCollection();
  const participants = getKey(me, peer);
  const now = new Date();

  const res = await collection.findOneAndUpdate(
    { participants, status: "pending", requestedBy: peer },
    { $set: { status: "accepted", acceptedAt: now, updatedAt: now } },
    { returnDocument: "after" }
  );

  if (!res) throw new Error("No pending invite from peer");
  return res;
}

export async function setName(me: string, peer: string, name: string) {
  const collection = await getCollection();
  const participants = getKey(me, peer);

  await collection.updateOne(
    { participants },
    {
      $set: { ["names." + me]: name, updatedAt: new Date() },
    }
  );
  return true;
}

export async function remove(a: string, b: string) {
  const collection = await getCollection();
  const participants = getKey(a, b);
  await collection.deleteOne({ participants });
  return true;
}
