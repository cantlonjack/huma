import { createServerSupabase } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/today";

  if (code) {
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Auth succeeded — redirect to /today (or wherever 'next' points)
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // Auth code missing or exchange failed — redirect to start
  return NextResponse.redirect(new URL("/start?error=auth", request.url));
}
