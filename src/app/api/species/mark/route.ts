import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const { speciesId, caught } = (await request.json()) as { speciesId?: string; caught?: boolean };
    if (!speciesId) return NextResponse.json({ error: "speciesId is required" }, { status: 400 });

    const supabase = getSupabaseAdmin();

    const { data: trophies, error: trophyError } = await supabase
      .from("trophies")
      .select("id")
      .eq("user_id", user.id)
      .eq("species_id", speciesId);

    if (trophyError) throw trophyError;
    const hasTrophies = (trophies?.length ?? 0) > 0;

    if (caught) {
      const status = hasTrophies ? "caught_both" : "caught_manual";
      const { error } = await supabase
        .from("user_species")
        .upsert(
          { user_id: user.id, species_id: speciesId, status, updated_at: new Date().toISOString() },
          { onConflict: "user_id,species_id" },
        );
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (hasTrophies) {
      const { error } = await supabase
        .from("user_species")
        .upsert(
          { user_id: user.id, species_id: speciesId, status: "caught_trophy", updated_at: new Date().toISOString() },
          { onConflict: "user_id,species_id" },
        );
      if (error) throw error;
      return NextResponse.json({ ok: true, warning: "У вида есть трофеи, поэтому полностью снять отметку нельзя." });
    }

    const { error } = await supabase
      .from("user_species")
      .delete()
      .eq("user_id", user.id)
      .eq("species_id", speciesId);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update species" }, { status: 500 });
  }
}
