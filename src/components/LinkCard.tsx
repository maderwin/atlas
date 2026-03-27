import type { ServiceLink } from "../types";
import { getLinkColor } from "../types";

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query || query.startsWith("[")) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-yellow-200/80 px-0.5 dark:bg-yellow-500/30">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

interface LinkCardProps {
  link: ServiceLink;
  query: string;
  onInfoClick: () => void;
}

export function LinkCard({ link, query, onInfoClick }: LinkCardProps) {
  const color = getLinkColor(link);

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative flex min-w-[120px] flex-col rounded-lg border ${color.border} ${color.bg} p-3 transition-all duration-200 hover:scale-[1.03] hover:shadow-md`}
    >
      <span className={`font-medium ${color.text} text-sm leading-tight`}><Highlight text={link.name} query={query} /></span>
      {link.type && (
        <span className="mt-1 text-[10px] uppercase tracking-wider opacity-50">{link.type}</span>
      )}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onInfoClick();
        }}
        className="absolute top-1.5 right-1.5 opacity-0 transition-opacity group-hover:opacity-60 hover:!opacity-100"
        title="Details"
      >
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
      </button>
    </a>
  );
}
