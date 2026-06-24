"use client";

import { useMemo, useState } from "react";
import { AppIcon } from "@/components/AppIcon";
import { FishImage } from "@/components/FishImage";
import { api } from "@/lib/api";
import { formatDate, formatLength, formatWeight } from "@/lib/format";
import type { Trophy } from "@/types/domain";

type Filter = "all" | "weight" | "length" | "date";

const filters: Array<{ key: Filter; label: string }> = [
  { key: "all", label: "Все" },
  { key: "weight", label: "По весу" },
  { key: "length", label: "По длине" },
  { key: "date", label: "По дате" },
];

function trophyTitle(trophy: Trophy) {
  return trophy.species?.name ?? "Рыба";
}

function normalized(value?: string | null) {
  return (value ?? "").trim().toLowerCase().replaceAll("ё", "е");
}

function TrophyArt({ trophy }: { trophy: Trophy }) {
  if (trophy.photo_url) return <img src={trophy.photo_url} alt={trophyTitle(trophy)} loading="lazy" />;
  return <FishImage name={trophy.species?.name} imageUrl={trophy.species?.image_url} />;
}

export function TrophiesTab({
  trophies,
  onAddTrophy,
  onEditTrophy,
  onChanged,
}: {
  trophies: Trophy[];
  onAddTrophy: () => void;
  onEditTrophy: (trophy: Trophy) => void;
  onChanged: () => void;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const visibleTrophies = useMemo(() => {
    const search = normalized(query);
    const result = trophies.filter((trophy) => {
      if (!search) return true;
      const haystack = normalized([
        trophy.species?.name,
        trophy.species?.category,
        trophy.place_name,
        trophy.bait,
        trophy.note,
        trophy.visibility,
      ].filter(Boolean).join(" "));
      return haystack.includes(search);
    });

    if (filter === "weight") return result.sort((a, b) => (b.weight_grams ?? 0) - (a.weight_grams ?? 0));
    if (filter === "length") return result.sort((a, b) => (b.length_cm ?? 0) - (a.length_cm ?? 0));
    if (filter === "date") return result.sort((a, b) => String(b.date_caught ?? b.created_at).localeCompare(String(a.date_caught ?? a.created_at)));
    return result;
  }, [filter, query, trophies]);

  async function deleteTrophy(trophy: Trophy) {
    const name = trophy.species?.name ?? "этот трофей";
    const confirmed = window.confirm(`Удалить ${name}? Это действие нельзя отменить.`);
    if (!confirmed) return;

    setDeletingId(trophy.id);
    try {
      await api(`/api/trophies?id=${encodeURIComponent(trophy.id)}`, { method: "DELETE" });
      await onChanged();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Не удалось удалить трофей");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="page-screen trophy-page">
      <section className="page-topbar">
        <div>
          <h1>Трофеи</h1>
          <p>Фото, вес, длина, место и дата улова.</p>
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
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Найти трофей, место или приманку" autoFocus />
          {query ? <button type="button" onClick={() => setQuery("")}>×</button> : null}
        </label>
      ) : null}

      <div className="filters premium-filters" aria-label="Фильтры трофеев">
        {filters.map((item) => (
          <button key={item.key} className={`chip ${filter === item.key ? "active" : ""}`} onClick={() => setFilter(item.key)} type="button">
            {item.label}
          </button>
        ))}
      </div>

      <button className="premium-add-row" type="button" onClick={onAddTrophy}>
        <span><AppIcon name="plus" size={22} /></span>
        <b>Добавить трофей</b>
      </button>

      {visibleTrophies.length === 0 ? (
        <div className="empty premium-empty">Ничего не найдено. Попробуй другой поиск или добавь новый трофей.</div>
      ) : (
        <div className="premium-list trophy-scroll-list">
          {visibleTrophies.map((trophy) => (
            <article className="premium-row trophy-premium-row" key={trophy.id}>
              <div className="premium-fish-art trophy-row-art">
                <TrophyArt trophy={trophy} />
              </div>
              <div className="premium-row-main">
                <div className="premium-row-titleline">
                  <h2>{trophyTitle(trophy)}</h2>
                </div>
                <div className="premium-row-meta">
                  <span><AppIcon name="weight" size={14} />{formatWeight(trophy.weight_grams)}</span>
                  {trophy.length_cm ? <span><AppIcon name="ruler" size={14} />{formatLength(trophy.length_cm)}</span> : null}
                </div>
                <div className="premium-row-place">
                  {trophy.place_name ? trophy.show_place ? trophy.place_name : "место скрыто" : "Место не указано"}
                </div>
                <div className="premium-row-date">{formatDate(trophy.date_caught)}</div>
                <div className="premium-inline-actions">
                  <button className="glass-mini-btn" onClick={() => onEditTrophy(trophy)} type="button">
                    <AppIcon name="edit" size={14} />Изменить
                  </button>
                  <button className="glass-mini-btn danger" disabled={deletingId === trophy.id} onClick={() => deleteTrophy(trophy)} type="button">
                    <AppIcon name="trash" size={14} />{deletingId === trophy.id ? "Удаляю" : "Удалить"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
