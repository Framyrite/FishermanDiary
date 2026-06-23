"use client";

import { initials } from "@/lib/format";
import type { FriendSummary, ProfileStats, UserProfile } from "@/types/domain";

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
  onAddTrophy,
  onGoSpecies,
}: {
  user: UserProfile;
  stats: ProfileStats;
  friends: FriendSummary[];
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
      <section className="card">
        <div className="header" style={{ marginBottom: 12 }}>
          <div className="brand">
            <div className="avatar">
              {user.avatar_url ? <img src={user.avatar_url} alt="" /> : initials(user.first_name ?? user.username)}
            </div>
            <div>
              <h1>{user.first_name || user.username || "Рыбак"}</h1>
              <p>@{user.username || "telegram"}</p>
            </div>
          </div>
        </div>

        <div className="grid-2">
          <div className="stat">
            <div className="value">
              {stats.caught_species_count} / {stats.species_total}
            </div>
            <div className="label">видов поймано</div>
          </div>
          <div className="stat">
            <div className="value">{stats.trophies_count}</div>
            <div className="label">трофеев</div>
          </div>
          <div className="stat">
            <div className="value">{stats.records_count}</div>
            <div className="label">рекордов</div>
          </div>
          <div className="stat">
            <div className="value">🏆</div>
            <div className="label">{stats.best_trophy ?? "трофеев пока нет"}</div>
          </div>
        </div>

        <div className="grid-2" style={{ marginTop: 14 }}>
          <button className="btn" onClick={onAddTrophy} type="button">
            + Трофей
          </button>
          <button className="btn secondary" onClick={onGoSpecies} type="button">
            Отметить вид
          </button>
        </div>
      </section>

      <section className="card stack">
        <div className="section-title" style={{ margin: 0 }}>
          <h2>Друзья</h2>
          <span className="badge">{friends.length}</span>
        </div>
        <button className="btn secondary" onClick={copyInvite} type="button">
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
