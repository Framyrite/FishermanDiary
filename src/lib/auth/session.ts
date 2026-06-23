import type { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const SESSION_COOKIE = "klyunulo_user_id";

export async function requireUser(request: NextRequest) {
  const userId = request.cookies.get(SESSION_COOKIE)?.value;
  if (!userId) throw new Error("Нет сессии. Открой приложение через Telegram или включи dev mode.");

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("users").select("*").eq("id", userId).single();

  if (error || !data) throw new Error("Пользователь не найден");
  return data;
}
