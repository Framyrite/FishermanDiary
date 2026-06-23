"use client";

import { formatDate, formatLength, formatWeight } from "@/lib/format";
import type { Trophy } from "@/types/domain";

export function TrophiesTab({ trophies, onAddTrophy }: { trophies: Trophy[]; onAddTrophy: () => void }) {
  return (
    <div className="stack">
      <section className="card">
        <div className="section-title" style={{ margin: 0 }}>
          <h2>Трофеи</h2>
          <span className="badge gold">{trophies.length}</span>
        </div>
        <p className="muted small-text">Конкретные поимки: фото, вес, дата, место, приманка.</p>
        <button className="btn" onClick={onAddTrophy} type="button" style={{ width: "100%" }}>
          + Добавить трофей
        </button>
      </section>

      {trophies.length === 0 ? (
        <div className="empty">Трофеев пока нет. Добавь первую рыбу с фоткой или просто весом.</div>
      ) : (
        trophies.map((trophy) => (
          <article className="card trophy-card" key={trophy.id}>
            <div className="trophy-photo">
              {trophy.photo_url ? <img src={trophy.photo_url} alt={trophy.species?.name ?? "Трофей"} /> : "🐟"}
            </div>
            <div className="trophy-body">
              <div className="trophy-title">
                <div>
                  <h3>{trophy.species?.name ?? "Рыба"}</h3>
                  <div className="muted small-text">{formatDate(trophy.date_caught)}</div>
                </div>
                <span className="badge gold">{formatWeight(trophy.weight_grams)}</span>
              </div>

              <div className="trophy-meta">
                {trophy.length_cm ? <span className="badge">📏 {formatLength(trophy.length_cm)}</span> : null}
                {trophy.place_name ? <span className="badge">📍 {trophy.show_place ? trophy.place_name : "место скрыто"}</span> : null}
                {trophy.bait ? <span className="badge">🎣 {trophy.bait}</span> : null}
                <span className="badge">👁 {trophy.visibility === "private" ? "только я" : trophy.visibility === "friends" ? "друзья" : "по ссылке"}</span>
              </div>

              {trophy.note && <p className="small-text">{trophy.note}</p>}
            </div>
          </article>
        ))
      )}
    </div>
  );
}
