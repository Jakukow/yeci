import clientPromise from "@/src/lib/mongodb";
import { ClientSession } from "mongodb";
import { retryOperation } from "../utils";

export async function withSession<R>(
  fn: (session: ClientSession) => Promise<R>
): Promise<R> {
  const client = await clientPromise;
  const session = client.startSession();

  try {
    const result = await retryOperation(() => fn(session));
    return result;
  } finally {
    await session.endSession();
  }
}
