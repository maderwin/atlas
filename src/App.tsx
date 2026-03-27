import { useCallback, useMemo, useState } from "react";
import { useServices } from "./useServices";
import { useSearch, SearchResultItem } from "./useSearch";
import { Navbar } from "./components/Navbar";
import { ServiceEntry } from "./components/ServiceEntry";

export function App() {
  const { services, error, loading, lastUpdated, refresh } = useServices();
  const [query, setQuery] = useState("");
  const results = useSearch(services, query);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const items: SearchResultItem[] = useMemo(() => {
    if (results) return results;
    return services.map((s) => ({ service: s, score: 0 }));
  }, [results, services]);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <Navbar query={query} onQueryChange={setQuery} serviceCount={services.length} lastUpdated={lastUpdated} onRefresh={refresh} />
      <main className="mx-auto max-w-6xl px-4 pt-20 pb-12 sm:px-8">
        {loading && (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
          </div>
        )}
        {error && <p className="text-center text-red-500">Error: {error}</p>}
        {!loading && !error && services.length === 0 && (
          <p className="text-center text-gray-500">No services found.</p>
        )}
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <ServiceEntry
              key={item.service.id}
              service={item.service}
              query={query}
              semantic={item.semantic}
              expanded={expandedIds.has(item.service.id)}
              onToggle={() => toggleExpanded(item.service.id)}
              onTagClick={setQuery}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
