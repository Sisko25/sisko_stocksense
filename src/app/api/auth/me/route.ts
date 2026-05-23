import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { findUserByEmail } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session || !session.email) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  
  // Read fresh from DB to allow manual DB edits to take effect immediately
  const dbUser = await findUserByEmail(session.email);
  if (!dbUser) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user: { email: dbUser.email, isPremium: dbUser.isPremium } });
}
