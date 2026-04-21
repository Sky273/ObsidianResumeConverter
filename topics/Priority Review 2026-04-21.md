# Priority Review 2026-04-21

## Summary

Repository inspection on 2026-04-21 confirms that ResumeConverter remains broad and fairly well tested, but the highest-priority review areas are still concentrated in backend runtime orchestration, long-running export/AI workflows, auth/session edge handling, and overall product-surface sprawl.

## Current State

- The codebase keeps a wide active surface:
  - `45` backend route modules under `server/routes`
  - `144` frontend page files under `client/src/pages`
  - `595` client source files, `362` server source files, `253` test files, and `17` PDF-server files across the inspected JS/TS source tree
- Runtime control is still centralized in a few modules:
  - `server/proxy-server.js` remains the main HTTP/bootstrap/security composition root
  - `server/config/lifecycle.js` still owns server startup, TLS, DB initialization, runtime maintenance start, graceful shutdown, agent teardown, and forced exit policy
  - `server/config/routeRegistry/apiRoutes.js` still acts as the registration hub for a wide backend API surface
- Heavy core-path services remain large:
  - `server/services/batchJobsWorker/exportGenerator.js` (`638` lines)
  - `server/services/aiCredits.service.js` (`564` lines)
  - `server/services/resumes.service.js` (`327` lines)
  - `server/services/batchJobsWorker/processors/improvement.js` (`178` lines) plus surrounding worker modules
- Frontend app composition is simpler than the backend, but route and auth behavior still have broad reach:
  - `client/src/App.tsx` special-cases public share rendering outside the normal provider stack
  - `client/src/context/AuthContext.tsx` still contains session bootstrap, expired-session recovery, redirect coupling, and auth state ownership
  - `client/src/app/appRoutes.tsx` exposes a wide authenticated product surface across resumes, missions, clients, deals, adaptations, admin, metrics, settings, GDPR, backup, and credits

## Priority Order

1. Backend runtime control tower
   The first review target remains the backend entry/runtime layer because startup, shutdown, DB gating, proxy behavior, security middleware, route registration, and maintenance orchestration still converge through a small set of files. That creates high blast radius for operational changes and makes failures harder to localize.

2. Long-running export and AI-credit workflows
   Export generation, batch processing, OCR/LLM orchestration, and credit reservation/refund semantics remain the most failure-prone stack. These paths combine temp files, archive budgets, retries, external services, job state transitions, and financial side effects in the same workflows.

3. Auth/session edge handling
   Auth remains operationally important because session restore, expired-session cleanup, public-route behavior, and client-side redirect logic are still coupled through `AuthContext` and special-case top-level rendering. This area is not obviously broken today, but it still deserves priority review because a small regression can block a large part of the app.

4. Product-surface sprawl
   The application still carries substantially more surface than the core resume ingestion -> analysis -> improvement/adaptation -> export/matching loop: admin workspace, metrics, backup, GDPR, market radar, ROME data, billing, and secondary CRM-like flows all share the same runtime. This increases maintenance cost and raises the chance that secondary work destabilizes the core path.

5. Contract tightening around control-plane settings
   Runtime behavior still depends heavily on settings, roles, credits, and provider configuration. The main review lens here is reducing hidden coupling between control-plane state and business workflows rather than adding more features.

## Important Facts

- The previous quality concern around frontend type checking is no longer current:
  - `npm run typecheck` passes on 2026-04-21
- The PDF-server quality posture remains a strength:
  - `npm run test:pdf` passes on 2026-04-21 (`11` files, `359` tests)
- Current risk is therefore more about hotspot concentration and operational coupling than about an obvious broad validation gap.

## Recommended Near-Term Focus

- Review and continue decomposing the backend composition root:
  - separate pure app wiring from process lifecycle and shutdown policy
  - isolate route registration ownership by domain
  - reduce the number of cross-cutting concerns handled directly in `proxy-server.js`
- Continue hardening export and credit-coupled workflows:
  - clearer idempotency boundaries
  - tighter temp-artifact lifecycle guarantees
  - narrower retry/failure classes
  - clearer separation between orchestration, persistence, and side effects
- Keep auth/session behavior intentionally narrow:
  - reduce route-specific boot logic
  - keep public vs authenticated rendering contracts explicit
- Apply scope discipline to roadmap work:
  - prefer work that stabilizes core resume workflows over expanding secondary modules

## Related

- [[overview]]
- [[topics/Architecture]]
- [[topics/Observability and Quality]]
- [[topics/Product Scope and Priorities]]
- [[topics/Batch Jobs and Long-Running Workflows]]
- [[topics/LLM Control Plane]]
- [[topics/Priority Review 2026-04-18]]

## Sources

- Repository inspection on 2026-04-21:
  - `package.json`
  - `server/proxy-server.js`
  - `server/config/lifecycle.js`
  - `server/config/routeRegistry/apiRoutes.js`
  - `server/services/aiCredits.service.js`
  - `server/services/resumes.service.js`
  - `server/services/batchJobsWorker/exportGenerator.js`
  - `server/services/batchJobsWorker/processors/improvement.js`
  - `client/src/App.tsx`
  - `client/src/app/appRoutes.tsx`
  - `client/src/context/AuthContext.tsx`
  - `npm run typecheck`
  - `npm run test:pdf`
