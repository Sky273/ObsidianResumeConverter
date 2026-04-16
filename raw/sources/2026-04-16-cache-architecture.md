# Source Note: application cache architecture

## Purpose

Capture the real cache model used by ResumeConverter, beyond the high-level install-doc description.

## Files inspected

- `server/services/cache.service.js`
- `server/services/cacheVersion.service.js`
- `server/utils/requestCacheControl.js`
- `server/config/constants.js`

## Durable facts

- ResumeConverter does not use a naïve key/value TTL cache only.
- The application cache is namespace-based and versioned by scope.
- Each cache namespace tracks:
  - logical keys
  - scope names
  - scope versions
  - pending loads
  - scope-to-entry mapping
  - usage stats
- Cache keys are transformed into versioned keys of the form:
  - `scope:v<version>:key`
- Scope versions are stored in PostgreSQL in `public.cache_scope_versions`.
- Invalidation works by bumping the scope version in PostgreSQL rather than deleting one logical key only.
- After invalidation, the app publishes a PostgreSQL notification on channel `cache_invalidations`.
- Other instances can subscribe through `LISTEN/NOTIFY` and locally apply invalidation payloads.
- This means cache coherence is driven by:
  - DB-backed scope version truth
  - PostgreSQL notifications for cross-instance propagation
- Redis is a storage backend option, not the coherence mechanism itself.
- When Redis is configured and available, Redis stores cached values.
- When Redis is configured but unavailable, the app falls back to memory while preserving the application-cache layer.
- Memory namespaces include:
  - TTL expiry cleanup
  - max-size trimming
  - periodic cleanup interval
- Cache stats distinguish:
  - configured backend
  - effective backend
  - connection state
  - disabled/fallback reason
- `getOrLoad` coalesces concurrent loads through `pendingLoads`, avoiding duplicate loader execution for the same versioned key.
- The `refresh=1` or `refresh=true` query parameter bypasses cached reads at route level where used.
- Cache namespaces already cover multiple domains such as:
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

## Interpretation

- ResumeConverter uses an application-level coherent cache, not just a local in-process memoization layer.
- Redis improves shared storage behavior, but PostgreSQL remains the source of truth for cache invalidation/versioning.
- The important mental model is `versioned scoped cache with notification-driven invalidation`, not `plain TTL cache`.
