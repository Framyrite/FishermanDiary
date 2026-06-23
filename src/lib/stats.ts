import { formatWeight } from "@/lib/format";

type TrophyRow = {
  weight_grams: number | null;
  species?: { name?: string | null } | null;
};

export function bestTrophyLabel(trophies: TrophyRow[]): string | null {
  const best = trophies
    .filter((t) => typeof t.weight_grams === "number" && t.weight_grams > 0)
    .sort((a, b) => (b.weight_grams ?? 0) - (a.weight_grams ?? 0))[0];

  if (!best) return null;
  return `${best.species?.name ?? "Рыба"} — ${formatWeight(best.weight_grams)}`;
}
