export interface ServiceLink {
  name: string;
  url: string;
  type?: string; // dashboard, config, logs, backup, docs, api, metrics, etc.
}

export interface ServiceAdmin {
  name: string;
  username: string;
  url?: string;
}

export interface ServiceMetric {
  label: string;
  value: string | number;
  status?: "ok" | "warn" | "error";
  url?: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  url?: string;
  tags?: string[];
  links?: ServiceLink[];
  admins?: ServiceAdmin[];
  metrics_url?: string; // endpoint for live metrics
  status_url?: string; // endpoint for health check
}

export interface ServicesData {
  services: Service[];
}

// Link type → color mapping
export const LINK_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  dashboard: { bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-700 dark:text-blue-300", border: "border-blue-200 dark:border-blue-800" },
  config:    { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800" },
  logs:      { bg: "bg-green-50 dark:bg-green-950/40", text: "text-green-700 dark:text-green-300", border: "border-green-200 dark:border-green-800" },
  backup:    { bg: "bg-purple-50 dark:bg-purple-950/40", text: "text-purple-700 dark:text-purple-300", border: "border-purple-200 dark:border-purple-800" },
  docs:      { bg: "bg-cyan-50 dark:bg-cyan-950/40", text: "text-cyan-700 dark:text-cyan-300", border: "border-cyan-200 dark:border-cyan-800" },
  api:       { bg: "bg-rose-50 dark:bg-rose-950/40", text: "text-rose-700 dark:text-rose-300", border: "border-rose-200 dark:border-rose-800" },
  metrics:   { bg: "bg-indigo-50 dark:bg-indigo-950/40", text: "text-indigo-700 dark:text-indigo-300", border: "border-indigo-200 dark:border-indigo-800" },
  management:{ bg: "bg-teal-50 dark:bg-teal-950/40", text: "text-teal-700 dark:text-teal-300", border: "border-teal-200 dark:border-teal-800" },
  default:   { bg: "bg-gray-50 dark:bg-gray-800/40", text: "text-gray-700 dark:text-gray-300", border: "border-gray-200 dark:border-gray-700" },
};

export function getLinkColor(link: ServiceLink) {
  if (link.type && link.type in LINK_COLORS) return LINK_COLORS[link.type]!;
  // Auto-detect from name
  const name = link.name.toLowerCase();
  for (const [key, color] of Object.entries(LINK_COLORS)) {
    if (name.includes(key)) return color;
  }
  return LINK_COLORS.default!;
}
