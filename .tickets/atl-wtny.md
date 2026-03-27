---
id: atl-wtny
status: closed
deps: []
links: []
created: 2026-03-27T15:41:33Z
type: bug
priority: 1
assignee: Artyom Zakharov
tags: [atlas, quality]
---
# Fix IndexedDB connection leak

embedSearch.ts:29,39 — openDB() on every operation, db.close() never called. Use shared connection

