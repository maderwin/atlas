import { useState } from "react";
import type { Service, ServiceLink } from "../types";
import { getLinkColor } from "../types";
import { LinkCard } from "./LinkCard";
import { Modal } from "./Modal";
import { StatusBadge } from "./StatusBadge";

function Tag({ tag, onClick }: { tag: string; onClick: (q: string) => void }) {
  return (
    <button
      onClick={() => onClick(`[${tag}]`)}
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
  score?: number;
  onTagClick: (q: string) => void;
}

export function ServiceEntry({ service, score, onTagClick }: ServiceEntryProps) {
  const [modalLink, setModalLink] = useState<ServiceLink | null>(null);
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <div className="group rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 hover:border-gray-200 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700">
        {/* Header row */}
        <div className="flex items-center gap-3">
          {/* Service name */}
          <div className="flex items-center gap-2">
            {service.url ? (
              <a
                href={service.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-semibold text-primary hover:underline"
              >
                {service.name}
              </a>
            ) : (
              <span className="text-lg font-semibold">{service.name}</span>
            )}
          </div>

          {/* Tags */}
          {service.tags?.map((tag) => (
            <Tag key={tag} tag={tag} onClick={onTagClick} />
          ))}

          {/* Status badge */}
          {service.status_url && (
            <StatusBadge url={service.status_url} />
          )}

          {/* Score */}
          {score !== undefined && (
            <span className="ml-auto text-xs tabular-nums text-gray-400">{score.toFixed(3)}</span>
          )}

          {/* Expand toggle for details */}
          {(service.description || service.admins) && (
            <button
              onClick={() => setExpanded((e) => !e)}
              className="ml-auto rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              title={expanded ? "Collapse" : "Expand details"}
            >
              <svg
                className={`h-4 w-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>

        {/* Expanded details */}
        <div
          className={`grid transition-all duration-200 ${expanded ? "mt-2 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
        >
          <div className="overflow-hidden">
            {service.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400">{service.description}</p>
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
        </div>

        {/* Link cards — horizontal scroll */}
        {service.links && service.links.length > 0 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {service.links.map((link) => (
              <LinkCard key={link.url} link={link} onInfoClick={() => setModalLink(link)} />
            ))}
          </div>
        )}
      </div>

      {/* Link detail modal */}
      <Modal open={modalLink !== null} onClose={() => setModalLink(null)}>
        {modalLink && (
          <div>
            <h3 className="mb-4 text-lg font-semibold">{service.name} — {modalLink.name}</h3>
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
}
