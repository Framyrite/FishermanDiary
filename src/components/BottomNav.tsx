export type TabKey = "profile" | "trophies" | "species" | "records";

const tabs: Array<{ key: TabKey; label: string; icon: string }> = [
  { key: "profile", label: "Профиль", icon: "👤" },
  { key: "trophies", label: "Трофеи", icon: "🏆" },
  { key: "species", label: "Виды", icon: "🐟" },
  { key: "records", label: "Рекорды", icon: "📈" },
];

export function BottomNav({ active, onChange }: { active: TabKey; onChange: (tab: TabKey) => void }) {
  return (
    <nav className="tabs" aria-label="Главные вкладки">
      {tabs.map((tab) => (
        <button key={tab.key} className={`tab ${active === tab.key ? "active" : ""}`} onClick={() => onChange(tab.key)}>
          <span className="icon">{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
