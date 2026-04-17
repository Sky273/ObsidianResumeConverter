# Priority Review 2026-04-17

## Summary

The application is a broad recruiting platform with meaningful quality coverage, but its operational center of gravity is still concentrated in a few backend orchestration and AI/batch services. The top priorities are therefore to reduce operational coupling in the backend core, harden the heaviest long-running document workflows, and simplify product/governance surfaces that currently expand faster than the architecture contracts.

## Current State

- Product surface remains wide:
  - authenticated SPA frontend
  - Express proxy/API backend
  - dedicated PDF server
  - PostgreSQL, Redis, OCR, batch jobs, billing, email, metrics, and admin tooling
- Current code inspection confirms that the backend runtime still pivots around a few high-leverage files:
  - `server/proxy-server.js`: central HTTP bootstrap, security middleware, body parsing, metrics, route registration, and global error handling
  - `server/config/lifecycle.js`: startup and shutdown orchestration for DB, schedulers, workers, cleanup loops, cache invalidation, memory monitor, and backup flow
  - large services such as `server/services/batchJobsWorker/exportGenerator.js`, `server/services/cache.service.js`, `server/services/aiCredits.service.js`, and `server/services/missions.service.js`
- Route and page surface are both substantial:
  - `44` backend route modules under `server/routes`
  - lazy-loaded frontend pages spanning resumes, missions, clients, adaptations, settings, metrics, backup, admin, GDPR, and credits
- The current test posture remains a strength rather than a weak point:
  - `214` backend test files
  - `129` client test files
  - Playwright E2E coverage already documented as green in the previous priority review

## Important Facts

- ResumeConverter is no longer "just" a resume converter; it is a multi-domain recruiting application with several control planes:
  - auth/access
  - AI/provider/settings
  - billing/credits
  - templates/export
  - admin/ops
- The architecture risk is less about missing features and more about concentration of responsibility:
  - startup and shutdown coordination remain highly centralized
  - long-running batch/export/OCR/AI flows cross several storage, timeout, and cleanup boundaries
  - settings continue to act as a runtime control plane with large behavioral reach
- Frontend route loading is already reasonably optimized through lazy loading, so the main application risks are more backend-operational than frontend-rendering.
- The repository structure still suggests scope growth pressure:
  - business modules for missions, deals, clients, pipelines, templates, facts, billing, backup, and compliance now coexist in one deployable application
  - central route and service files continue to accumulate policy and orchestration logic
- Initial remediation has started on the highest-priority backend hotspot:
  - runtime startup/shutdown orchestration has been extracted out of `server/config/lifecycle.js` into a dedicated runtime-maintenance helper
  - shutdown cleanup is now best-effort, so one failing cleanup step no longer aborts later shutdown steps such as cache listener stop, DB pool close, or agent teardown
- Initial remediation has also started on long-running batch export workflows:
  - both the HTTP batch export route and the batch worker export generator now enforce a configurable archive-byte budget through shared guard logic
  - export telemetry now records generated artifact bytes earlier, and worker retry logging now includes per-attempt diagnostics
- Additional remediation has now landed on the remaining long-running workflow priorities:
  - PDF extraction no longer escalates into an unbounded full-document OCR pass; a dedicated page-budget decision now controls whether that second pass is allowed
  - template extraction now bounds prompt construction in the service layer and can fall back to deterministic layout extraction before making an oversized LLM call
  - batch LLM analysis/improvement wrappers now propagate per-item deadlines, and retry paths in resume operations stop once that item budget is exhausted
- Hotspot decomposition has also started on the AI credit path:
  - low-level credit-ledger primitives were extracted out of `server/services/aiCredits.service.js` into `server/services/aiCreditsLedger.service.js`
  - business reservation/refund policy remains in the main service, while locking, balance updates, transaction inserts, and cache invalidation are now isolated
- Control-plane tightening has started on the auth/user contract:
  - frontend sign-in and session-restore flows now normalize legacy firm aliases into canonical `firmId` / `firmName` fields before the user reaches `AuthContext`
  - core auth-driven UI consumers have started dropping direct reads of `firm_id` and `firm` in favor of the canonical fields
- Control-plane tightening has also progressed on the backend settings path:
  - `server/routes/settings.routes.js` no longer carries as much inline shaping logic for defaults, lightweight public responses, and mutation preparation
  - that logic now lives in `server/routes/settings.routes.helpers.js`, keeping the route file closer to transport/auth/cache concerns
- Hotspot decomposition has also started on the missions domain path:
  - the grouped "missions by deal" assembly path has been extracted from `server/services/missions.service.js` into `server/services/missionsGroupedView.service.js`
  - grouped-view attachment enrichment is now centralized instead of duplicated for assigned and unassigned mission collections

## Priority Order

1. Backend operational decoupling
   The main server startup/shutdown path still coordinates too many unrelated concerns. `server/config/lifecycle.js` is now an application control tower for DB init, backup scheduler, GDPR scheduler, batch workers, cache invalidation, temp cleanup, token cleanup, memory monitor, and service destruction. This is the highest leverage area because failures or regressions here can impact the whole app, not a single feature.

2. Long-running AI/document workflow hardening
   Export generation, OCR, template extraction, resume analysis, and batch jobs remain the most failure-prone class of workflows because they combine external providers, large payloads, temp files, credits, retries, and cleanup. The codebase has already fixed several defects here, which is a signal that this remains an active risk zone rather than closed debt.

3. Control-plane simplification and contract tightening
   The settings and governance surfaces have broad runtime impact. Combined with compatibility aliases on the frontend auth/client models and a large backend route surface, this creates contract drift risk. Priority should go to reducing ambiguous data shapes and narrowing which settings actually influence runtime-critical behavior.

4. Service hotspot decomposition
   Large files such as `cache.service.js`, `aiCredits.service.js`, `exportGenerator.js`, and some page hooks/parts files are clear maintainability hotspots. This is secondary to runtime safety, but it directly affects delivery speed and defect rate. The goal is not broad refactoring; it is to split responsibilities where current files mix policy, I/O, and transformation logic.

5. Product-scope discipline
   The application already contains many secondary modules beyond core resume workflows. New feature work should be judged against the core path:
   - ingest
   - analyze/improve/adapt
   - export/share
   - mission/client delivery pipeline
   Admin, market intelligence, backup UX, and other secondary modules should not keep expanding faster than the core architecture is being simplified.

## Recommended Near-Term Focus

- Stabilize the backend core before adding more surface area:
  - isolate lifecycle responsibilities
  - reduce hidden coupling between settings, schedulers, caches, and workers
- Continue treating AI/export/OCR/batch flows as the main operational risk stack:
  - memory usage
  - temp-file hygiene
  - retry/fallback behavior
  - credit settlement correctness
- Invest in narrower contracts between frontend and backend:
  - reduce alias fields
  - reduce settings sprawl
  - keep public/admin/superadmin boundaries explicit
- Prefer targeted decomposition of hotspot files over broad architecture rewrites.

## Related

- [[overview]]
- [[topics/Architecture]]
- [[topics/Core Resume Workflows]]
- [[topics/Batch Jobs and Long-Running Workflows]]
- [[topics/Batch Job State Machine]]
- [[topics/LLM Control Plane]]
- [[topics/Resume Presentation and Templates]]
- [[topics/Security and Compliance]]
- [[topics/Observability and Quality]]
- [[topics/Priority Review 2026-04-16]]

## Sources

- Current repository inspection on 2026-04-17:
  - `package.json`
  - `server/proxy-server.js`
  - `server/config/lifecycle.js`
  - `server/config/routeRegistry.js`
  - `client/src/App.tsx`
  - `client/src/app/appRoutes.tsx`
  - `client/src/app/lazyPages.ts`
- [[topics/Priority Review 2026-04-16]]
