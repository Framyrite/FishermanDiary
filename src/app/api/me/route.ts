import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { bestTrophyLabel } from "@/lib/stats";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const supabase = getSupabaseAdmin();

    const [speciesResult, userSpeciesResult, trophiesResult, friendsResult] = await Promise.all([
      supabase.from("fish_species").select("id", { count: "exact", head: true }),
      supabase.from("user_species").select("species_id").eq("user_id", user.id),
      supabase.from("trophies").select("id, weight_grams, species:fish_species(name)").eq("user_id", user.id),
      supabase
        .from("friendships")
        .select(
          "id, requester_id, receiver_id, requester:users!friendships_requester_id_fkey(id, username, first_name, avatar_url), receiver:users!friendships_receiver_id_fkey(id, username, first_name, avatar_url)",
        )
        .eq("status", "accepted")
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`),
    ]);

    if (speciesResult.error) throw speciesResult.error;
    if (userSpeciesResult.error) throw userSpeciesResult.error;
    if (trophiesResult.error) throw trophiesResult.error;
    if (friendsResult.error) throw friendsResult.error;

    const trophies = trophiesResult.data ?? [];
    const speciesIdsWithRecords = new Set(
      trophies.filter((t) => typeof t.weight_grams === "number" && t.weight_grams > 0).map((t) => t.id),
    );

    const rawFriends = friendsResult.data ?? [];
    const friendUsers = rawFriends.map((row: any) => (row.requester_id === user.id ? row.receiver : row.requester)).filter(Boolean);

    const friendSummaries = await Promise.all(
      friendUsers.map(async (friend: any) => {
        const [friendSpecies, friendTrophies] = await Promise.all([
          supabase.from("user_species").select("species_id").eq("user_id", friend.id),
          supabase.from("trophies").select("id, weight_grams, species:fish_species(name)").eq("user_id", friend.id),
        ]);

        const ft = friendTrophies.data ?? [];
        return {
          id: friend.id,
          username: friend.username,
          first_name: friend.first_name,
          avatar_url: friend.avatar_url,
          caught_species_count: friendSpecies.data?.length ?? 0,
          trophies_count: ft.length,
          best_trophy: bestTrophyLabel(ft),
        };
      }),
    );

    const recordSpecies = new Set(
      trophies.filter((t) => typeof t.weight_grams === "number" && t.weight_grams > 0).map((t: any) => t.species?.name),
    );

    return NextResponse.json({
      user,
      stats: {
        caught_species_count: userSpeciesResult.data?.length ?? 0,
        species_total: speciesResult.count ?? 0,
        trophies_count: trophies.length,
        records_count: recordSpecies.size,
        best_trophy: bestTrophyLabel(trophies),
      },
      friends: friendSummaries,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to load profile" }, { status: 401 });
  }
}
