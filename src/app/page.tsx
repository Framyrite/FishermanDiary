"use client";

import { useEffect, useState } from "react";
import { AddTrophyForm } from "@/components/AddTrophyForm";
import { BottomNav, type TabKey } from "@/components/BottomNav";
import { FriendsTab } from "@/components/FriendsTab";
import { Modal } from "@/components/Modal";
import { ProfileTab } from "@/components/ProfileTab";
import { RecordsTab } from "@/components/RecordsTab";
import { SpeciesTab } from "@/components/SpeciesTab";
import { TrophiesTab } from "@/components/TrophiesTab";
import { api } from "@/lib/api";
import type { FishSpecies, FriendSummary, ProfileStats, RecordItem, Trophy, UserProfile } from "@/types/domain";

const APP_TITLE = "Дневник рыбака";
const APP_SUBTITLE = "Трофеи, виды и рекорды";
const ADD_TROPHY_TITLE = "Добавить трофей";
const EDIT_TROPHY_TITLE = "Изменить трофей";
const LOADING_TEXT = "Загружаю дневник...";
const START_ERROR_TEXT = "Не удалось запустить приложение";
const TRY_AGAIN_TEXT = "Попробовать снова";

function normalized(value?: string | null) {
  return (value ?? "").trim().toLowerCase().replaceAll("ё", "е");
}

function isCaspianName(name?: string | null) {
  const value = normalized(name);
  return value.includes("каспий") || ["вобла", "кутум", "шемая", "тюлька"].includes(value);
}

function isVisibleSpecies(fish: FishSpecies) {
  const category = normalized(fish.category);
  return !category.includes("каспий") && !isCaspianName(fish.name) && normalized(fish.name) !== "карась";
}

function isVisibleRecord(record: RecordItem) {
  const category = normalized(record.category);
  return !category.includes("каспий") && !isCaspianName(record.species_name) && normalized(record.species_name) !== "карась";
}

type MeResponse = {
  user: UserProfile;
  stats: ProfileStats;
  friends: FriendSummary[];
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [me, setMe] = useState<MeResponse | null>(null);
  const [species, setSpecies] = useState<FishSpecies[]>([]);
  const [trophies, setTrophies] = useState<Trophy[]>([]);
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTrophyModal, setShowTrophyModal] = useState(false);
  const [editingTrophy, setEditingTrophy] = useState<Trophy | null>(null);

  async function auth() {
    const telegram = typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;
    telegram?.ready();
    telegram?.expand();

    const initData = telegram?.initData ?? "";

    await api("/api/auth/telegram", {
      method: "POST",
      body: JSON.stringify({ initData }),
    });
  }

  async function loadAll() {
    const [meData, speciesData, trophyData, recordData] = await Promise.all([
      api<MeResponse>("/api/me"),
      api<{ species: FishSpecies[] }>("/api/species"),
      api<{ trophies: Trophy[] }>("/api/trophies"),
      api<{ records: RecordItem[] }>("/api/records"),
    ]);

    setMe(meData);
    setSpecies(speciesData.species);
    setTrophies(trophyData.trophies);
    setRecords(recordData.records);
  }

  useEffect(() => {
    async function boot() {
      try {
        setLoading(true);
        setError(null);
        await auth();
        await loadAll();
      } catch (err) {
        setError(err instanceof Error ? err.message : START_ERROR_TEXT);
      } finally {
        setLoading(false);
      }
    }

    boot();
  }, []);

  function openAddTrophy() {
    setEditingTrophy(null);
    setShowTrophyModal(true);
  }

  function closeTrophyModal() {
    setEditingTrophy(null);
    setShowTrophyModal(false);
  }

  async function refreshAndCloseTrophyModal() {
    await loadAll();
    closeTrophyModal();
    setActiveTab("trophies");
  }

  if (loading) {
    return (
      <main className="loader">
        <div>
          <div className="logo" style={{ margin: "0 auto 14px" }}>🐟</div>
          <h1>{APP_TITLE}</h1>
          <p className="muted">{LOADING_TEXT}</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="loader">
        <div>
          <div className="logo" style={{ margin: "0 auto 14px" }}>🐟</div>
          <h1>{APP_TITLE}</h1>
          <p className="muted">{error}</p>
          <button className="btn" type="button" onClick={loadAll}>
            {TRY_AGAIN_TEXT}
          </button>
        </div>
      </main>
    );
  }

  if (!me) return null;

  const visibleSpecies = species.filter(isVisibleSpecies);

  return (
    <main className={`app-shell app-shell-${activeTab}`}>
      <header className="app-header">
        <div className="brand">
          <div className="logo">🐟</div>
          <div>
            <h1>{APP_TITLE}</h1>
            <p>{APP_SUBTITLE}</p>
          </div>
        </div>
      </header>

      {activeTab === "home" && (
        <ProfileTab
          user={me.user}
          stats={me.stats}
          latestTrophy={trophies[0] ?? null}
          recentTrophies={trophies.slice(0, 8)}
          onAddTrophy={openAddTrophy}
          onGoSpecies={() => setActiveTab("species")}
        />
      )}

      {activeTab === "trophies" && (
        <TrophiesTab
          trophies={trophies}
          onAddTrophy={openAddTrophy}
          onEditTrophy={(trophy) => {
            setShowTrophyModal(false);
            setEditingTrophy(trophy);
          }}
          onChanged={loadAll}
        />
      )}

      {activeTab === "species" && (
        <SpeciesTab
          species={visibleSpecies}
          onChanged={loadAll}
          onAddTrophy={openAddTrophy}
        />
      )}

      {activeTab === "records" && <RecordsTab records={records.filter(isVisibleRecord)} />}

      {activeTab === "friends" && <FriendsTab user={me.user} friends={me.friends} />}

      <BottomNav active={activeTab} onChange={setActiveTab} />

      {(showTrophyModal || editingTrophy) && (
        <Modal title={editingTrophy ? EDIT_TROPHY_TITLE : ADD_TROPHY_TITLE} onClose={closeTrophyModal}>
          <AddTrophyForm species={visibleSpecies} initialTrophy={editingTrophy} onCreated={refreshAndCloseTrophyModal} />
        </Modal>
      )}
    </main>
  );
}
