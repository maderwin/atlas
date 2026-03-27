import { useCallback, useEffect, useRef, useState } from "react";

function useQueryHistory(query: string, onChange: (q: string) => void) {
  const history = useRef<string[]>([""]);
  const pos = useRef(0);
  const skip = useRef(false);

  useEffect(() => {
    if (skip.current) {
      skip.current = false;
      return;
    }
    const h = history.current;
    // Trim future on new input
    h.length = pos.current + 1;
    h.push(query);
    pos.current = h.length - 1;
  }, [query]);

  const undo = useCallback(() => {
    if (pos.current > 0) {
      pos.current--;
      skip.current = true;
      onChange(history.current[pos.current]!);
    }
  }, [onChange]);

  const redo = useCallback(() => {
    if (pos.current < history.current.length - 1) {
      pos.current++;
      skip.current = true;
      onChange(history.current[pos.current]!);
    }
  }, [onChange]);

  return { undo, redo };
}

function DarkToggle() {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem("atlas-theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("atlas-theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <button
      onClick={() => setDark((d) => !d)}
      className="shrink-0 rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
      aria-label="Toggle dark mode"
    >
      {dark ? (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
        </svg>
      ) : (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  );
}

interface NavbarProps {
  query: string;
  onQueryChange: (q: string) => void;
  serviceCount?: number;
  lastUpdated?: Date | null;
  onRefresh?: () => void;
}

export function Navbar({ query, onQueryChange, serviceCount, lastUpdated, onRefresh }: NavbarProps) {
  const handleClear = useCallback(() => onQueryChange(""), [onQueryChange]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { undo, redo } = useQueryHistory(query, onQueryChange);

  useEffect(() => {
    inputRef.current?.focus();
    const handler = (e: KeyboardEvent) => {
      // Any printable key — focus search
      if (
        e.key.length === 1 &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        document.activeElement !== inputRef.current
      ) {
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        onQueryChange("");
        inputRef.current?.blur();
      }
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if (mod && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        redo();
      }
    };
    // Refocus on blur (unless clicking a link/button)
    const blurHandler = () => {
      setTimeout(() => {
        const active = document.activeElement;
        if (active === document.body) {
          inputRef.current?.focus();
        }
      }, 100);
    };
    document.addEventListener("keydown", handler);
    inputRef.current?.addEventListener("blur", blurHandler);
    const input = inputRef.current;
    return () => {
      document.removeEventListener("keydown", handler);
      input?.removeEventListener("blur", blurHandler);
    };
  }, [onQueryChange, undo, redo]);

  return (
    <nav className="fixed top-0 right-0 left-0 z-20 flex items-center gap-4 border-b border-gray-200 bg-white/80 px-4 py-2 backdrop-blur-sm sm:px-8 dark:border-gray-700 dark:bg-gray-900/80">
      <div className="shrink-0 flex items-center gap-2 text-xl font-semibold">
        <svg
          className="h-6 w-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 2L2 19h20L12 2z" />
          <circle cx="12" cy="13" r="3" />
        </svg>
        <span className="hidden sm:inline">Atlas</span>
      </div>

      <div className="relative mx-auto w-full max-w-md">
        <svg
          className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search services..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-gray-50 py-1.5 pr-8 pl-9 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:focus:border-primary"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {lastUpdated && serviceCount != null && serviceCount > 0 && (
        <div className="flex shrink-0 items-center gap-1.5 text-xs text-gray-400">
          <span className="hidden sm:inline">{serviceCount} services</span>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="rounded p-1 transition-colors hover:bg-gray-200 dark:hover:bg-gray-800"
              title={`Updated ${lastUpdated.toLocaleTimeString()}`}
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
        </div>
      )}

      <DarkToggle />
    </nav>
  );
}
