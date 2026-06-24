"use client";

import { useMemo, useState } from "react";
import { AppIcon } from "@/components/AppIcon";
import { FishImage } from "@/components/FishImage";
import { api } from "@/lib/api";
import { formatLength, formatWeight } from "@/lib/format";
import type { FishSpecies } from "@/types/domain";

type Filter = "all" | "caught" | "uncaught" | "predator" | "peaceful" | "freshwater" | "marine";

const filters: Array<{ key: Filter; label: string }> = [
  { key: "all", label: "Все" },
  { key: "caught", label: "Пойманные" },
  { key: "uncaught", label: "Не пойманные" },
  { key: "predator", label: "Хищные" },
  { key: "peaceful", label: "Мирные" },
  { key: "freshwater", label: "Пресноводные" },
  { key: "marine", label: "Морские" },
];


const popularOrder = [
  "щука", "окунь", "судак", "карп", "карась серебряный", "карась золотой", "лещ", "плотва", "сом", "жерех",
  "линь", "сазан", "форель", "хариус", "налим", "берш", "голавль", "красноперка", "краснопёрка", "амур белый",
];

function speciesPriority(fish: FishSpecies) {
  const name = normalized(fish.name);
  const exactIndex = popularOrder.findIndex((item) => normalized(item) === name);
  if (exactIndex >= 0) return exactIndex;

  const partialIndex = popularOrder.findIndex((item) => name.includes(normalized(item)));
  if (partialIndex >= 0) return partialIndex + 30;

  if (fish.caught_status !== "uncaught") return 80;
  if (isPredator(fish)) return 110;
  if (isPeaceful(fish)) return 130;
  if (isMarine(fish)) return 180;
  return 160;
}

function sortSpecies(items: FishSpecies[]) {
  return [...items].sort((a, b) => {
    const priorityDiff = speciesPriority(a) - speciesPriority(b);
    if (priorityDiff !== 0) return priorityDiff;
    return a.name.localeCompare(b.name, "ru");
  });
}

const predatorNames = ["щука", "окунь", "судак", "берш", "сом", "жерех", "налим", "форель", "таймень", "лосось", "хариус", "голец", "тунец", "сибас", "треска", "палтус", "луфарь", "сарган"];

function normalized(value?: string | null) {
  return (value ?? "").trim().toLowerCase().replaceAll("ё", "е");
}

function isCaspianFish(fish: FishSpecies) {
  const value = `${normalized(fish.name)} ${normalized(fish.category)} ${normalized(fish.description)}`;
  return value.includes("каспий") || ["вобла", "кутум", "шемая"].some((name) => normalized(fish.name) === name);
}

function isGenericCrucian(fish: FishSpecies) {
  return normalized(fish.name) === "карась";
}

function isPredator(fish: FishSpecies) {
  const name = normalized(fish.name);
  const category = normalized(fish.category);
  return category.includes("хищ") || predatorNames.some((item) => name.includes(normalized(item)));
}

function isMarine(fish: FishSpecies) {
  return normalized(fish.category).includes("морск");
}

function isFreshwater(fish: FishSpecies) {
  const category = normalized(fish.category);
  return !isMarine(fish) || category.includes("пресновод") || category.includes("лосос") || category.includes("осетр") || category.includes("проход");
}

function isPeaceful(fish: FishSpecies) {
  const category = normalized(fish.category);
  return category.includes("мир") || category.includes("мелоч") || (!isPredator(fish) && !isMarine(fish));
}

function habitatLabel(category: string) {
  const lower = normalized(category);
  if (lower.includes("морск")) return "Морская";
  if (lower.includes("проход")) return "Проходная";
  if (lower.includes("осетр")) return "Осетровая";
  if (lower.includes("лосос")) return "Лососёвая";
  return "Пресноводная";
}

function trophyWord(count: number) {
  if (count % 10 === 1 && count % 100 !== 11) return "трофей";
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return "трофея";
  return "трофеев";
}

export function SpeciesTab({ species, onChanged, onAddTrophy }: { species: FishSpecies[]; onChanged: () => void; onAddTrophy: () => void }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const cleanSpecies = useMemo(() => species.filter((fish) => !isCaspianFish(fish) && !isGenericCrucian(fish)), [species]);
  const caughtCount = cleanSpecies.filter((fish) => fish.caught_status !== "uncaught").length;

  const filtered = useMemo(() => {
    const search = normalized(query);
    let result = cleanSpecies.filter((fish) => {
      if (!search) return true;
      const haystack = normalized(`${fish.name} ${fish.category} ${fish.description ?? ""}`);
      return haystack.includes(search);
    });

    if (filter === "caught") result = result.filter((fish) => fish.caught_status !== "uncaught");
    if (filter === "uncaught") result = result.filter((fish) => fish.caught_status === "uncaught");
    if (filter === "predator") result = result.filter(isPredator);
    if (filter === "peaceful") result = result.filter(isPeaceful);
    if (filter === "freshwater") result = result.filter(isFreshwater);
    if (filter === "marine") result = result.filter(isMarine);

    return sortSpecies(result);
  }, [cleanSpecies, filter, query]);

  async function mark(fish: FishSpecies, caught: boolean) {
    setPendingId(fish.id);
    try {
      await api("/api/species/mark", {
        method: "POST",
        body: JSON.stringify({ speciesId: fish.id, caught }),
      });
      onChanged();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Ошибка");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="page-screen species-page">
      <section className="page-topbar">
        <div>
          <h1>Виды рыб</h1>
          <p>Коллекция пойманных видов и будущих целей.</p>
        </div>
        <div className="page-topbar-actions">
          <button
            className={`page-icon-btn ${searchOpen ? "active" : ""}`}
            type="button"
            aria-label="Поиск"
            aria-pressed={searchOpen}
            onClick={() => setSearchOpen((value) => !value)}
          >
            <AppIcon name="search" size={22} />
          </button>
        </div>
      </section>

      {searchOpen ? (
        <label className="premium-search-field">
          <AppIcon name="search" size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Найти вид рыбы" autoFocus />
          {query ? <button type="button" onClick={() => setQuery("")}>×</button> : null}
        </label>
      ) : null}

      <div className="species-progress-card">
        <div>
          <b>{caughtCount}</b>
          <span>из {cleanSpecies.length} видов поймано</span>
        </div>
        <div className="species-progress-track">
          <i style={{ width: `${cleanSpecies.length ? Math.min(100, Math.round((caughtCount / cleanSpecies.length) * 100)) : 0}%` }} />
        </div>
      </div>

      <div className="filters premium-filters" aria-label="Фильтры видов рыб">
        {filters.map((item) => (
          <button key={item.key} className={`chip ${filter === item.key ? "active" : ""}`} onClick={() => setFilter(item.key)} type="button">
            {item.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? <div className="empty premium-empty">Ничего не найдено.</div> : null}

      <div className="premium-list species-scroll-list">
        {filtered.map((fish) => {
          const isCaught = fish.caught_status !== "uncaught";
          const hasTrophy = fish.trophy_count > 0;

          return (
            <article className="premium-row species-premium-row" key={fish.id}>
              <div className="premium-fish-art species-row-art">
                <FishImage name={fish.name} imageUrl={fish.image_url} />
              </div>
              <div className="premium-row-main">
                <div className="premium-row-titleline">
                  <h2>{fish.name}</h2>
                  <div className="species-count-box">
                    <b>{fish.trophy_count}</b>
                    <span>{trophyWord(fish.trophy_count)}</span>
                  </div>
                </div>
                <div className="premium-row-place">
                  {isPredator(fish) ? "Хищная" : "Мирная"} · {habitatLabel(fish.category)}
                </div>
                <div className="species-status-line">
                  {isCaught ? <span className="caught-status"><AppIcon name="check" size={13} />Поймана</span> : <span className="uncaught-status">Не поймана</span>}
                  {hasTrophy && <span className="premium-row-meta"><AppIcon name="weight" size={13} />{formatWeight(fish.best_weight_grams)} · {formatLength(fish.best_length_cm)}</span>}
                </div>
                <div className="premium-inline-actions species-inline-actions">
                  {isCaught ? (
                    <button
                      className="glass-mini-btn"
                      disabled={pendingId === fish.id || fish.trophy_count > 0}
                      onClick={() => mark(fish, false)}
                      type="button"
                      title={fish.trophy_count > 0 ? "Сначала удали трофеи этого вида" : "Убрать отметку"}
                    >
                      Поймана
                    </button>
                  ) : (
                    <button className="glass-mini-btn" disabled={pendingId === fish.id} onClick={() => mark(fish, true)} type="button">
                      Ловил
                    </button>
                  )}
                  <button className="glass-mini-btn accent" onClick={onAddTrophy} type="button">
                    + Трофей
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
