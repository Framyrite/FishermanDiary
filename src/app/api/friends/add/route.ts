import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const { friendId } = (await request.json()) as { friendId?: string };
    if (!friendId) return NextResponse.json({ error: "friendId is required" }, { status: 400 });
    if (friendId === user.id) return NextResponse.json({ ok: true, message: "Это ты сам" });

    const supabase = getSupabaseAdmin();

    const { data: friend, error: friendError } = await supabase.from("users").select("id").eq("id", friendId).single();
    if (friendError || !friend) return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });

    const { data: existing, error: existingError } = await supabase
      .from("friendships")
      .select("id")
      .or(
        `and(requester_id.eq.${user.id},receiver_id.eq.${friendId}),and(requester_id.eq.${friendId},receiver_id.eq.${user.id})`,
      )
      .maybeSingle();

    if (existingError) throw existingError;
    if (existing) return NextResponse.json({ ok: true, message: "Уже в друзьях" });

    const { error } = await supabase.from("friendships").insert({
      requester_id: user.id,
      receiver_id: friendId,
      status: "accepted",
    });
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to add friend" }, { status: 500 });
  }
}
