import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
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

function getStoragePathFromPublicUrl(photoUrl: string | null) {
  if (!photoUrl) return null;

  try {
    const url = new URL(photoUrl);
    const marker = `/${BUCKET}/`;
    const index = url.pathname.indexOf(marker);
    if (index === -1) return null;
    return decodeURIComponent(url.pathname.slice(index + marker.length));
  } catch {
    return null;
  }
}

async function markSpeciesForTrophy(userId: string, speciesId: string) {
  const supabase = getSupabaseAdmin();

  const { data: existingMark } = await supabase
    .from("user_species")
    .select("status")
    .eq("user_id", userId)
    .eq("species_id", speciesId)
    .maybeSingle();

  const status =
    existingMark?.status === "caught_manual" || existingMark?.status === "caught_both"
      ? "caught_both"
      : "caught_trophy";

  const { error } = await supabase
    .from("user_species")
    .upsert(
      {
        user_id: userId,
        species_id: speciesId,
        status,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,species_id" }
    );

  if (error) throw error;
}

async function updateSpeciesMarkAfterDelete(userId: string, speciesId: string) {
  const supabase = getSupabaseAdmin();

  const { data: remainingTrophies, error: trophyError } = await supabase
    .from("trophies")
    .select("id")
    .eq("user_id", userId)
    .eq("species_id", speciesId);

  if (trophyError) throw trophyError;

  if ((remainingTrophies?.length ?? 0) > 0) return;

  const { data: mark, error: markSelectError } = await supabase
    .from("user_species")
    .select("status")
    .eq("user_id", userId)
    .eq("species_id", speciesId)
    .maybeSingle();

  if (markSelectError) throw markSelectError;
  if (!mark) return;

  if (mark.status === "caught_both") {
    const { error } = await supabase
      .from("user_species")
      .update({ status: "caught_manual", updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("species_id", speciesId);

    if (error) throw error;
    return;
  }

  if (mark.status === "caught_trophy") {
    const { error } = await supabase
      .from("user_species")
      .delete()
      .eq("user_id", userId)
      .eq("species_id", speciesId);

    if (error) throw error;
  }
}

async function uploadPhoto(userId: string, file: File) {
  const supabase = getSupabaseAdmin();

  if (file.size > 6 * 1024 * 1024) {
    throw new Error("Фото больше 6MB. Сожми его перед загрузкой.");
  }

  const ext = cleanFileName(file.name).split(".").pop() || "jpg";
  const path = `${userId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });

  if (uploadError) throw uploadError;

  const { data: publicUrl } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return publicUrl.publicUrl;
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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Не удалось загрузить трофеи" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const form = await request.formData();
    const speciesId = optionalString(form.get("species_id"));

    if (!speciesId) {
      return NextResponse.json({ error: "Выбери вид рыбы" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    let photoUrl: string | null = null;

    const file = form.get("photo");
    if (file instanceof File && file.size > 0) {
      photoUrl = await uploadPhoto(user.id, file);
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

    await markSpeciesForTrophy(user.id, speciesId);

    return NextResponse.json({ trophy });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Не удалось создать трофей" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const trophyId = request.nextUrl.searchParams.get("id");

    if (!trophyId) {
      return NextResponse.json({ error: "Не передан id трофея" }, { status: 400 });
    }

    const form = await request.formData();
    const speciesId = optionalString(form.get("species_id"));

    if (!speciesId) {
      return NextResponse.json({ error: "Выбери вид рыбы" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: oldTrophy, error: selectError } = await supabase
      .from("trophies")
      .select("id, user_id, species_id, photo_url")
      .eq("id", trophyId)
      .eq("user_id", user.id)
      .single();

    if (selectError || !oldTrophy) {
      return NextResponse.json({ error: "Трофей не найден" }, { status: 404 });
    }

    let photoUrl = oldTrophy.photo_url;

    const file = form.get("photo");
    if (file instanceof File && file.size > 0) {
      photoUrl = await uploadPhoto(user.id, file);
    }

    const weightGrams = optionalNumber(form.get("weight_grams"));
    const lengthCm = optionalNumber(form.get("length_cm"));

    const { data: trophy, error: updateError } = await supabase
      .from("trophies")
      .update({
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
      .eq("id", trophyId)
      .eq("user_id", user.id)
      .select("*, species:fish_species(id, name, category, image_url)")
      .single();

    if (updateError) throw updateError;

    if (file instanceof File && file.size > 0 && oldTrophy.photo_url) {
      const oldPath = getStoragePathFromPublicUrl(oldTrophy.photo_url);
      if (oldPath) {
        await supabase.storage.from(BUCKET).remove([oldPath]);
      }
    }

    await markSpeciesForTrophy(user.id, speciesId);

    if (oldTrophy.species_id !== speciesId) {
      await updateSpeciesMarkAfterDelete(user.id, oldTrophy.species_id);
    }

    return NextResponse.json({ trophy });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Не удалось изменить трофей" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const trophyId = request.nextUrl.searchParams.get("id");

    if (!trophyId) {
      return NextResponse.json({ error: "Не передан id трофея" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: trophy, error: selectError } = await supabase
      .from("trophies")
      .select("id, user_id, species_id, photo_url")
      .eq("id", trophyId)
      .eq("user_id", user.id)
      .single();

    if (selectError || !trophy) {
      return NextResponse.json({ error: "Трофей не найден" }, { status: 404 });
    }

    const { error: deleteError } = await supabase
      .from("trophies")
      .delete()
      .eq("id", trophy.id)
      .eq("user_id", user.id);

    if (deleteError) throw deleteError;

    const storagePath = getStoragePathFromPublicUrl(trophy.photo_url);
    if (storagePath) {
      await supabase.storage.from(BUCKET).remove([storagePath]);
    }

    await updateSpeciesMarkAfterDelete(user.id, trophy.species_id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Не удалось удалить трофей" },
      { status: 500 }
    );
  }
}
