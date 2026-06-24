"use client";

import { FishImage } from "@/components/FishImage";
import { formatDate, formatLength, formatWeight } from "@/lib/format";
import type { RecordItem } from "@/types/domain";

export function RecordsTab({ records }: { records: RecordItem[] }) {
  return (
    <div className="stack">
      <section className="card compact-card">
        <div className="section-title" style={{ margin: 0 }}>
          <div>
            <h2>Рекорды</h2>
            <p className="muted small-text">Только трофеи с указанным весом. Ручные отметки не считаются рекордами.</p>
          </div>
          <span className="badge gold">{records.length}</span>
        </div>
      </section>

      {records.length === 0 ? (
        <div className="empty">Рекордов пока нет. Добавь трофей с весом.</div>
      ) : (
        <div className="fish-list">
          {records.map((record, index) => (
            <article className="record-row" key={record.trophy_id}>
              <FishImage name={record.species_name} imageUrl={record.photo_url} />
              <div className="fish-info">
                <div className="fish-name">{record.species_name}</div>
                <div className="muted tiny-text">{record.category} · {formatDate(record.date_caught)}</div>
                <div className="fish-status-line">
                  <span className="badge gold">{formatWeight(record.best_weight_grams)}</span>
                  {record.best_length_cm ? <span className="badge">{formatLength(record.best_length_cm)}</span> : null}
                </div>
              </div>
              <div className={`record-rank ${index === 0 ? "first" : ""}`}>#{index + 1}</div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
