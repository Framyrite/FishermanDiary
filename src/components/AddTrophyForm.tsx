"use client";

import { useMemo, useState } from "react";
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

function normalizeSearch(value: string) {
  return value.trim().toLowerCase().replaceAll("ё", "е");
}

function initialSpeciesName(species: FishSpecies[], trophy?: Trophy | null) {
  if (trophy?.species?.name) return trophy.species.name;
  if (!trophy?.species_id) return "";
  return species.find((fish) => fish.id === trophy.species_id)?.name ?? "";
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
  const [speciesQuery, setSpeciesQuery] = useState(() => initialSpeciesName(species, initialTrophy));
  const [selectedSpeciesId, setSelectedSpeciesId] = useState(initialTrophy?.species_id ?? "");
  const [speciesOpen, setSpeciesOpen] = useState(false);
  const isEdit = Boolean(initialTrophy);

  const filteredSpecies = useMemo(() => {
    const query = normalizeSearch(speciesQuery);
    if (!query) return species.slice(0, 14);
    return species.filter((fish) => normalizeSearch(fish.name).includes(query)).slice(0, 24);
  }, [species, speciesQuery]);

  function chooseSpecies(fish: FishSpecies) {
    setSelectedSpeciesId(fish.id);
    setSpeciesQuery(fish.name);
    setSpeciesOpen(false);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const formEl = event.currentTarget;
      const formData = new FormData(formEl);
      const exactSpecies = species.find((fish) => normalizeSearch(fish.name) === normalizeSearch(speciesQuery));
      const speciesId = selectedSpeciesId || exactSpecies?.id || "";
      const weight = String(formData.get("weight_grams") || "");
      const length = String(formData.get("length_cm") || "");

      if (!speciesId) {
        setError("Выбери вид рыбы");
        setPending(false);
        return;
      }

      formData.set("species_id", speciesId);

      if (!isValidNumber(weight)) {
        setError("Укажи вес числом");
        setPending(false);
        return;
      }

      if (!isValidNumber(length)) {
        setError("Укажи длину числом");
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

      <div className="field species-combobox-field">
        <span>Рыба <b className="required-star">*</b></span>
        <div className={`species-combobox ${speciesOpen ? "open" : ""}`}>
          <input type="hidden" name="species_id" value={selectedSpeciesId} />
          <input
            className="input species-combobox-input"
            value={speciesQuery}
            placeholder="Начни вводить вид"
            autoComplete="off"
            onBlur={() => window.setTimeout(() => setSpeciesOpen(false), 140)}
            onChange={(event) => {
              const nextValue = event.target.value;
              setSpeciesQuery(nextValue);
              const exact = species.find((fish) => normalizeSearch(fish.name) === normalizeSearch(nextValue));
              setSelectedSpeciesId(exact?.id ?? "");
              setSpeciesOpen(true);
            }}
            onFocus={() => setSpeciesOpen(true)}
            type="text"
          />
          <button className="species-combobox-toggle" type="button" aria-label="Показать виды рыб" onMouseDown={(event) => event.preventDefault()} onClick={() => setSpeciesOpen((value) => !value)}>
            <span />
          </button>

          {speciesOpen ? (
            <div className="species-combobox-menu" role="listbox">
              {filteredSpecies.length > 0 ? (
                filteredSpecies.map((fish) => (
                  <button className="species-combobox-option" key={fish.id} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => chooseSpecies(fish)}>
                    {fish.name}
                  </button>
                ))
              ) : (
                <div className="species-combobox-empty">Ничего не найдено</div>
              )}
            </div>
          ) : null}
        </div>
      </div>

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
