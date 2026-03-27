import { useEffect, useState } from "react";

interface StatusBadgeProps {
  url: string;
  label?: string;
}

type Status = "loading" | "ok" | "error" | "unknown";

export function StatusBadge({ url, label = "Status" }: StatusBadgeProps) {
  const [status, setStatus] = useState<Status>("loading");
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const start = performance.now();
      try {
        const res = await fetch(url, { mode: "no-cors", cache: "no-store" });
        if (!cancelled) {
          setLatency(Math.round(performance.now() - start));
          setStatus(res.ok || res.type === "opaque" ? "ok" : "error");
        }
      } catch {
        if (!cancelled) {
          setLatency(null);
          setStatus("error");
        }
      }
    };

    check();
    const interval = setInterval(check, 30_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [url]);

  const colors: Record<Status, string> = {
    loading: "bg-gray-400",
    ok: "bg-green-500 animate-pulse",
    error: "bg-red-500 animate-pulse",
    unknown: "bg-yellow-500",
  };

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-700">
      <span className={`h-2 w-2 rounded-full ${colors[status]} transition-colors duration-500`} />
      <span className="text-gray-600 dark:text-gray-300">{label}</span>
      {latency !== null && status === "ok" && (
        <span className="text-gray-400 tabular-nums">{latency}ms</span>
      )}
    </div>
  );
}
