# Application Cache Model

## Summary

ResumeConverter uses a scoped, versioned application cache. The key point is that cache correctness is not based only on TTL. It is based on scope versions stored in PostgreSQL and propagated through invalidation notifications.

## Mental Model

The closest mental model is:

- namespace-based cache
- values stored in memory or Redis
- cache entries versioned by logical scope
- PostgreSQL used as the scope-version truth
- PostgreSQL notifications used for cross-instance invalidation propagation

This is more sophisticated than a plain process-local TTL map.

## Namespaces

The app defines dedicated cache namespaces for domains such as:

- settings
- templates
- firms
- clients
- deals
- users
- missions
- resumes
- candidate pipeline
- email templates
- resume comments
- backup settings
- jobs
- GDPR audit
- tags
- grouped views

This means caching is not accidental; it is designed per domain.

## Scoped Versioning

Each logical cache entry belongs to a scope.

The effective stored key is built from:

- scope name
- current scope version
- logical key

Conceptually:

- `scope:v<version>:key`

If the scope version changes, old entries become stale automatically because subsequent reads resolve to a new versioned key.

## Scope Version Truth

Scope versions are stored in PostgreSQL in `public.cache_scope_versions`.

This is important because:

- the version truth is shared across instances
- invalidation does not rely only on local process state
- the cache can remain coherent in multi-instance deployments

## Invalidation Model

Invalidation works by:

1. bumping the scope version in PostgreSQL
2. publishing a notification on `cache_invalidations`
3. letting local namespaces forget old entries for that scope
4. letting other instances receive the same invalidation payload through `LISTEN/NOTIFY`

So the important behavior is not `delete this key from Redis` but `advance the scope version and notify everyone`.

## Storage Backend vs Coherence Mechanism

These are different concerns.

### Storage backend

The cache can store values in:

- memory
- Redis

### Coherence mechanism

Coherence is driven by:

- PostgreSQL scope versions
- PostgreSQL notifications

This distinction matters because Redis is optional, but the application cache model still exists without it.

## Memory Mode

In memory mode, namespaces provide:

- TTL-based expiry
- periodic cleanup
- max-size trimming

This keeps the local cache bounded even without Redis.

## Redis Mode

In Redis mode:

- Redis stores cached values
- the app still uses the same scoped-version logic
- the app still relies on PostgreSQL-backed invalidation/version truth

If Redis is configured but unavailable:

- the effective backend falls back to memory
- the application cache layer remains active

This fallback is intentional and visible in diagnostics.

Recent decomposition work split Redis connection state out of the main cache service into a dedicated helper so cache namespace logic is less entangled with global Redis lifecycle bookkeeping.
The remaining invalidation key composition and grouped-view invalidation helpers are also now isolated from the main service, which keeps namespace definitions and lifecycle code separate from key-set assembly logic.

## Request Coalescing

The cache layer also avoids duplicate concurrent loads for the same versioned key through pending-load tracking.

Practical effect:

- if several requests miss the same key at the same moment
- the loader runs once
- the others await the same pending promise

This is an important performance characteristic, not just a convenience feature.

## TTLs

TTL is still present, but it is not the whole model.

Observed TTLs vary by namespace. Examples:

- settings/templates: longer-lived
- jobs/GDPR audit/grouped views: shorter-lived
- resumes/missions/pipeline: medium-lived

TTL controls freshness over time, while scope-version invalidation controls correctness after mutations.

## Route-Level Cache Bypass

Some routes support explicit cache bypass with:

- `refresh=1`
- `refresh=true`

This is useful for admin/debug/consistency-sensitive reads and is part of the intended cache contract.

Recent pipeline-specific note:

- the candidate-pipeline route family now also needs this bypass behavior on read endpoints
- otherwise a successful pipeline mutation can be followed by an immediate stale reread that visually rewinds the UI even though the write succeeded
- mission-pipeline post-mutation reloads are therefore expected to force `refresh=1`

## Diagnostics

The cache layer exposes meaningful diagnostics, including:

- configured backend
- effective backend
- connection state
- fallback reason
- cache hit/miss stats
- per-namespace stats
- application-cache active state

Recent decomposition note:

- `server/services/cache.service.js` now focuses more on cache registry composition, public namespaces, invalidation helpers, and exported operational APIs.
- The memory/Redis namespace implementations and versioned-key machinery now live in `server/services/cacheNamespaces.service.js`.

This is why the metrics/admin surfaces can explain cache behavior in production.

## Why This Matters

- The cache model is part of the architecture, not a transparent optimization.
- Mutation flows are expected to invalidate by scope.
- Multi-instance behavior depends on PostgreSQL notification wiring.
- Redis should not be misunderstood as the only source of truth for cache correctness.

## Practical Reading

When cache behavior looks wrong, inspect in this order:

1. namespace and scope key used by the feature
2. whether invalidation was triggered
3. scope version state in PostgreSQL
4. whether notifications are being received
5. configured vs effective backend
6. whether the route bypassed cache with `refresh=1`

## Related

- [[topics/Docker Environment]]
- [[topics/Metrics and Diagnostics]]
- [[topics/Observability and Quality]]
- [[topics/Admin and Operations]]

## Sources

- [[raw/sources/2026-04-16-cache-architecture]]
