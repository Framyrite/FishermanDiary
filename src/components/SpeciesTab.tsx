"use client";

import { useMemo, useState } from "react";
import { api } from "@/lib/api";
import { formatLength, formatWeight } from "@/lib/format";
import type { FishSpecies } from "@/types/domain";
import { SpeciesBadge } from "@/components/SpeciesBadge";

type Filter = "all" | "caught" | "uncaught";

export function SpeciesTab({ species, onChanged, onAddTrophy }: { species: FishSpecies[]; onChanged: () => void; onAddTrophy: () => void }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const caughtCount = species.filter((fish) => fish.caught_status !== "uncaught").length;

  const filtered = useMemo(() => {
    if (filter === "caught") return species.filter((fish) => fish.caught_status !== "uncaught");
    if (filter === "uncaught") return species.filter((fish) => fish.caught_status === "uncaught");
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
      <section className="card">
        <div className="section-title" style={{ margin: 0 }}>
          <h2>Коллекция видов</h2>
          <span className="badge ok">{caughtCount} / {species.length}</span>
        </div>
        <p className="muted small-text">Тут можно вручную отметить старые виды, даже если нет фото и даты.</p>
      </section>

      <div className="filters">
        <button className={`chip ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")} type="button">Все</button>
        <button className={`chip ${filter === "caught" ? "active" : ""}`} onClick={() => setFilter("caught")} type="button">Пойманные</button>
        <button className={`chip ${filter === "uncaught" ? "active" : ""}`} onClick={() => setFilter("uncaught")} type="button">Не пойманные</button>
      </div>

      {Object.entries(grouped).map(([category, items]) => (
        <section key={category} className="stack">
          <div className="section-title">
            <h2>{category}</h2>
            <span className="badge">{items.length}</span>
          </div>
          <div className="fish-list">
            {items.map((fish) => (
              <div className="fish-row" key={fish.id}>
                <div className="fish-art">{fish.image_url ? <img src={fish.image_url} alt="" /> : "🐟"}</div>
                <div>
                  <div className="fish-name">{fish.name}</div>
                  <SpeciesBadge status={fish.caught_status} />
                  {fish.trophy_count > 0 && (
                    <div className="muted small-text" style={{ marginTop: 6 }}>
                      Трофеев: {fish.trophy_count} · лучший вес: {formatWeight(fish.best_weight_grams)} · длина: {formatLength(fish.best_length_cm)}
                    </div>
                  )}
                </div>
                <div className="stack">
                  {fish.caught_status === "uncaught" ? (
                    <button className="btn small" disabled={pendingId === fish.id} onClick={() => mark(fish, true)} type="button">Ловил</button>
                  ) : (
                    <button className="btn secondary small" disabled={pendingId === fish.id || fish.trophy_count > 0} onClick={() => mark(fish, false)} type="button">Убрать</button>
                  )}
                  <button className="btn ghost small" onClick={onAddTrophy} type="button">+ трофей</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
