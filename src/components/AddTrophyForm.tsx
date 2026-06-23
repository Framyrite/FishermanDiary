"use client";

import { useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { FishSpecies } from "@/types/domain";

export function AddTrophyForm({ species, onCreated }: { species: FishSpecies[]; onCreated: () => void }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const grouped = useMemo(() => {
    return species.reduce<Record<string, FishSpecies[]>>((acc, fish) => {
      acc[fish.category] = acc[fish.category] ?? [];
      acc[fish.category].push(fish);
      return acc;
    }, {});
  }, [species]);

  async function submit(formData: FormData) {
    setPending(true);
    setError(null);
    try {
      await api("/api/trophies", { method: "POST", body: formData });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось добавить трофей");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="form" action={submit}>
      {error && <div className="error">{error}</div>}

      <label className="field">
        <span>Фото</span>
        <input className="file" type="file" name="photo" accept="image/*" />
      </label>

      <label className="field">
        <span>Рыба *</span>
        <select className="select" name="species_id" required defaultValue="">
          <option value="" disabled>
            Выбери вид
          </option>
          {Object.entries(grouped).map(([category, items]) => (
            <optgroup key={category} label={category}>
              {items.map((fish) => (
                <option key={fish.id} value={fish.id}>
                  {fish.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>

      <div className="grid-2">
        <label className="field">
          <span>Вес, граммы</span>
          <input className="input" name="weight_grams" type="number" min="0" step="1" placeholder="2400" />
        </label>
        <label className="field">
          <span>Длина, см</span>
          <input className="input" name="length_cm" type="number" min="0" step="0.1" placeholder="68" />
        </label>
      </div>

      <label className="field">
        <span>Дата</span>
        <input className="input" name="date_caught" type="date" />
      </label>

      <label className="field">
        <span>Место</span>
        <input className="input" name="place_name" placeholder="Влтава, пруд, карьер..." />
      </label>

      <label className="field">
        <span>Приманка / наживка</span>
        <input className="input" name="bait" placeholder="Воблер, микроджиг, кукуруза..." />
      </label>

      <label className="field">
        <span>Заметка</span>
        <textarea className="textarea" name="note" placeholder="Как клюнула, условия, что сработало..." />
      </label>

      <label className="field">
        <span>Видимость</span>
        <select className="select" name="visibility" defaultValue="friends">
          <option value="private">Только я</option>
          <option value="friends">Друзья</option>
          <option value="link">Все по ссылке</option>
        </select>
      </label>

      <label className="field">
        <span>Показывать место друзьям?</span>
        <select className="select" name="show_place" defaultValue="false">
          <option value="false">Нет, скрыть место</option>
          <option value="true">Да, можно показать</option>
        </select>
      </label>

      <button className="btn" disabled={pending} type="submit">
        {pending ? "Сохраняю..." : "Сохранить трофей"}
      </button>
    </form>
  );
}
