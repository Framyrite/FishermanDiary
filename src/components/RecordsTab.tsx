"use client";

import { formatDate, formatLength, formatWeight } from "@/lib/format";
import type { RecordItem } from "@/types/domain";

export function RecordsTab({ records }: { records: RecordItem[] }) {
  return (
    <div className="stack">
      <section className="card">
        <div className="section-title" style={{ margin: 0 }}>
          <h2>Рекорды</h2>
          <span className="badge gold">{records.length}</span>
        </div>
        <p className="muted small-text">Сюда попадают только трофеи с указанным весом. Ручные отметки без веса не считаются рекордами.</p>
      </section>

      {records.length === 0 ? (
        <div className="empty">Рекордов пока нет. Добавь трофей с весом.</div>
      ) : (
        records.map((record, index) => (
          <article className="fish-row" key={record.trophy_id}>
            <div className="fish-art">{record.photo_url ? <img src={record.photo_url} alt="" /> : index === 0 ? "🥇" : "🏆"}</div>
            <div>
              <div className="fish-name">{record.species_name}</div>
              <div className="muted small-text">{record.category} · {formatDate(record.date_caught)}</div>
              <div className="trophy-meta">
                <span className="badge gold">{formatWeight(record.best_weight_grams)}</span>
                {record.best_length_cm ? <span className="badge">📏 {formatLength(record.best_length_cm)}</span> : null}
              </div>
            </div>
            <div className="badge">#{index + 1}</div>
          </article>
        ))
      )}
    </div>
  );
}
