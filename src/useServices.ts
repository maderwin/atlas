import { useEffect, useState, useCallback } from "react";
import { parse } from "yaml";
import type { Service } from "./types";

// Comma-separated URLs or single URL
const SERVICES_URLS = (import.meta.env.VITE_SERVICES_YAML_URL || "/services.yaml")
  .split(",")
  .map((u: string) => u.trim())
  .filter(Boolean);

const REFRESH_INTERVAL = Number(import.meta.env.VITE_REFRESH_INTERVAL || 60_000);

interface RawServiceEntry {
  $ref?: string;
  id?: string;
  [key: string]: unknown;
}

async function fetchYaml(url: string): Promise<Service[]> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const text = await res.text();
  const data = parse(text) as { services?: RawServiceEntry[] } | null;

  if (!data?.services) return [];

  const refs = data.services.filter((s) => s.$ref);
  const regular = data.services.filter((s): s is RawServiceEntry & Service => !s.$ref && !!s.id);

  const refServices = await Promise.all(
    refs.map(async (ref) => {
      try {
        const refUrl = new URL(ref.$ref!, url).href;
        return await fetchYaml(refUrl);
      } catch {
        return [];
      }
    }),
  );

  return [...regular, ...refServices.flat()];
}

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    try {
      const results = await Promise.all(SERVICES_URLS.map(fetchYaml));
      const all = results.flat();
      // Deduplicate by id
      const seen = new Set<string>();
      const unique = all.filter((s) => {
        if (seen.has(s.id)) return false;
        seen.add(s.id);
        return true;
      });
      setServices(unique);
      setError(null);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [refresh]);

  return { services, error, loading, lastUpdated, refresh };
}
