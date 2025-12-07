import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      sub: string;
    };
    return decoded.sub;
  } catch (e) {
    return null;
  }
}
