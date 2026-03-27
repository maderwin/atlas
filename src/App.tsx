import { useState } from "react";
import { useServices } from "./useServices";
import { useSearch } from "./useSearch";
import { Navbar } from "./components/Navbar";
import { ServiceEntry } from "./components/ServiceEntry";

export function App() {
  const { services, error, loading, lastUpdated, refresh } = useServices();
  const [query, setQuery] = useState("");
  const results = useSearch(services, query);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <Navbar query={query} onQueryChange={setQuery} />
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
          {results
            ? results.map(({ item, score }) => (
                <ServiceEntry key={item.id} service={item} score={score} onTagClick={setQuery} />
              ))
            : services.map((s) => (
                <ServiceEntry key={s.id} service={s} onTagClick={setQuery} />
              ))}
        </div>
        {lastUpdated && services.length > 0 && (
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400">
            <span>
              Updated {lastUpdated.toLocaleTimeString()} — {services.length} services
            </span>
            <button
              onClick={refresh}
              className="rounded p-1 transition-colors hover:bg-gray-200 dark:hover:bg-gray-800"
              title="Refresh now"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
