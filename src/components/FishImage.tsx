"use client";

import { useEffect, useMemo, useState } from "react";

const fishImagesRaw: Record<string, string> = {
  "щука": "/fish/pike.png",
  "окунь": "/fish/perch.png",
  "судак": "/fish/zander.png",
  "берш": "/fish/zander.png",
  "сом": "/fish/catfish.png",
  "налим": "/fish/burbot.png",
  "жерех": "/fish/asp.png",
  "голавль": "/fish/chub.png",
  "ротан": "/fish/perch.png",
  "форель": "/fish/trout.png",
  "форель ручьевая": "/fish/trout.png",
  "форель радужная": "/fish/trout.png",
  "таймень": "/fish/trout.png",
  "ленок": "/fish/trout.png",
  "хариус": "/fish/grayling.png",
  "угорь": "/fish/burbot.png",
  "карп": "/fish/carp.png",
  "сазан": "/fish/carp.png",
  "карась золотой": "/fish/crucian.png",
  "карась серебряный": "/fish/crucian.png",
  "лещ": "/fish/bream.png",
  "подлещик": "/fish/bream.png",
  "плотва": "/fish/roach.png",
  "тарань": "/fish/roach.png",
  "краснопёрка": "/fish/rudd.png",
  "красноперка": "/fish/rudd.png",
  "линь": "/fish/tench.png",
  "амур белый": "/fish/amur.png",
  "амур чёрный": "/fish/amur.png",
  "амур черный": "/fish/amur.png",
  "толстолобик": "/fish/silver-carp.png",
  "толстолобик белый": "/fish/silver-carp.png",
  "толстолобик пёстрый": "/fish/silver-carp.png",
  "толстолобик пестрый": "/fish/silver-carp.png",
  "язь": "/fish/ide.png",
  "елец": "/fish/dace.png",
  "подуст": "/fish/nase.png",
  "усач": "/fish/barbel.png",
  "рыбец": "/fish/nase.png",
  "чехонь": "/fish/asp.png",
  "синец": "/fish/bream.png",
  "белоглазка": "/fish/roach.png",
  "густера": "/fish/bream.png",
  "уклейка": "/fish/bleak.png",
  "верховка": "/fish/bleak.png",
  "пескарь": "/fish/gudgeon.png",
  "ёрш": "/fish/ruffe.png",
  "ерш": "/fish/ruffe.png",
  "вьюн": "/fish/burbot.png",
  "голец": "/fish/trout.png",
  "колюшка": "/fish/gudgeon.png",
  "горчак": "/fish/bleak.png",
  "щиповка": "/fish/gudgeon.png",
  "бычок-песочник": "/fish/gudgeon.png",
  "бычок-кругляк": "/fish/gudgeon.png",
  "стерлядь": "/fish/sturgeon.png",
  "осётр": "/fish/sturgeon.png",
  "осетр": "/fish/sturgeon.png",
  "осётр русский": "/fish/sturgeon.png",
  "осетр русский": "/fish/sturgeon.png",
  "севрюга": "/fish/sturgeon.png",
  "белуга": "/fish/sturgeon.png",
  "шип": "/fish/sturgeon.png",
  "сиг": "/fish/trout.png",
  "ряпушка": "/fish/bleak.png",
  "корюшка": "/fish/bleak.png",
  "омуль": "/fish/trout.png",
  "муксун": "/fish/trout.png",
  "пелядь": "/fish/trout.png",
  "лосось": "/fish/trout.png",
  "лосось атлантический": "/fish/trout.png",
  "горбуша": "/fish/trout.png",
  "кета": "/fish/trout.png",
  "нерка": "/fish/trout.png",
  "кижуч": "/fish/trout.png",
  "кумжа": "/fish/trout.png",
  "треска": "/fish/cod.png",
  "пикша": "/fish/cod.png",
  "минтай": "/fish/cod.png",
  "сайда": "/fish/cod.png",
  "хек": "/fish/cod.png",
  "камбала": "/fish/flounder.png",
  "палтус": "/fish/flounder.png",
  "скумбрия": "/fish/mackerel.png",
  "сельдь": "/fish/herring.png",
  "сардина": "/fish/herring.png",
  "ставрида": "/fish/mackerel.png",
  "кефаль": "/fish/mullet.png",
  "сибас": "/fish/seabass.png",
  "дорадо": "/fish/dorado.png",
  "морской окунь": "/fish/perch.png",
  "тунец": "/fish/tuna.png",
  "луфарь": "/fish/seabass.png",
  "сарган": "/fish/garfish.png",
  "барабуля": "/fish/mullet.png",
};

function normalizeName(name?: string | null) {
  return (name ?? "")
    .trim()
    .toLowerCase()
    .replaceAll("ё", "е")
    .replace(/[\s_–—-]+/g, " ");
}

const fishImages = Object.fromEntries(
  Object.entries(fishImagesRaw).map(([name, src]) => [normalizeName(name), src]),
);

const sortedFishImageKeys = Object.keys(fishImages).sort((a, b) => b.length - a.length);

function localImageFor(name?: string | null) {
  const normalized = normalizeName(name);
  if (!normalized) return null;

  const exact = fishImages[normalized];
  if (exact) return exact;

  const partial = sortedFishImageKeys.find((key) => key.length > 2 && (normalized.includes(key) || key.includes(normalized)));
  return partial ? fishImages[partial] : null;
}

function FishPlaceholder({ name }: { name?: string | null }) {
  return (
    <div className="fish-placeholder-inner" aria-label={name ? `Нет изображения: ${name}` : "Нет изображения рыбы"}>
      <svg viewBox="0 0 96 52" role="img" aria-hidden="true">
        <path d="M9 27c9.9-14.2 22.7-21 38.3-20.4 12.8.5 24.1 7.5 33.7 21-9.7 12.9-21 19.2-34 19C31.3 46.4 18.6 39.8 9 27Z" />
        <path d="M78 27 92 14.7v24.6L78 27Z" />
        <path d="M31.8 16.4c4.3 6.8 4.3 14 0 21.6" />
        <circle cx="22" cy="25" r="2.5" />
      </svg>
    </div>
  );
}

export function FishImage({
  name,
  imageUrl,
  className = "",
}: {
  name?: string | null;
  imageUrl?: string | null;
  className?: string;
}) {
  const localSrc = useMemo(() => localImageFor(name), [name]);
  const src = imageUrl || localSrc;
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <div className={`fish-image ${!src || failed ? "fish-placeholder" : ""} ${className}`.trim()}>
      {src && !failed ? (
        <img src={src} alt={name ?? "Рыба"} loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <FishPlaceholder name={name} />
      )}
    </div>
  );
}
