"use client";

import { useMemo, useState } from "react";
import { AppIcon } from "@/components/AppIcon";
import { FishImage } from "@/components/FishImage";
import { initials, formatDate, formatLength, formatWeight } from "@/lib/format";
import type { ProfileStats, Trophy, UserProfile } from "@/types/domain";

const FISHING_WISHES = [
  "Ни хвоста, ни чешуи. Сегодня отличный день для трофея.",
  "Пусть клюёт уверенно, а сходов будет ноль.",
  "Проверь снасти и не забудь фото трофея в дневник.",
  "Хорошего клёва и тихой воды.",
  "Большая рыба любит терпеливых. Сегодня твой день.",
];

function displayName(user: UserProfile) {
  return user.first_name || user.username || "Рыбак";
}

function telegramHandle(user: UserProfile) {
  return user.username ? `@${user.username}` : "Telegram-профиль";
}

function normalizeBestTrophy(value?: string | null) {
  return value?.replace(/\s+—\s+/g, " – ") ?? null;
}

function trophyTitle(trophy: Trophy) {
  return trophy.species?.name ?? "Рыба";
}

function TrophyArt({ trophy, className = "" }: { trophy: Trophy; className?: string }) {
  const title = trophyTitle(trophy);

  if (trophy.photo_url) {
    return <img className={className} src={trophy.photo_url} alt={title} loading="lazy" />;
  }

  return <FishImage className={className} name={trophy.species?.name} imageUrl={trophy.species?.image_url} />;
}

function FishStage({ trophy, variant = "thumb" }: { trophy: Trophy; variant?: "hero" | "thumb" | "row" }) {
  return (
    <div className={`fish-stage fish-stage-${variant}`}>
      <TrophyArt trophy={trophy} className="fish-art-layer" />
    </div>
  );
}

function StatCard({ icon, value, label, onClick }: { icon: "trophy" | "fish" | "star"; value: number; label: string; onClick?: () => void }) {
  const content = (
    <>
      <span className="home-stat-icon"><AppIcon name={icon} size={27} /></span>
      <strong>{value}</strong>
      <span>{label}</span>
    </>
  );

  if (onClick) {
    return (
      <button className="home-stat-card home-stat-button" type="button" onClick={onClick}>
        {content}
      </button>
    );
  }

  return <div className="home-stat-card">{content}</div>;
}

function RecentCatchCard({ trophy }: { trophy: Trophy }) {
  return (
    <article className="home-recent-card">
      <FishStage trophy={trophy} />
      <div className="home-recent-name">{trophyTitle(trophy)}</div>
      <div className="home-recent-meta">{formatWeight(trophy.weight_grams)}</div>
    </article>
  );
}

export function ProfileTab({
  user,
  stats,
  latestTrophy,
  recentTrophies = [],
  onAddTrophy,
  onGoSpecies,
}: {
  user: UserProfile;
  stats: ProfileStats;
  latestTrophy?: Trophy | null;
  recentTrophies?: Trophy[];
  onAddTrophy: () => void;
  onGoSpecies: () => void;
}) {
  const bestTrophy = normalizeBestTrophy(stats.best_trophy);
  const displayedRecentTrophies = recentTrophies.slice(0, 7);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const notice = useMemo(() => FISHING_WISHES[Math.floor(Math.random() * FISHING_WISHES.length)], [noticeOpen]);

  return (
    <div className="home-screen">
      <section className="home-welcome" aria-label="Профиль рыбака">
        <div className="home-user">
          <div className="avatar home-avatar">
            {user.avatar_url ? <img src={user.avatar_url} alt="" /> : initials(user.first_name ?? user.username)}
          </div>
          <div className="home-user-copy">
            <h1>Привет, {displayName(user)}!</h1>
            <p>{telegramHandle(user)}</p>
          </div>
        </div>
        <div className="home-notice-wrap">
          <button className="home-icon-button" type="button" aria-label="Уведомления" onClick={() => setNoticeOpen((value) => !value)}>
            <AppIcon name="bell" size={22} />
          </button>
          {noticeOpen ? (
            <div className="home-notice-popover" role="status">
              <b>Удачной рыбалки</b>
              <p>{notice}</p>
              <span>Позже тут будут заявки в друзья и события дневника.</span>
            </div>
          ) : null}
        </div>
      </section>

      <section className="home-stats" aria-label="Статистика">
        <StatCard icon="trophy" value={stats.trophies_count} label="Трофеев" />
        <StatCard icon="fish" value={stats.caught_species_count} label="Видов рыб" onClick={onGoSpecies} />
        <StatCard icon="star" value={stats.records_count} label="Рекордов" />
      </section>

      <section className="home-hero-card" aria-label="Последний трофей">
        <div className="home-section-head">
          <h2>Последний трофей</h2>
          {latestTrophy ? <span>Свежий улов</span> : null}
        </div>

        {latestTrophy ? (
          <article className="home-trophy-hero">
            <div className="home-trophy-copy">
              <h3>{trophyTitle(latestTrophy)}</h3>
              <div className="home-trophy-facts">
                <span><AppIcon name="weight" size={16} />{formatWeight(latestTrophy.weight_grams)}</span>
                {latestTrophy.length_cm ? <span><AppIcon name="ruler" size={16} />{formatLength(latestTrophy.length_cm)}</span> : null}
                {latestTrophy.place_name ? <span><AppIcon name="place" size={16} />{latestTrophy.place_name}</span> : null}
                <span><AppIcon name="calendar" size={16} />{formatDate(latestTrophy.date_caught)}</span>
              </div>
              {bestTrophy ? <p className="home-best-line">Лучший трофей: {bestTrophy}</p> : null}
            </div>
            <FishStage trophy={latestTrophy} variant="hero" />
          </article>
        ) : (
          <div className="home-empty-hero">
            <p>Трофеев пока нет.</p>
            <button className="btn" type="button" onClick={onAddTrophy}>Добавить первый трофей</button>
          </div>
        )}
      </section>

      <section className="home-recent-section" aria-label="Недавние уловы">
        <div className="home-section-head">
          <h2>Недавние уловы</h2>
          <button className="home-text-button" type="button" onClick={onAddTrophy}>Смотреть все</button>
        </div>

        <div className="home-recent-grid">
          <button className="home-add-card" type="button" onClick={onAddTrophy}>
            <span><AppIcon name="plus" size={24} /></span>
            <b>Добавить<br />трофей</b>
          </button>
          {displayedRecentTrophies.map((trophy) => (
            <RecentCatchCard key={trophy.id} trophy={trophy} />
          ))}
        </div>
      </section>
    </div>
  );
}
