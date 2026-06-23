import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const BUCKET = "trophy-photos";

function optionalNumber(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") return null;
  const normalized = value.replace(",", ".");
  const num = Number(normalized);
  return Number.isFinite(num) ? num : null;
}

function optionalString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function cleanFileName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("trophies")
      .select("*, species:fish_species(id, name, category, image_url)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ trophies: data ?? [] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to load trophies" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const form = await request.formData();
    const speciesId = optionalString(form.get("species_id"));
    if (!speciesId) return NextResponse.json({ error: "Выбери вид рыбы" }, { status: 400 });

    const supabase = getSupabaseAdmin();
    let photoUrl: string | null = null;

    const file = form.get("photo");
    if (file instanceof File && file.size > 0) {
      if (file.size > 6 * 1024 * 1024) {
        return NextResponse.json({ error: "Фото больше 6MB. Сожми его перед загрузкой." }, { status: 400 });
      }

      const ext = cleanFileName(file.name).split(".").pop() || "jpg";
      const path = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });
      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage.from(BUCKET).getPublicUrl(path);
      photoUrl = publicUrl.publicUrl;
    }

    const weightGrams = optionalNumber(form.get("weight_grams"));
    const lengthCm = optionalNumber(form.get("length_cm"));

    const { data: trophy, error: insertError } = await supabase
      .from("trophies")
      .insert({
        user_id: user.id,
        species_id: speciesId,
        photo_url: photoUrl,
        weight_grams: weightGrams ? Math.round(weightGrams) : null,
        length_cm: lengthCm,
        date_caught: optionalString(form.get("date_caught")),
        place_name: optionalString(form.get("place_name")),
        bait: optionalString(form.get("bait")),
        note: optionalString(form.get("note")),
        visibility: optionalString(form.get("visibility")) ?? "friends",
        show_place: form.get("show_place") === "true",
      })
      .select("*, species:fish_species(id, name, category, image_url)")
      .single();

    if (insertError) throw insertError;

    const { data: existingMark } = await supabase
      .from("user_species")
      .select("status")
      .eq("user_id", user.id)
      .eq("species_id", speciesId)
      .maybeSingle();

    const status = existingMark?.status === "caught_manual" || existingMark?.status === "caught_both" ? "caught_both" : "caught_trophy";
    const { error: markError } = await supabase
      .from("user_species")
      .upsert(
        { user_id: user.id, species_id: speciesId, status, updated_at: new Date().toISOString() },
        { onConflict: "user_id,species_id" },
      );
    if (markError) throw markError;

    return NextResponse.json({ trophy });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to create trophy" }, { status: 500 });
  }
}
