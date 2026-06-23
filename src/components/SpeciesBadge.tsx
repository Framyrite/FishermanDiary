import type { CaughtStatus } from "@/types/domain";

export function SpeciesBadge({ status }: { status: CaughtStatus }) {
  if (status === "caught_both") return <span className="badge ok">✅ Поймана + трофей</span>;
  if (status === "caught_trophy") return <span className="badge ok">🏆 Есть трофей</span>;
  if (status === "caught_manual") return <span className="badge ok">✅ Поймана</span>;
  return <span className="badge">Не поймана</span>;
}
