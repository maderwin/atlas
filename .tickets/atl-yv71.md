---
id: atl-yv71
status: closed
deps: []
links: []
created: 2026-03-27T15:41:33Z
type: bug
priority: 0
assignee: Artyom Zakharov
tags: [atlas, security]
---
# Remove CORS wildcard from embed API

embed/main.py:20 — allow_origins=['*']. Remove CORSMiddleware entirely since nginx proxies same-origin

