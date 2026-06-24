import { AppIcon, type AppIconName } from "@/components/AppIcon";

export type TabKey = "profile" | "trophies" | "species" | "records";

const tabs: Array<{ key: TabKey; label: string; icon: AppIconName }> = [
  { key: "profile", label: "Профиль", icon: "profile" },
  { key: "trophies", label: "Трофеи", icon: "trophy" },
  { key: "species", label: "Виды", icon: "fish" },
  { key: "records", label: "Рекорды", icon: "records" },
];

export function BottomNav({ active, onChange }: { active: TabKey; onChange: (tab: TabKey) => void }) {
  return (
    <nav className="tabs" aria-label="Главные вкладки">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`tab ${active === tab.key ? "active" : ""}`}
          onClick={() => onChange(tab.key)}
          type="button"
        >
          <span className="icon"><AppIcon name={tab.icon} size={20} /></span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
