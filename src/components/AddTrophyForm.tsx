"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import type { FishSpecies, Trophy } from "@/types/domain";

function isValidNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return true;
  return /^\d+([,.]\d+)?$/.test(trimmed);
}

function normalizeNumberInput(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "";
  return value.trim().replace(",", ".");
}

export function AddTrophyForm({
  species,
  onCreated,
  initialTrophy = null,
}: {
  species: FishSpecies[];
  onCreated: () => void;
  initialTrophy?: Trophy | null;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState("");

  const isEdit = Boolean(initialTrophy);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const formEl = event.currentTarget;
      const formData = new FormData(formEl);
      const speciesId = String(formData.get("species_id") || "");
      const weight = String(formData.get("weight_grams") || "");
      const length = String(formData.get("length_cm") || "");

      if (!speciesId) {
        setError("Выбери вид рыбы");
        setPending(false);
        return;
      }

      if (!isValidNumber(weight)) {
        setError("Вес должен быть числом. Например: 2500 или 2500,5");
        setPending(false);
        return;
      }

      if (!isValidNumber(length)) {
        setError("Длина должна быть числом. Например: 56 или 56,5");
        setPending(false);
        return;
      }

      formData.set("weight_grams", normalizeNumberInput(formData.get("weight_grams")));
      formData.set("length_cm", normalizeNumberInput(formData.get("length_cm")));

      await api(isEdit ? `/api/trophies?id=${initialTrophy?.id}` : "/api/trophies", {
        method: isEdit ? "PATCH" : "POST",
        body: formData,
      });

      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : isEdit ? "Не удалось изменить трофей" : "Не удалось добавить трофей");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="form" onSubmit={submit} noValidate>
      {error && <div className="error">{error}</div>}

      <label className="field">
        <span>Фото</span>
        <input
          id="trophy-photo"
          name="photo"
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(event) => {
            const file = event.target.files?.[0];
            setPhotoName(file?.name || "");
          }}
        />
        <div className="photo-field-row">
          <label className="btn secondary small" htmlFor="trophy-photo">
            Выбрать фото
          </label>
          <span className="muted small-text">
            {photoName || (initialTrophy?.photo_url ? "Фото уже добавлено" : "Фото не выбрано")}
          </span>
        </div>
      </label>

      <label className="field">
        <span>Рыба <b className="required-star">*</b></span>
        <select className="input" name="species_id" defaultValue={initialTrophy?.species_id || ""}>
          <option value="" disabled>
            Выбери вид
          </option>
          {species.map((fish) => (
            <option key={fish.id} value={fish.id}>
              {fish.name}
            </option>
          ))}
        </select>
      </label>

      <div className="form-grid">
        <label className="field">
          <span>Вес, граммы</span>
          <input className="input" name="weight_grams" inputMode="decimal" placeholder="2500" defaultValue={initialTrophy?.weight_grams ?? ""} />
        </label>

        <label className="field">
          <span>Длина, см</span>
          <input className="input" name="length_cm" inputMode="decimal" placeholder="56" defaultValue={initialTrophy?.length_cm ?? ""} />
        </label>
      </div>

      <label className="field">
        <span>Дата</span>
        <input className="input" name="date_caught" type="date" defaultValue={initialTrophy?.date_caught ?? ""} />
      </label>

      <label className="field">
        <span>Место</span>
        <input className="input" name="place_name" placeholder="река, пруд, озеро..." defaultValue={initialTrophy?.place_name ?? ""} />
      </label>

      <label className="field">
        <span>Приманка / наживка</span>
        <input className="input" name="bait" placeholder="воблер, микроджиг, кукуруза..." defaultValue={initialTrophy?.bait ?? ""} />
      </label>

      <label className="field">
        <span>Заметка</span>
        <textarea className="textarea" name="note" placeholder="как клюнула, условия, что сработало..." defaultValue={initialTrophy?.note ?? ""} />
      </label>

      <label className="field">
        <span>Кому виден трофей?</span>
        <select className="input" name="visibility" defaultValue={initialTrophy?.visibility ?? "friends"}>
          <option value="private">Только мне</option>
          <option value="friends">Друзьям</option>
          <option value="link">По ссылке</option>
        </select>
      </label>

      <label className="field">
        <span>Показывать место друзьям?</span>
        <select className="input" name="show_place" defaultValue={initialTrophy?.show_place ? "true" : "false"}>
          <option value="false">Нет, скрыть место</option>
          <option value="true">Да, показать</option>
        </select>
      </label>

      <button className="btn full" disabled={pending} type="submit">
        {pending ? "Сохраняю..." : isEdit ? "Сохранить изменения" : "Сохранить трофей"}
      </button>
    </form>
  );
}
