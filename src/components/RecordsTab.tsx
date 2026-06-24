"use client";

import { useMemo, useState } from "react";
import { AppIcon } from "@/components/AppIcon";
import { FishImage } from "@/components/FishImage";
import { formatDate, formatLength, formatWeight } from "@/lib/format";
import type { RecordItem } from "@/types/domain";

type Filter = "weight" | "length" | "species";

const filters: Array<{ key: Filter; label: string }> = [
  { key: "weight", label: "По весу" },
  { key: "length", label: "По длине" },
  { key: "species", label: "По виду" },
];

function medalClass(index: number) {
  if (index === 0) return "gold";
  if (index === 1) return "silver";
  if (index === 2) return "bronze";
  return "plain";
}

export function RecordsTab({ records }: { records: RecordItem[] }) {
  const [filter, setFilter] = useState<Filter>("weight");

  const sortedRecords = useMemo(() => {
    const result = [...records];
    if (filter === "length") return result.sort((a, b) => (b.best_length_cm ?? 0) - (a.best_length_cm ?? 0));
    if (filter === "species") return result.sort((a, b) => a.species_name.localeCompare(b.species_name, "ru"));
    return result.sort((a, b) => (b.best_weight_grams ?? 0) - (a.best_weight_grams ?? 0));
  }, [filter, records]);

  const bestWeight = sortedRecords.reduce<RecordItem | null>((best, item) => {
    if (!best) return item;
    return (item.best_weight_grams ?? 0) > (best.best_weight_grams ?? 0) ? item : best;
  }, null);

  const bestLength = sortedRecords.reduce<RecordItem | null>((best, item) => {
    if (!best) return item;
    return (item.best_length_cm ?? 0) > (best.best_length_cm ?? 0) ? item : best;
  }, null);

  return (
    <div className="page-screen records-page">
      <section className="page-topbar">
        <div>
          <h1>Рекорды</h1>
          <p>Лучшие трофеи по весу и длине.</p>
        </div>
      </section>

      <div className="filters premium-filters" aria-label="Фильтры рекордов">
        {filters.map((item) => (
          <button key={item.key} className={`chip ${filter === item.key ? "active" : ""}`} onClick={() => setFilter(item.key)} type="button">
            {item.label}
          </button>
        ))}
      </div>

      {sortedRecords.length === 0 ? (
        <div className="empty premium-empty">Рекордов пока нет. Добавь трофей с весом.</div>
      ) : (
        <>
          <div className="premium-list records-list">
            {sortedRecords.slice(0, 6).map((record, index) => (
              <article className="premium-row record-premium-row" key={record.trophy_id}>
                <div className={`record-medal ${medalClass(index)}`}>
                  <b>{index + 1}</b>
                </div>
                <div className="premium-fish-art record-row-art">
                  <FishImage name={record.species_name} imageUrl={record.photo_url} />
                </div>
                <div className="premium-row-main">
                  <h2>{record.species_name}</h2>
                  <div className="record-main-weight">{formatWeight(record.best_weight_grams)}</div>
                  <div className="premium-row-meta">
                    {record.best_length_cm ? <span><AppIcon name="ruler" size={14} />{formatLength(record.best_length_cm)}</span> : null}
                    <span>{formatDate(record.date_caught)}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="record-summary-grid">
            <article className="record-summary-card">
              <AppIcon name="weight" size={31} />
              <span>Общий рекорд по весу</span>
              <b>{formatWeight(bestWeight?.best_weight_grams)}</b>
              <small>{bestWeight?.species_name ?? "—"}</small>
            </article>
            <article className="record-summary-card">
              <AppIcon name="ruler" size={31} />
              <span>Общий рекорд по длине</span>
              <b>{formatLength(bestLength?.best_length_cm)}</b>
              <small>{bestLength?.species_name ?? "—"}</small>
            </article>
          </div>
        </>
      )}
    </div>
  );
}
