import { formatWeight } from "@/lib/format";

type TrophyRow = {
  weight_grams: number | null;
  species?: { name?: string | null } | { name?: string | null }[] | null;
};

function getSpeciesName(species: TrophyRow["species"]) {
  if (Array.isArray(species)) {
    return species[0]?.name ?? "Рыба";
  }

  return species?.name ?? "Рыба";
}

export function bestTrophyLabel(trophies: TrophyRow[]): string | null {
  const best = trophies
    .filter((t) => typeof t.weight_grams === "number" && t.weight_grams > 0)
    .sort((a, b) => (b.weight_grams ?? 0) - (a.weight_grams ?? 0))[0];

  if (!best) return null;

  return `${getSpeciesName(best.species)} — ${formatWeight(best.weight_grams)}`;
}
