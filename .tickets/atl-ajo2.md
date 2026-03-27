---
id: atl-ajo2
status: closed
deps: []
links: []
created: 2026-03-27T15:41:33Z
type: task
priority: 2
assignee: Artyom Zakharov
tags: [atlas, perf]
---
# Split useSearch memo for fzf/semantic

useSearch.ts:194 — single useMemo recomputes fzf when only semanticResults change

