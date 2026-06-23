import crypto from "crypto";

export type TelegramMiniAppUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
};

export type VerifiedTelegramInitData = {
  user: TelegramMiniAppUser;
  auth_date?: string;
  start_param?: string;
};

function parseInitData(initData: string) {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  params.delete("hash");

  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  return { params, hash, dataCheckString };
}

export function verifyTelegramInitData(initData: string, botToken: string): VerifiedTelegramInitData {
  if (!initData) throw new Error("Telegram initData is empty");
  if (!botToken) throw new Error("TELEGRAM_BOT_TOKEN is missing");

  const { params, hash, dataCheckString } = parseInitData(initData);
  if (!hash) throw new Error("Telegram initData hash is missing");

  const secret = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const calculatedHash = crypto.createHmac("sha256", secret).update(dataCheckString).digest("hex");

  const ok = crypto.timingSafeEqual(Buffer.from(calculatedHash), Buffer.from(hash));
  if (!ok) throw new Error("Telegram initData hash is invalid");

  const authDateRaw = params.get("auth_date");
  if (authDateRaw) {
    const authDate = Number(authDateRaw) * 1000;
    const maxAgeMs = 1000 * 60 * 60 * 24;
    if (Date.now() - authDate > maxAgeMs) {
      throw new Error("Telegram initData is too old");
    }
  }

  const userRaw = params.get("user");
  if (!userRaw) throw new Error("Telegram user is missing");

  const user = JSON.parse(userRaw) as TelegramMiniAppUser;
  if (!user.id) throw new Error("Telegram user id is missing");

  return {
    user,
    auth_date: authDateRaw ?? undefined,
    start_param: params.get("start_param") ?? undefined,
  };
}

export function getDevTelegramUser(): TelegramMiniAppUser | null {
  if (process.env.NEXT_PUBLIC_DEV_MODE !== "true") return null;

  const id = Number(process.env.DEV_TELEGRAM_ID ?? "777001");
  return {
    id,
    username: process.env.DEV_TELEGRAM_USERNAME ?? "dev_fisher",
    first_name: process.env.DEV_TELEGRAM_FIRST_NAME ?? "Максим",
  };
}
