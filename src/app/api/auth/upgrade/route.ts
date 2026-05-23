import { NextResponse } from "next/server";
import { getSession, setSession } from "@/lib/auth";
import { updateUser, findUserByEmail } from "@/lib/db";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  // Update DB
  await updateUser(session.email, { isPremium: true });

  // Update session
  const updatedUser = await findUserByEmail(session.email);
  if (updatedUser) {
    await setSession(updatedUser);
  }

  return NextResponse.json({ success: true, isPremium: true });
}
