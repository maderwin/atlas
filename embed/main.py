from __future__ import annotations

import hashlib
import json
import os
import time
from pathlib import Path

import numpy as np
import yaml
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from model2vec import StaticModel

DATA_DIR = Path(os.environ.get("DATA_DIR", "/data"))
MODEL_NAME = os.environ.get("MODEL_NAME", "minishlab/potion-multilingual-128M")
RELOAD_INTERVAL = int(os.environ.get("RELOAD_INTERVAL", "60"))

app = FastAPI(title="Atlas Embed")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

model: StaticModel | None = None
services: list[dict] = []
service_texts: list[str] = []
service_embeddings: np.ndarray | None = None
data_hash: str = ""
last_check: float = 0


def service_to_text(s: dict) -> str:
    parts = [s.get("name", ""), s.get("description", "")]
    for tag in s.get("tags", []):
        parts.append(tag)
    for link in s.get("links", []):
        parts.append(link.get("name", ""))
    for admin in s.get("admins", []):
        parts.append(admin.get("username", ""))
    return " ".join(p for p in parts if p)


def load_services(path: Path) -> list[dict]:
    if not path.exists():
        return []
    with open(path) as f:
        data = yaml.safe_load(f)
    if not data or "services" not in data:
        return []
    result = []
    for item in data["services"]:
        if "$ref" in item:
            ref_path = path.parent / item["$ref"]
            if ref_path.exists():
                with open(ref_path) as rf:
                    ref_data = yaml.safe_load(rf)
                if ref_data and "services" in ref_data:
                    result.extend(ref_data["services"])
        else:
            result.append(item)
    return result


def file_hash(path: Path) -> str:
    h = hashlib.md5()
    for f in sorted(path.parent.glob("*.yaml")):
        h.update(f.read_bytes())
    return h.hexdigest()


def maybe_reload():
    global services, service_texts, service_embeddings, data_hash, last_check
    now = time.time()
    if now - last_check < RELOAD_INTERVAL:
        return
    last_check = now
    yaml_path = DATA_DIR / "services.yaml"
    if not yaml_path.exists():
        return
    h = file_hash(yaml_path)
    if h == data_hash:
        return
    data_hash = h
    services = load_services(yaml_path)
    service_texts = [service_to_text(s) for s in services]
    if model and service_texts:
        service_embeddings = model.encode(service_texts)
        # Normalize
        norms = np.linalg.norm(service_embeddings, axis=1, keepdims=True)
        norms[norms == 0] = 1
        service_embeddings = service_embeddings / norms


@app.on_event("startup")
async def startup():
    global model
    model = StaticModel.from_pretrained(MODEL_NAME)
    maybe_reload()


@app.get("/api/search")
async def search(q: str = Query(..., min_length=1), limit: int = Query(20, ge=1, le=100)):
    maybe_reload()
    if model is None or service_embeddings is None or len(services) == 0:
        return {"results": []}
    query_emb = model.encode([q])
    query_emb = query_emb / (np.linalg.norm(query_emb) or 1)
    scores = (service_embeddings @ query_emb.T).flatten()
    indices = np.argsort(-scores)[:limit]
    results = []
    for i in indices:
        score = float(scores[i])
        if score < 0.1:
            continue
        results.append({"id": services[i].get("id", ""), "score": round(score, 4)})
    return {"results": results, "hash": data_hash}


@app.get("/api/embeddings")
async def embeddings():
    """Return precomputed embeddings for client-side caching."""
    maybe_reload()
    if service_embeddings is None:
        return {"services": [], "embeddings": [], "hash": ""}
    return {
        "services": [s.get("id", "") for s in services],
        "embeddings": service_embeddings.tolist(),
        "dims": int(service_embeddings.shape[1]) if service_embeddings.ndim > 1 else 0,
        "hash": data_hash,
    }


@app.get("/api/embed")
async def embed_query(q: str = Query(..., min_length=1)):
    """Embed a single query for client-side similarity."""
    if model is None:
        return {"embedding": []}
    emb = model.encode([q])
    emb = emb / (np.linalg.norm(emb) or 1)
    return {"embedding": emb[0].tolist()}


@app.get("/health")
async def health():
    return {"ok": True, "model": MODEL_NAME, "services": len(services)}
