"use client";

import { useCallback, useEffect, useState } from "react";
import { AddTrophyForm } from "@/components/AddTrophyForm";
import { BottomNav, type TabKey } from "@/components/BottomNav";
import { Modal } from "@/components/Modal";
import { ProfileTab } from "@/components/ProfileTab";
import { RecordsTab } from "@/components/RecordsTab";
import { SpeciesTab } from "@/components/SpeciesTab";
import { TrophiesTab } from "@/components/TrophiesTab";
import { api } from "@/lib/api";
import type { FishSpecies, FriendSummary, ProfileStats, RecordItem, Trophy, UserProfile } from "@/types/domain";

type MeResponse = { user: UserProfile; stats: ProfileStats; friends: FriendSummary[] };
type SpeciesResponse = { species: FishSpecies[] };
type TrophiesResponse = { trophies: Trophy[] };
type RecordsResponse = { records: RecordItem[] };

function getFriendIdFromLaunch() {
  if (typeof window === "undefined") return null;

  const params = new URLSearchParams(window.location.search);
  const direct = params.get("friend");
  if (direct) return direct;

  const startParam = window.Telegram?.WebApp?.initDataUnsafe?.start_param;
  if (startParam?.startsWith("friend_")) return startParam.replace("friend_", "");

  return null;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTrophyModal, setShowTrophyModal] = useState(false);

  const [me, setMe] = useState<MeResponse | null>(null);
  const [species, setSpecies] = useState<FishSpecies[]>([]);
  const [trophies, setTrophies] = useState<Trophy[]>([]);
  const [records, setRecords] = useState<RecordItem[]>([]);

  const loadAll = useCallback(async () => {
    const [meData, speciesData, trophiesData, recordsData] = await Promise.all([
      api<MeResponse>("/api/me"),
      api<SpeciesResponse>("/api/species"),
      api<TrophiesResponse>("/api/trophies"),
      api<RecordsResponse>("/api/records"),
    ]);

    setMe(meData);
    setSpecies(speciesData.species);
    setTrophies(trophiesData.trophies);
    setRecords(recordsData.records);
  }, []);

  useEffect(() => {
    async function boot() {
      try {
        setLoading(true);
        setError(null);

        const tg = window.Telegram?.WebApp;
        tg?.ready();
        tg?.expand();

        await api("/api/auth/telegram", {
          method: "POST",
          body: JSON.stringify({ initData: tg?.initData ?? "" }),
        });

        const friendId = getFriendIdFromLaunch();
        if (friendId) {
          await api("/api/friends/add", {
            method: "POST",
            body: JSON.stringify({ friendId }),
          }).catch(() => null);
        }

        await loadAll();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Не удалось запустить приложение");
      } finally {
        setLoading(false);
      }
    }

    boot();
  }, [loadAll]);

  async function refreshAndCloseTrophyModal() {
    await loadAll();
    setShowTrophyModal(false);
    setActiveTab("trophies");
  }

  if (loading) {
    return (
      <main className="loader">
        <div>
          <div className="logo" style={{ margin: "0 auto 14px" }}>🐟</div>
          <h1>Клюнуло</h1>
          <p className="muted">Готовлю твой рыбацкий профиль...</p>
        </div>
      </main>
    );
  }

  if (error || !me) {
    return (
      <main className="app-shell">
        <div className="card stack">
          <div className="logo">🐟</div>
          <h1>Не запустилось</h1>
          <div className="error">{error ?? "Нет данных профиля"}</div>
          <p className="muted small-text">
            Если ты запускаешь локально — проверь .env.local и NEXT_PUBLIC_DEV_MODE=true. Если из Telegram — проверь TELEGRAM_BOT_TOKEN и настройки mini app.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="header">
        <div className="brand">
          <div className="logo">🐟</div>
          <div>
            <h1>Клюнуло</h1>
            <p>Трофейник рыбака</p>
          </div>
        </div>
        <span className="badge">MVP</span>
      </header>

      {activeTab === "profile" && (
        <ProfileTab
          user={me.user}
          stats={me.stats}
          friends={me.friends}
          onAddTrophy={() => setShowTrophyModal(true)}
          onGoSpecies={() => setActiveTab("species")}
        />
      )}

      {activeTab === "trophies" && <TrophiesTab trophies={trophies} onAddTrophy={() => setShowTrophyModal(true)} />}

      {activeTab === "species" && (
        <SpeciesTab species={species} onChanged={loadAll} onAddTrophy={() => setShowTrophyModal(true)} />
      )}

      {activeTab === "records" && <RecordsTab records={records} />}

      <BottomNav active={activeTab} onChange={setActiveTab} />

      {showTrophyModal && (
        <Modal title="Добавить трофей" onClose={() => setShowTrophyModal(false)}>
          <AddTrophyForm species={species} onCreated={refreshAndCloseTrophyModal} />
        </Modal>
      )}
    </main>
  );
}
