import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { bestTrophyLabel } from "@/lib/stats";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("friendships")
      .select(
        "id, requester_id, receiver_id, requester:users!friendships_requester_id_fkey(id, username, first_name, avatar_url), receiver:users!friendships_receiver_id_fkey(id, username, first_name, avatar_url)",
      )
      .eq("status", "accepted")
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);

    if (error) throw error;

    const friends = await Promise.all(
      (data ?? []).map(async (row: any) => {
        const friend = row.requester_id === user.id ? row.receiver : row.requester;
        const [species, trophies] = await Promise.all([
          supabase.from("user_species").select("species_id").eq("user_id", friend.id),
          supabase.from("trophies").select("id, weight_grams, species:fish_species(name)").eq("user_id", friend.id),
        ]);
        const trophyRows = trophies.data ?? [];
        return {
          id: friend.id,
          username: friend.username,
          first_name: friend.first_name,
          avatar_url: friend.avatar_url,
          caught_species_count: species.data?.length ?? 0,
          trophies_count: trophyRows.length,
          best_trophy: bestTrophyLabel(trophyRows),
        };
      }),
    );

    return NextResponse.json({ friends });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to load friends" }, { status: 500 });
  }
}
