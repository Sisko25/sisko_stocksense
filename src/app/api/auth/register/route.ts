import { NextResponse } from "next/server";
import { findUserByEmail, createUser } from "@/lib/db";
import { setSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const existingUser = findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const newUser = createUser({ email, password, isPremium: false });
    await setSession(newUser);

    return NextResponse.json({ user: { email: newUser.email, isPremium: newUser.isPremium } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
