import { NextRequest, NextResponse } from "next/server";
import { getDevTelegramUser, verifyTelegramInitData } from "@/lib/auth/telegram";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as { initData?: string };

    const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";
    const botToken = process.env.TELEGRAM_BOT_TOKEN ?? "";

    const telegramUser =
      isDevMode && !body.initData
        ? getDevTelegramUser()
        : verifyTelegramInitData(body.initData ?? "", botToken).user;

    if (!telegramUser) {
      return NextResponse.json(
        { error: "Нет Telegram initData. Для локальной разработки включи NEXT_PUBLIC_DEV_MODE=true." },
        { status: 401 }
      );
    }

    const supabase = getSupabaseAdmin();

    const { data: user, error } = await supabase
      .from("users")
      .upsert(
        {
          telegram_id: telegramUser.id,
          username: telegramUser.username ?? null,
          first_name: telegramUser.first_name ?? null,
          avatar_url: telegramUser.photo_url ?? null,
        },
        { onConflict: "telegram_id" }
      )
      .select("*")
      .single();

    if (error || !user) {
      throw error ?? new Error("Не удалось создать пользователя");
    }

    const response = NextResponse.json({ user });

    response.cookies.set(SESSION_COOKIE, user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    console.error("AUTH ERROR:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Auth failed" },
      { status: 401 }
    );
  }
}
