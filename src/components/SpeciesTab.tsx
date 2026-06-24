"use client";

import { useMemo, useState } from "react";
import { AppIcon } from "@/components/AppIcon";
import { FishImage } from "@/components/FishImage";
import { SpeciesBadge } from "@/components/SpeciesBadge";
import { api } from "@/lib/api";
import { formatLength, formatWeight } from "@/lib/format";
import type { FishSpecies } from "@/types/domain";

type Filter = "all" | "caught" | "uncaught" | "freshwater" | "caspian" | "marine";

const filters: Array<{ key: Filter; label: string }> = [
  { key: "all", label: "Все" },
  { key: "caught", label: "Пойманные" },
  { key: "uncaught", label: "Не пойманные" },
  { key: "freshwater", label: "Пресноводные" },
  { key: "caspian", label: "Каспий" },
  { key: "marine", label: "Морские" },
];

function categoryArea(category: string) {
  const lower = category.toLowerCase();
  if (lower.includes("каспий")) return "caspian";
  if (lower.includes("морск")) return "marine";
  if (lower.includes("пресновод") || lower.includes("лосос") || lower.includes("осетр") || lower.includes("осётр") || lower.includes("проход")) return "freshwater";
  return "freshwater";
}

function habitatLabel(category: string) {
  const lower = category.toLowerCase();
  if (lower.includes("каспий")) return "Каспийский бассейн";
  if (lower.includes("морск")) return "Морская рыба";
  if (lower.includes("проход")) return "Проходная рыба";
  if (lower.includes("осетр") || lower.includes("осётр")) return "Осетровые";
  if (lower.includes("лосос")) return "Лососёвые";
  return "Пресная вода";
}

function recordBadge(fish: FishSpecies) {
  if (!fish.best_weight_grams) return null;
  return <span className="badge red">Рекорд</span>;
}

export function SpeciesTab({ species, onChanged, onAddTrophy }: { species: FishSpecies[]; onChanged: () => void; onAddTrophy: () => void }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const caughtCount = species.filter((fish) => fish.caught_status !== "uncaught").length;

  const filtered = useMemo(() => {
    if (filter === "caught") return species.filter((fish) => fish.caught_status !== "uncaught");
    if (filter === "uncaught") return species.filter((fish) => fish.caught_status === "uncaught");
    if (filter === "freshwater") return species.filter((fish) => categoryArea(fish.category) === "freshwater");
    if (filter === "caspian") return species.filter((fish) => categoryArea(fish.category) === "caspian");
    if (filter === "marine") return species.filter((fish) => categoryArea(fish.category) === "marine");
    return species;
  }, [filter, species]);

  const grouped = filtered.reduce<Record<string, FishSpecies[]>>((acc, fish) => {
    acc[fish.category] = acc[fish.category] ?? [];
    acc[fish.category].push(fish);
    return acc;
  }, {});

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
    <div className="stack">
      <section className="card compact-card">
        <div className="section-title" style={{ margin: 0 }}>
          <div>
            <h2>Виды рыб</h2>
            <p className="muted small-text">Отмечай старые виды, даже если нет фото и даты.</p>
          </div>
          <span className="badge ok">{caughtCount} / {species.length}</span>
        </div>
      </section>

      <div className="filters">
        {filters.map((item) => (
          <button key={item.key} className={`chip ${filter === item.key ? "active" : ""}`} onClick={() => setFilter(item.key)} type="button">
            {item.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? <div className="empty">Тут пока пусто.</div> : null}

      {Object.entries(grouped).map(([category, items]) => (
        <section key={category} className="stack species-group">
          <div className="section-title slim-title">
            <h2>{category}</h2>
            <span className="badge">{items.length}</span>
          </div>
          <div className="fish-list">
            {items.map((fish) => {
              const isCaught = fish.caught_status !== "uncaught";
              const hasTrophy = fish.trophy_count > 0;

              return (
                <article className="fish-row" key={fish.id}>
                  <FishImage name={fish.name} imageUrl={fish.image_url} />
                  <div className="fish-info">
                    <div className="fish-name">{fish.name}</div>
                    <div className="muted tiny-text">{habitatLabel(fish.category)}</div>
                    <div className="fish-status-line">
                      {hasTrophy ? <span className="badge ok">{fish.trophy_count} трофей</span> : <SpeciesBadge status={fish.caught_status} />}
                      {recordBadge(fish)}
                    </div>
                    {hasTrophy && (
                      <div className="muted small-text fish-stats">
                        {formatWeight(fish.best_weight_grams)} · {formatLength(fish.best_length_cm)}
                      </div>
                    )}
                  </div>
                  <div className="species-actions">
                    {isCaught ? (
                      <button
                        className="species-action caught"
                        disabled={pendingId === fish.id || fish.trophy_count > 0}
                        onClick={() => mark(fish, false)}
                        type="button"
                        title={fish.trophy_count > 0 ? "Сначала удали трофеи этого вида" : "Убрать отметку"}
                      >
                        <AppIcon name="check" size={13} />
                        Поймана
                      </button>
                    ) : (
                      <button className="species-action mark" disabled={pendingId === fish.id} onClick={() => mark(fish, true)} type="button">
                        Ловил
                      </button>
                    )}
                    <button className="species-action trophy" onClick={onAddTrophy} type="button">
                      <AppIcon name="plus" size={13} />
                      {hasTrophy ? "Ещё" : "Трофей"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
