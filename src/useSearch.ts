import { Fzf, FzfResultItem } from "fzf";
import { useMemo } from "react";
import type { Service } from "./types";

export function useSearch(services: Service[], query: string): FzfResultItem<Service>[] | null {
  const fzf = useMemo(
    () =>
      new Fzf(services, {
        selector: ({ name, description, tags }) =>
          `${name} ${description ?? ""} ${tags?.join(" ") ?? ""}`,
        fuzzy: "v2",
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

  return useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    if (/^\[.*\]$/.test(q)) return tagFzf.find(q);
    return fzf.find(q);
  }, [query, fzf, tagFzf]);
}
