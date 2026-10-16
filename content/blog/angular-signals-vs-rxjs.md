---
title: "Angular Signals vs RxJS"
description: "Choosing the right reactive abstraction for modern Angular applications."
date: "2026-10-14"
tags:
  - Angular
  - TypeScript
  - RxJS
published: false
featured: false
---

This unpublished article demonstrates the supported editorial format. It is excluded from the public site, sitemap, RSS feed, and prerender route manifest.

## Start with ownership

Signals and RxJS solve different parts of the same problem: keeping values correct as a system changes.

> Choose the abstraction that makes ownership and timing easiest to understand.

### Local derived state

```typescript
const quantity = signal(2);
const unitPrice = signal(24);
const total = computed(() => quantity() * unitPrice());
```

### Asynchronous event flow

```typescript
const results$ = query$.pipe(
  debounceTime(250),
  distinctUntilChanged(),
  switchMap((query) => search(query)),
);
```

| Use case | Good default |
| --- | --- |
| Local synchronous state | Signals |
| Time-based event composition | RxJS |
| HTTP cancellation | RxJS |
| Template-derived values | Signals |

> [!NOTE]
> This sample stays unpublished until it is replaced with an original, reviewed article.
