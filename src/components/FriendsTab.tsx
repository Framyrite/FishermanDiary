"use client";

import { useState } from "react";
import { AppIcon } from "@/components/AppIcon";
import { initials } from "@/lib/format";
import type { FriendSummary, UserProfile } from "@/types/domain";

function inviteLink(userId: string) {
  const bot = process.env.NEXT_PUBLIC_BOT_USERNAME;
  const app = process.env.NEXT_PUBLIC_APP_SHORT_NAME;
  if (bot && app) return `https://t.me/${bot}/${app}?startapp=friend_${userId}`;
  if (typeof window !== "undefined") return `${window.location.origin}?friend=${userId}`;
  return "";
}

function normalizeBestTrophy(value?: string | null) {
  return value?.replace(/\s+—\s+/g, " – ") ?? null;
}

export function FriendsTab({ user, friends }: { user: UserProfile; friends: FriendSummary[] }) {
  const [activeTab, setActiveTab] = useState<"friends" | "requests">("friends");

  async function copyInvite() {
    const link = inviteLink(user.id);
    await navigator.clipboard.writeText(link);
    alert("Ссылка для друга скопирована");
  }

  const rating = friends.slice(0, 20);

  return (
    <div className="page-screen friends-page">
      <section className="page-topbar">
        <div>
          <h1>Друзья</h1>
          <p>Соревнуйся по трофеям, видам и рекордам.</p>
        </div>
      </section>

      <section className="friends-invite-card">
        <div className="friends-invite-icon">
          <AppIcon name="friends" size={44} />
        </div>
        <div>
          <h2>Пригласить друга</h2>
          <p>Поделись ссылкой и ловите вместе.</p>
          <button className="invite-premium-btn" onClick={copyInvite} type="button">
            <AppIcon name="copy" size={15} />Пригласить
          </button>
        </div>
      </section>

      <div className="friends-tabs" role="tablist" aria-label="Друзья и запросы">
        <button className={activeTab === "friends" ? "active" : ""} onClick={() => setActiveTab("friends")} type="button">Друзья</button>
        <button className={activeTab === "requests" ? "active" : ""} onClick={() => setActiveTab("requests")} type="button">Запросы</button>
      </div>

      {activeTab === "friends" ? (
        rating.length === 0 ? (
          <div className="empty premium-empty">Друзей пока нет. Скинь инвайт тем, с кем рыбачишь.</div>
        ) : (
          <div className="premium-list friends-rating-list">
            {rating.map((friend, index) => (
              <article className="friend-rating-row" key={friend.id}>
                <div className="avatar friend-rating-avatar">
                  {friend.avatar_url ? <img src={friend.avatar_url} alt="" /> : initials(friend.first_name ?? friend.username)}
                </div>
                <div className="friend-rating-main">
                  <h2>{friend.first_name || friend.username || "Рыбак"}</h2>
                  <p>{friend.trophies_count} трофеев · {friend.caught_species_count} видов</p>
                  {friend.best_trophy ? <span>Рекорд: {normalizeBestTrophy(friend.best_trophy)}</span> : <span>Рекорд пока не указан</span>}
                </div>
                <div className={`friend-place place-${index + 1}`}>
                  <AppIcon name="trophy" size={24} />
                  <b>{index + 1}</b>
                  <span>место</span>
                </div>
              </article>
            ))}
          </div>
        )
      ) : (
        <div className="requests-panel">
          <div className="empty premium-empty">Запросов пока нет. Когда кто-то перейдёт по твоей ссылке, заявка появится здесь.</div>
        </div>
      )}
    </div>
  );
}
