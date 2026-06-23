export function formatWeight(grams?: number | null): string {
  if (!grams || grams <= 0) return "—";
  if (grams >= 1000) {
    const kg = grams / 1000;
    return `${kg.toLocaleString("ru-RU", { maximumFractionDigits: 2 })} кг`;
  }
  return `${grams} г`;
}

export function formatLength(cm?: number | null): string {
  if (!cm || cm <= 0) return "—";
  return `${cm.toLocaleString("ru-RU", { maximumFractionDigits: 1 })} см`;
}

export function formatDate(date?: string | null): string {
  if (!date) return "Дата не указана";
  const parsed = new Date(`${date}T00:00:00`);
  return parsed.toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" });
}

export function initials(name?: string | null): string {
  if (!name) return "🐟";
  return name.trim().slice(0, 1).toUpperCase();
}
