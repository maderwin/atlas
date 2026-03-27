const EMBED_API = "/api";
const DB_NAME = "atlas-embed";
const DB_VERSION = 1;
const STORE_NAME = "cache";

interface EmbedData {
  services: string[];
  embeddings: number[][];
  dims: number;
  hash: string;
}

interface SearchResult {
  id: string;
  score: number;
}

// Shared IndexedDB connection
let dbInstance: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME);
    req.onsuccess = () => {
      dbInstance = req.result;
      dbInstance.onclose = () => {
        dbInstance = null;
      };
      resolve(dbInstance);
    };
    req.onerror = () => reject(req.error);
  });
}

async function cacheGet<T>(key: string): Promise<T | null> {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(key);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => resolve(null);
  });
}

async function cacheSet(key: string, value: unknown): Promise<void> {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(value, key);
    tx.oncomplete = () => resolve();
  });
}

// Cosine similarity
function cosineSim(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i]! * b[i]!;
    normA += a[i]! * a[i]!;
    normB += b[i]! * b[i]!;
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

let cachedData: EmbedData | null = null;

async function loadEmbeddings(): Promise<EmbedData | null> {
  if (cachedData) return cachedData;
  try {
    // Try IndexedDB first
    const cached = await cacheGet<EmbedData>("embeddings");
    // Check server for freshness
    const res = await fetch(`${EMBED_API}/embeddings`);
    if (!res.ok) return cached;
    const data: EmbedData = await res.json();
    if (cached && cached.hash === data.hash) {
      cachedData = cached;
      return cached;
    }
    await cacheSet("embeddings", data);
    cachedData = data;
    return data;
  } catch {
    const cached = await cacheGet<EmbedData>("embeddings");
    cachedData = cached;
    return cached;
  }
}

async function embedQuery(q: string): Promise<number[] | null> {
  try {
    const res = await fetch(`${EMBED_API}/embed?q=${encodeURIComponent(q)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.embedding;
  } catch {
    return null;
  }
}

export async function semanticSearch(query: string): Promise<SearchResult[]> {
  const [data, queryEmb] = await Promise.all([loadEmbeddings(), embedQuery(query)]);
  if (!data || !queryEmb || data.embeddings.length === 0) return [];

  const scored = data.services.map((id, i) => ({
    id,
    score: cosineSim(queryEmb, data.embeddings[i]!),
  }));

  return scored
    .filter((r) => r.score > 0.1)
    .sort((a, b) => b.score - a.score);
}
