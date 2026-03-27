import { memo, useCallback, useEffect, useSyncExternalStore } from "react";
import { addListener, getSnapshot, subscribe } from "../statusStore";

interface StatusBadgeProps {
  url: string;
  label?: string;
}

export const StatusBadge = memo(function StatusBadge({ url, label = "Status" }: StatusBadgeProps) {
  useEffect(() => subscribe(url), [url]);

  const snap = useSyncExternalStore(
    addListener,
    useCallback(() => getSnapshot(url), [url]),
  );

  const colors = {
    loading: "bg-gray-400",
    ok: "bg-green-500",
    error: "bg-red-500 animate-pulse",
  };

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-700">
      <span className={`h-2 w-2 rounded-full ${colors[snap.status]} transition-colors duration-500`} />
      <span className="text-gray-600 dark:text-gray-300">{label}</span>
      {snap.latency !== null && snap.status === "ok" && (
        <span className="text-gray-400 tabular-nums">{snap.latency}ms</span>
      )}
    </div>
  );
});
