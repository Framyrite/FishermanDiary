"use client";

import { useState } from "react";
import { AppIcon } from "@/components/AppIcon";
import { FishImage } from "@/components/FishImage";
import { api } from "@/lib/api";
import { formatDate, formatLength, formatWeight } from "@/lib/format";
import type { Trophy } from "@/types/domain";

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
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function deleteTrophy(trophy: Trophy) {
    const name = trophy.species?.name ?? "этот трофей";
    const confirmed = window.confirm(`Удалить ${name}? Это действие нельзя отменить.`);

    if (!confirmed) return;

    setDeletingId(trophy.id);

    try {
      await api(`/api/trophies?id=${encodeURIComponent(trophy.id)}`, {
        method: "DELETE",
      });
      await onChanged();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Не удалось удалить трофей");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="stack">
      <section className="card compact-card">
        <div className="section-title" style={{ margin: 0 }}>
          <div>
            <h2>Трофеи</h2>
            <p className="muted small-text">Конкретные поимки: фото, вес, дата, место, приманка.</p>
          </div>
          <span className="badge gold">{trophies.length}</span>
        </div>
        <button className="btn full" onClick={onAddTrophy} type="button">
          <AppIcon name="plus" size={17} />
          Добавить трофей
        </button>
      </section>

      {trophies.length === 0 ? (
        <div className="empty">Трофеев пока нет. Добавь первую рыбу с фоткой или просто весом.</div>
      ) : (
        <div className="trophy-list">
          {trophies.map((trophy) => (
            <article className="trophy-list-row" key={trophy.id}>
              <div className="trophy-thumb">
                {trophy.photo_url ? (
                  <img src={trophy.photo_url} alt={trophy.species?.name ?? "Трофей"} />
                ) : (
                  <FishImage name={trophy.species?.name} imageUrl={trophy.species?.image_url} />
                )}
              </div>
              <div className="trophy-content">
                <div className="trophy-row-top">
                  <div>
                    <div className="trophy-row-title">{trophy.species?.name ?? "Рыба"}</div>
                    <div className="trophy-row-meta">
                      {formatWeight(trophy.weight_grams)}
                      {trophy.length_cm ? ` · ${formatLength(trophy.length_cm)}` : ""}
                      <br />
                      {formatDate(trophy.date_caught)}
                      {trophy.place_name ? ` · ${trophy.show_place ? trophy.place_name : "место скрыто"}` : ""}
                    </div>
                  </div>
                  <span className="badge gold">{formatWeight(trophy.weight_grams)}</span>
                </div>

                <div className="trophy-meta">
                  {trophy.bait ? <span className="meta-pill"><AppIcon name="bait" size={13} />{trophy.bait}</span> : null}
                  <span className="meta-pill"><AppIcon name="eye" size={13} />{trophy.visibility === "private" ? "только я" : trophy.visibility === "friends" ? "друзья" : "по ссылке"}</span>
                </div>

                {trophy.note && <p className="trophy-note">{trophy.note}</p>}

                <div className="trophy-actions glass-actions">
                  <button className="trophy-action edit" onClick={() => onEditTrophy(trophy)} type="button">
                    <AppIcon name="edit" size={15} />
                    Изменить
                  </button>
                  <button
                    className="trophy-action danger"
                    disabled={deletingId === trophy.id}
                    onClick={() => deleteTrophy(trophy)}
                    type="button"
                  >
                    <AppIcon name="trash" size={15} />
                    {deletingId === trophy.id ? "Удаляю..." : "Удалить"}
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
