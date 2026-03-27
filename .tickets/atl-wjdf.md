---
id: atl-wjdf
status: closed
deps: []
links: []
created: 2026-03-27T15:41:33Z
type: task
priority: 2
assignee: Artyom Zakharov
tags: [atlas, perf]
---
# Defer loadEmbeddings() until first search

embedSearch.ts:112 — fires on module import, wastes resources if user doesn't search

