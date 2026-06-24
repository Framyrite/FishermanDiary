"use client";

import { AppIcon } from "@/components/AppIcon";
import { FishImage } from "@/components/FishImage";
import { initials, formatDate, formatLength, formatWeight } from "@/lib/format";
import type { FriendSummary, ProfileStats, Trophy, UserProfile } from "@/types/domain";

function inviteLink(userId: string) {
  const bot = process.env.NEXT_PUBLIC_BOT_USERNAME;
  const app = process.env.NEXT_PUBLIC_APP_SHORT_NAME;
  if (bot && app) return `https://t.me/${bot}/${app}?startapp=friend_${userId}`;
  if (typeof window !== "undefined") return `${window.location.origin}?friend=${userId}`;
  return "";
}

export function ProfileTab({
  user,
  stats,
  friends,
  latestTrophy,
  onAddTrophy,
  onGoSpecies,
}: {
  user: UserProfile;
  stats: ProfileStats;
  friends: FriendSummary[];
  latestTrophy?: Trophy | null;
  onAddTrophy: () => void;
  onGoSpecies: () => void;
}) {
  async function copyInvite() {
    const link = inviteLink(user.id);
    await navigator.clipboard.writeText(link);
    alert("Ссылка для друга скопирована");
  }

  return (
    <div className="stack">
      <section className="card profile-card">
        <div className="profile-head">
          <div className="avatar xl-avatar">
            {user.avatar_url ? <img src={user.avatar_url} alt="" /> : initials(user.first_name ?? user.username)}
          </div>
          <div className="profile-name">
            <h1>{user.first_name || user.username || "Рыбак"}</h1>
            <p>@{user.username || "telegram"}</p>
          </div>
        </div>

        <div className="stat-row premium-stat-row">
          <div className="stat">
            <div className="value">{stats.trophies_count}</div>
            <div className="label">Трофеев</div>
          </div>
          <div className="stat">
            <div className="value">{stats.caught_species_count}</div>
            <div className="label">Видов поймано</div>
          </div>
          <div className="stat">
            <div className="value">{stats.records_count}</div>
            <div className="label">Рекордов</div>
          </div>
        </div>

        <div className="hero-trophy">
          <div className="hero-trophy-title">Последний трофей</div>
          {latestTrophy ? (
            <div className="hero-trophy-row">
              <div className="hero-trophy-photo">
                {latestTrophy.photo_url ? (
                  <img src={latestTrophy.photo_url} alt={latestTrophy.species?.name ?? "Трофей"} />
                ) : (
                  <FishImage name={latestTrophy.species?.name} imageUrl={latestTrophy.species?.image_url} />
                )}
              </div>
              <div>
                <div className="hero-trophy-name">{latestTrophy.species?.name ?? "Рыба"}</div>
                <div className="hero-trophy-meta">
                  {formatWeight(latestTrophy.weight_grams)}
                  {latestTrophy.length_cm ? ` · ${formatLength(latestTrophy.length_cm)}` : ""}
                  <br />
                  {formatDate(latestTrophy.date_caught)}
                  {latestTrophy.place_name ? ` · ${latestTrophy.place_name}` : ""}
                </div>
              </div>
            </div>
          ) : (
            <div className="muted small-text">Трофеев пока нет. Добавь первый улов.</div>
          )}
        </div>

        <div className="profile-actions">
          <button className="btn" onClick={onAddTrophy} type="button">
            <AppIcon name="plus" size={17} />
            Добавить трофей
          </button>
          <button className="btn secondary" onClick={onGoSpecies} type="button">
            Отметить вид
          </button>
        </div>
      </section>

      <section className="card stack friend-card">
        <div className="section-title" style={{ margin: 0 }}>
          <h2>Друзья</h2>
          <span className="badge">{friends.length}</span>
        </div>
        <button className="btn secondary full" onClick={copyInvite} type="button">
          Скопировать ссылку-приглашение
        </button>

        {friends.length === 0 ? (
          <div className="empty">Друзей пока нет. Скинь инвайт тем, с кем рыбачишь.</div>
        ) : (
          <div className="stack">
            {friends.map((friend) => (
              <div className="friend-row" key={friend.id}>
                <div className="avatar">
                  {friend.avatar_url ? <img src={friend.avatar_url} alt="" /> : initials(friend.first_name ?? friend.username)}
                </div>
                <div>
                  <b>{friend.first_name || friend.username || "Рыбак"}</b>
                  <div className="muted small-text">
                    Видов: {friend.caught_species_count} · Трофеев: {friend.trophies_count}
                  </div>
                  {friend.best_trophy && <div className="small-text">Лучший: {friend.best_trophy}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
