import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const supabase = getSupabaseAdmin();

    const [speciesResult, userSpeciesResult, trophiesResult] = await Promise.all([
      supabase.from("fish_species").select("*").order("category").order("name"),
      supabase.from("user_species").select("species_id, status").eq("user_id", user.id),
      supabase.from("trophies").select("species_id, weight_grams, length_cm").eq("user_id", user.id),
    ]);

    if (speciesResult.error) throw speciesResult.error;
    if (userSpeciesResult.error) throw userSpeciesResult.error;
    if (trophiesResult.error) throw trophiesResult.error;

    const userSpeciesById = new Map((userSpeciesResult.data ?? []).map((row: any) => [row.species_id, row.status]));
    const trophiesBySpecies = new Map<string, any[]>();

    for (const trophy of trophiesResult.data ?? []) {
      const list = trophiesBySpecies.get(trophy.species_id) ?? [];
      list.push(trophy);
      trophiesBySpecies.set(trophy.species_id, list);
    }

    const species = (speciesResult.data ?? []).map((fish: any) => {
      const trophies = trophiesBySpecies.get(fish.id) ?? [];
      const manualStatus = userSpeciesById.get(fish.id) as string | undefined;
      const hasTrophy = trophies.length > 0;
      const caught_status = hasTrophy
        ? manualStatus === "caught_manual" || manualStatus === "caught_both"
          ? "caught_both"
          : "caught_trophy"
        : manualStatus ?? "uncaught";

      return {
        ...fish,
        caught_status,
        trophy_count: trophies.length,
        best_weight_grams: trophies.reduce((max, t) => Math.max(max, t.weight_grams ?? 0), 0) || null,
        best_length_cm: trophies.reduce((max, t) => Math.max(max, Number(t.length_cm ?? 0)), 0) || null,
      };
    });

    return NextResponse.json({ species });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to load species" }, { status: 500 });
  }
}
