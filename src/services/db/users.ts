import clientPromise from "@/src/lib/mongodb";
import { Collections } from "@/src/models/collections";
import { UserDoc } from "@/src/models/types";

async function getCollection() {
  const client = await clientPromise;
  return client
    .db(process.env.DATABASE_NAME)
    .collection<UserDoc>(Collections.Users);
}

export async function upsertWithNonce(address: string, nonce: string) {
  const collection = await getCollection();
  const now = new Date();

  await collection.updateOne(
    { address },
    {
      $setOnInsert: { createdAt: now, amount: 0 },
      $set: { nonce, updatedAt: now },
    },
    { upsert: true }
  );
}

export async function findByAddress(address: string) {
  const collection = await getCollection();
  return collection.findOne({ address });
}

export async function rotateNonce(address: string, nextNonce: string) {
  const collection = await getCollection();
  const now = new Date();

  await collection.updateOne(
    { address },
    { $set: { nonce: nextNonce, updatedAt: now, lastLoginAt: now } }
  );
}

export async function incBalance(address: string, units: number) {
  const collection = await getCollection();
  const now = new Date();

  const res = await collection.updateOne(
    { address },
    [{ $set: { amount: { $add: ["$amount", units] }, updatedAt: now } }],
    { upsert: false }
  );
  return res.modifiedCount === 1;
}

export async function transfer(a: string, b: string, units: number) {
  if (units <= 0) throw new Error("Amount must be positive");

  const client = await clientPromise;
  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      const collection = await getCollection();

      const ua = await collection.findOne({ address: a }, { session });
      const ub = await collection.findOne({ address: b }, { session });

      if (!ua || !ub) throw new Error("User not found");
      if ((ua.amount ?? 0) < units) throw new Error("Insufficient funds");

      await collection.updateOne(
        { address: a },
        { $inc: { amount: -units }, $set: { updatedAt: new Date() } },
        { session }
      );

      await collection.updateOne(
        { address: b },
        { $inc: { amount: units }, $set: { updatedAt: new Date() } },
        { session }
      );
    });

    return true;
  } finally {
    await session.endSession();
  }
}
