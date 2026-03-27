import { Fzf, FzfResultItem } from "fzf";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Service } from "./types";
import { semanticSearch } from "./embedSearch";

// EN QWERTY → RU ЙЦУКЕН
const EN_TO_RU: Record<string, string> = {
  q: "й",
  w: "ц",
  e: "у",
  r: "к",
  t: "е",
  y: "н",
  u: "г",
  i: "ш",
  o: "щ",
  p: "з",
  "[": "х",
  "]": "ъ",
  a: "ф",
  s: "ы",
  d: "в",
  f: "а",
  g: "п",
  h: "р",
  j: "о",
  k: "л",
  l: "д",
  ";": "ж",
  "'": "э",
  z: "я",
  x: "ч",
  c: "с",
  v: "м",
  b: "и",
  n: "т",
  m: "ь",
  ",": "б",
  ".": "ю",
  "`": "ё",
};
const RU_TO_EN: Record<string, string> = {};
for (const [en, ru] of Object.entries(EN_TO_RU)) RU_TO_EN[ru] = en;

const TRANSLIT: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "yo",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "kh",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "shch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

const PHONETIC: [RegExp, string][] = [
  [/ph/g, "f"],
  [/gh/g, "f"],
  [/f/g, "ph"],
  [/ck/g, "k"],
  [/c/g, "k"],
  [/k/g, "c"],
  [/th/g, "d"],
  [/th/g, "f"],
  [/th/g, "t"],
  [/x/g, "ks"],
  [/ks/g, "x"],
  [/w/g, "v"],
  [/v/g, "w"],
];

function swapLayout(s: string, map: Record<string, string>): string {
  return s
    .split("")
    .map((c) => map[c] ?? c)
    .join("");
}

function transliterate(s: string): string {
  return s
    .split("")
    .map((c) => TRANSLIT[c] ?? c)
    .join("");
}

function phoneticVariants(s: string): string[] {
  const results: string[] = [];
  for (const [pattern, replacement] of PHONETIC) {
    const replaced = s.replace(pattern, replacement);
    if (replaced !== s) results.push(replaced);
  }
  return results;
}

function queryVariants(q: string): string[] {
  const set = new Set<string>();
  set.add(q);
  set.add(swapLayout(q, EN_TO_RU));
  set.add(swapLayout(q, RU_TO_EN));
  set.add(transliterate(q));
  set.add(transliterate(swapLayout(q, EN_TO_RU)));
  set.add(transliterate(swapLayout(q, RU_TO_EN)));
  for (const v of Array.from(set)) {
    for (const pv of phoneticVariants(v)) set.add(pv);
  }
  set.delete(q);
  return [q, ...set];
}

export interface SearchResultItem {
  service: Service;
  score: number;
  semantic?: boolean;
}

export function useSearch(services: Service[], query: string): SearchResultItem[] | null {
  const fzf = useMemo(
    () =>
      new Fzf(services, {
        selector: (s) =>
          [
            s.name,
            s.description ?? "",
            s.tags?.join(" ") ?? "",
            s.links?.map((l) => l.name).join(" ") ?? "",
          ].join(" "),
        fuzzy: "v2",
        tiebreakers: [(a, b) => a.score - b.score],
      }),
    [services],
  );

  const tagFzf = useMemo(
    () =>
      new Fzf(services, {
        selector: ({ tags }) => tags?.map((t) => `[${t}]`).join(" ") ?? "",
        fuzzy: false,
      }),
    [services],
  );

  // Semantic search state
  const [semanticResults, setSemanticResults] = useState<Map<string, number>>(new Map());
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const queryRef = useRef(query);
  queryRef.current = query;

  useEffect(() => {
    const q = query.trim();
    if (!q || /^\[.*\]$/.test(q)) {
      setSemanticResults(new Map());
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await semanticSearch(q);
        // Only update if query hasn't changed
        if (queryRef.current.trim() === q) {
          setSemanticResults(new Map(results.map((r) => [r.id, r.score])));
        }
      } catch {
        // Semantic search unavailable — fzf only
      }
    }, 200);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  return useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    if (/^\[.*\]$/.test(q)) {
      return tagFzf.find(q).map((r) => ({ service: r.item, score: r.score }));
    }

    // Fzf search with layout/phonetic variants
    const variants = queryVariants(q);
    const seen = new Set<string>();
    let bestFzf: FzfResultItem<Service>[] = [];
    for (const variant of variants) {
      const results = fzf.find(variant);
      if (results.length > 0 && (bestFzf.length === 0 || results[0]!.score > bestFzf[0]!.score)) {
        bestFzf = results;
      }
    }

    // Build merged result map: id → {service, score, semantic}
    const merged = new Map<string, SearchResultItem>();

    // Add fzf results
    if (bestFzf.length > 0) {
      const topScore = bestFzf[0]!.score;
      for (const r of bestFzf) {
        if (r.score < topScore * 0.5) break;
        if (!seen.has(r.item.id)) {
          seen.add(r.item.id);
          merged.set(r.item.id, { service: r.item, score: r.score });
        }
      }
    }

    // Merge semantic results — add services not found by fzf
    const serviceMap = new Map(services.map((s) => [s.id, s]));
    for (const [id, score] of semanticResults) {
      if (!merged.has(id)) {
        const svc = serviceMap.get(id);
        if (svc) {
          merged.set(id, { service: svc, score: score * 100, semantic: true });
        }
      }
    }

    // Sort: fzf results first (higher scores), then semantic
    return [...merged.values()].sort((a, b) => {
      if (a.semantic && !b.semantic) return 1;
      if (!a.semantic && b.semantic) return -1;
      return b.score - a.score;
    });
  }, [query, fzf, tagFzf, semanticResults, services]);
}
