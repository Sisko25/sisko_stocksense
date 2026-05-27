import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supabase } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("watchlists")
    .select("*")
    .eq("user_email", session.email)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ watchlists: data });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await request.json();
  if (!name) return NextResponse.json({ error: "Watchlist name is required" }, { status: 400 });

  // Enforce max 5 watchlists
  const { count } = await supabase
    .from("watchlists")
    .select("*", { count: "exact", head: true })
    .eq("user_email", session.email);

  if (count !== null && count >= 5) {
    return NextResponse.json({ error: "Maximum limit of 5 watchlists reached." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("watchlists")
    .insert([{ user_email: session.email, name, tickers: [] }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ watchlist: data });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, tickers, name } = await request.json();
  if (!id) return NextResponse.json({ error: "Watchlist ID is required" }, { status: 400 });

  const updateData: any = {};
  if (tickers !== undefined) updateData.tickers = tickers;
  if (name !== undefined) updateData.name = name;

  const { data, error } = await supabase
    .from("watchlists")
    .update(updateData)
    .eq("id", id)
    .eq("user_email", session.email)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ watchlist: data });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Watchlist ID is required" }, { status: 400 });

  const { error } = await supabase
    .from("watchlists")
    .delete()
    .eq("id", id)
    .eq("user_email", session.email);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
