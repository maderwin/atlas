type Status = "loading" | "ok" | "error";

interface StatusEntry {
  status: Status;
  latency: number | null;
}

const store = new Map<string, StatusEntry>();
const listeners = new Set<() => void>();
const intervals = new Map<string, ReturnType<typeof setInterval>>();
const refCounts = new Map<string, number>();

function notify() {
  for (const l of listeners) l();
}

async function check(url: string) {
  const start = performance.now();
  try {
    const res = await fetch(url, { mode: "no-cors", cache: "no-store" });
    const ms = Math.round(performance.now() - start);
    const status: Status = res.ok || res.type === "opaque" ? "ok" : "error";
    const prev = store.get(url);
    if (!prev || prev.status !== status || prev.latency !== ms) {
      store.set(url, { status, latency: ms });
      notify();
    }
  } catch {
    const prev = store.get(url);
    if (!prev || prev.status !== "error") {
      store.set(url, { status: "error", latency: null });
      notify();
    }
  }
}

export function subscribe(url: string) {
  const count = (refCounts.get(url) ?? 0) + 1;
  refCounts.set(url, count);

  if (count === 1) {
    if (!store.has(url)) {
      store.set(url, { status: "loading", latency: null });
    }
    check(url);
    intervals.set(url, setInterval(() => check(url), 30_000));
  }

  return () => {
    const next = (refCounts.get(url) ?? 1) - 1;
    refCounts.set(url, next);
    if (next === 0) {
      clearInterval(intervals.get(url));
      intervals.delete(url);
      refCounts.delete(url);
    }
  };
}

export function getSnapshot(url: string): StatusEntry {
  return store.get(url) ?? { status: "loading", latency: null };
}

export function addListener(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
