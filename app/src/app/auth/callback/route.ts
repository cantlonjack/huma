import { createServerSupabase } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/begin";

  if (code) {
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Redirect to /begin which will detect the pending shape and save it
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // Auth code missing or exchange failed — redirect to login
  return NextResponse.redirect(new URL("/login?error=auth", request.url));
}
