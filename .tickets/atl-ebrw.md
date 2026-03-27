---
id: atl-ebrw
status: closed
deps: []
links: []
created: 2026-03-27T15:41:33Z
type: chore
priority: 3
assignee: Artyom Zakharov
tags: [atlas, security]
---
# Replace MD5 with SHA256 in embed

embed/main.py:63 — hashlib.md5() for cache invalidation, use sha256

