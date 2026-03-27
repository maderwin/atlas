import { memo, useState } from "react";
import type { Service, ServiceLink } from "../types";
import { getLinkColor } from "../types";
import { LinkCard } from "./LinkCard";
import { Modal } from "./Modal";
import { StatusBadge } from "./StatusBadge";

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

function Tag({ tag, onClick }: { tag: string; onClick: (q: string) => void }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick(`[${tag}]`);
      }}
      className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
    >
      {tag}
    </button>
  );
}

function LinkDetail({ link }: { link: ServiceLink }) {
  const color = getLinkColor(link);
  return (
    <div className={`rounded-lg border ${color.border} ${color.bg} p-4`}>
      <div className="flex items-center justify-between">
        <span className={`font-medium ${color.text}`}>{link.name}</span>
        {link.type && (
          <span className="rounded-full bg-white/60 px-2 py-0.5 text-[10px] uppercase tracking-wider dark:bg-black/20">
            {link.type}
          </span>
        )}
      </div>
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 block truncate text-sm text-gray-500 hover:text-primary dark:text-gray-400"
      >
        {link.url}
      </a>
    </div>
  );
}

interface ServiceEntryProps {
  service: Service;
  query: string;
  semantic?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
  onTagClick: (q: string) => void;
}

export const ServiceEntry = memo(function ServiceEntry({ service, query, semantic, expanded = false, onToggle, onTagClick }: ServiceEntryProps) {
  const [modalLink, setModalLink] = useState<ServiceLink | null>(null);

  return (
    <>
      <div
        className="group cursor-pointer rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 hover:border-gray-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
        onClick={onToggle}
      >
        {/* Header row */}
        <div className="flex items-center gap-3">
          {/* Service name */}
          <div className="flex items-center gap-2">
            {service.url ? (
              <a
                href={service.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-lg font-semibold text-primary hover:underline"
              >
                <Highlight text={service.name} query={query} />
              </a>
            ) : (
              <span className="text-lg font-semibold"><Highlight text={service.name} query={query} /></span>
            )}
          </div>

          {/* Tags */}
          {service.tags?.map((tag) => (
            <Tag key={tag} tag={tag} onClick={onTagClick} />
          ))}

          {/* Status badge */}
          {service.status_url && <StatusBadge url={service.status_url} />}

          {/* Semantic badge */}
          {semantic && (
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-medium text-violet-600 dark:bg-violet-900/40 dark:text-violet-300">
              semantic
            </span>
          )}

          {/* Expand chevron */}
          <svg
            className={`ml-auto h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-2">
            {service.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400"><Highlight text={service.description} query={query} /></p>
            )}
            {service.admins && (
              <div className="mt-1 flex gap-3 text-sm text-gray-500">
                {service.admins.map((admin) => (
                  <span key={admin.username}>
                    {admin.url ? (
                      <a href={admin.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                        @{admin.username}
                      </a>
                    ) : (
                      `@${admin.username}`
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Link cards */}
        {service.links && service.links.length > 0 && (
          <div className="mt-3 flex gap-2 overflow-x-auto p-1" onClick={(e) => e.stopPropagation()}>
            {service.links.map((link) => (
              <LinkCard key={link.url} link={link} query={query} onInfoClick={() => setModalLink(link)} />
            ))}
          </div>
        )}
      </div>

      {/* Link detail modal */}
      <Modal open={modalLink !== null} onClose={() => setModalLink(null)}>
        {modalLink && (
          <div>
            <h3 className="mb-4 text-lg font-semibold">
              {service.name} — {modalLink.name}
            </h3>
            <LinkDetail link={modalLink} />
            <div className="mt-4 flex justify-end">
              <a
                href={modalLink.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
              >
                Open link
              </a>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
});
