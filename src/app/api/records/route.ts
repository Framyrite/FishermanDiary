import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("trophies")
      .select("id, species_id, photo_url, weight_grams, length_cm, date_caught, species:fish_species(id, name, category)")
      .eq("user_id", user.id)
      .not("weight_grams", "is", null);

    if (error) throw error;

    const bestBySpecies = new Map<string, any>();
    for (const trophy of data ?? []) {
      const previous = bestBySpecies.get(trophy.species_id);
      if (!previous || (trophy.weight_grams ?? 0) > (previous.weight_grams ?? 0)) {
        bestBySpecies.set(trophy.species_id, trophy);
      }
    }

    const records = Array.from(bestBySpecies.values())
      .map((trophy: any) => ({
        species_id: trophy.species_id,
        species_name: trophy.species?.name ?? "Рыба",
        category: trophy.species?.category ?? "Другое",
        best_weight_grams: trophy.weight_grams,
        best_length_cm: trophy.length_cm,
        trophy_id: trophy.id,
        photo_url: trophy.photo_url,
        date_caught: trophy.date_caught,
      }))
      .sort((a, b) => (b.best_weight_grams ?? 0) - (a.best_weight_grams ?? 0));

    return NextResponse.json({ records });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to load records" }, { status: 500 });
  }
}
