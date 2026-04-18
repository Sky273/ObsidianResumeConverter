# Priority Review 2026-04-18

## Summary

The application remains broad and reasonably well tested, but the main risks are still concentrated in backend orchestration, long-running AI/document workflows, and product-surface sprawl around control-plane and secondary modules.

## Current State

- Repository inspection on 2026-04-18 confirms a large active surface:
  - `45` backend route modules under `server/routes`
  - `154` frontend page files under `client/src/pages`
  - `380` test files across `server`, `client`, `pdf-server`, and `e2e`
- Runtime entry points are still highly central:
  - `server/proxy-server.js` remains the main HTTP/bootstrap/security/error-handling hub
  - `server/config/lifecycle.js` is smaller than before but still owns server start, TLS, DB gating, timeout policy, and graceful shutdown
  - `server/config/lifecycle/runtimeMaintenance.js` is now only a thin re-export shim, but startup and shutdown orchestration still converge through the runtime-maintenance subtree
- Large service hotspots remain in the main operational risk path:
  - `server/services/batchJobsWorker/exportGenerator.js`
  - `server/services/batchJobsWorker/processors/improvement.js`
  - `server/services/aiCredits.service.js`
  - `server/services/resumes.service.js`
- Frontend route and auth composition remain manageable but broad:
  - `client/src/app/appRoutes.tsx` still exposes a wide authenticated surface across resumes, missions, clients, deals, adaptations, admin, metrics, settings, GDPR, backup, and credits
  - `client/src/App.tsx` still gates most of the app through stacked global providers, with a special-case public share path

## Important Facts

- The previous backend decoupling work is real but partial:
  - lifecycle cleanup/scheduler logic moved out of `server/config/lifecycle.js`
  - `server/config/lifecycle/runtimeMaintenance.js` now acts as a thin public orchestration layer
  - startup concerns now live in `server/config/lifecycle/runtimeMaintenance.startup.js`
  - shutdown concerns now live in `server/config/lifecycle/runtimeMaintenance.shutdown.js`
  - startup orchestration is now further split by concern into:
    - `runtimeMaintenance.cacheBootstrap.js`
    - `runtimeMaintenance.database.js`
    - `runtimeMaintenance.alwaysOn.js`
  - shutdown orchestration is now grouped explicitly through `runtimeMaintenance.shutdownGroups.js`
  - runtime orchestration is still materially centralized by concern, but no longer concentrated in one large maintenance file
  - export generation has also started to decompose around clearer concerns:
    - `server/services/batchJobsWorker/exportGenerator.documents.js`
    - `server/services/batchJobsWorker/exportGenerator.support.js`
  - improvement processing has also started to decompose around clearer concerns:
    - `server/services/batchJobsWorker/processors/improvementAnalysis.js`
    - `server/services/batchJobsWorker/processors/improvementPersistence.js`
  - AI credit handling has also started to decompose around clearer concerns:
    - `server/services/aiCreditsActions.service.js`
    - `server/services/aiCreditsLedger.service.js`
  - resume service responsibilities have also started to decompose around clearer concerns:
    - `server/services/resumesInvalidation.service.js`
    - `server/services/resumesConsent.service.js`
- The quality posture is still a strength:
  - validation scripts exist for lint, typecheck, backend, client, PDF, and e2e
  - test volume is high enough that the main concern is hotspot complexity and operational coupling, not an obvious lack of coverage
  - repository inspection on 2026-04-18 confirmed `npm run test:pdf` passes (`11` files, `359` tests)
  - repository inspection on 2026-04-18 confirmed `npm run typecheck` currently fails in frontend test tooling rather than product runtime code:
    - `client/src/components/Metrics/OperationLLMCard.test.tsx` mocks `t` with a type shape incompatible with the current `i18next` `TFunction`
    - several frontend tests import `jest-axe` without an installed declaration file
- The application scope is still wider than the core product nucleus:
  - core resume workflows coexist with billing, backup, market intelligence, ROME data, GDPR audit, email tooling, admin diagnostics, and secondary CRM-like surfaces
- The biggest technical risk remains cross-cutting failure propagation:
  - one change in settings, startup, cache invalidation, worker lifecycle, or document processing can still affect multiple product areas

## Priority Order

1. Backend runtime decomposition
   The highest leverage work remains reducing the operational blast radius around startup, shutdown, schedulers, workers, cache invalidation, and environment-gated services. The immediate target is not a rewrite; it is to break the runtime control tower into smaller modules with clearer ownership and failure boundaries.

2. Hardening of long-running document and AI workflows
   Export, OCR, improvement, adaptation, batch processing, and credit-linked operations still form the most failure-prone stack. These paths combine large payloads, temp files, provider behavior, retries, deadlines, cleanup, and billing semantics. They deserve continued guardrail work before broadening product scope further.

3. Scope discipline on secondary modules
   The repository already carries more product surface than the core CV -> analysis -> matching -> submission loop needs. Priority should go to simplifying and stabilizing the core path instead of expanding backup UX, market data, governance, or other secondary modules.

4. Control-plane contract tightening
   Settings, auth/session state, and role-scoped admin surfaces still have broad behavioral reach. Priority should go to reducing ambiguous data shapes, compatibility aliases, and hidden runtime coupling between settings and business workflows.

5. Targeted hotspot decomposition
   After runtime safety and workflow hardening, the next maintainability wins are in large services on the core path, especially export, batch improvement, resumes, and AI credits. The aim is local decomposition of policy vs I/O vs transformation logic, not broad refactoring.

## Recommended Near-Term Focus

- Split `server/config/lifecycle/runtimeMaintenance.js` by concern:
  - cache/runtime invalidation
  - schedulers
  - worker lifecycle
  - cleanup/destroy steps
- Continue strengthening the heavy workflow stack:
  - explicit deadlines
  - bounded temp-file retention
  - idempotent credit settlement
  - clearer retry classification
- Apply product-scope discipline to roadmap choices:
  - prefer work that improves ingestion, analysis, improvement, adaptation, export, matching, and submission
  - defer new secondary surfaces unless they reduce operational cost or compliance risk
- Keep tightening backend/frontend contracts where runtime settings or auth state shape can drift.

## Related

- [[overview]]
- [[topics/Architecture]]
- [[topics/Observability and Quality]]
- [[topics/Product Scope and Priorities]]
- [[topics/Batch Jobs and Long-Running Workflows]]
- [[topics/LLM Control Plane]]
- [[topics/Priority Review 2026-04-17]]

## Sources

- Repository inspection on 2026-04-18:
  - `package.json`
  - `server/proxy-server.js`
  - `server/config/lifecycle.js`
  - `server/config/lifecycle/runtimeMaintenance.js`
  - `server/config/lifecycle/runtimeMaintenance.startup.js`
  - `server/config/lifecycle/runtimeMaintenance.shutdown.js`
  - `server/config/routeRegistry/apiRoutes.js`
  - `server/routes/settings.routes.js`
  - `server/services/batchJobsWorker/itemProcessors.js`
  - `server/services/batchJobsWorker/exportGenerator.js`
  - `server/services/batchJobsWorker/processors/improvement.js`
  - `server/services/aiCredits.service.js`
  - `server/services/resumes.service.js`
  - `client/src/App.tsx`
  - `client/src/app/appRoutes.tsx`
  - `client/src/app/routeGuards.tsx`
  - `client/src/context/AuthContext.tsx`
  - `client/src/services/authService.ts`
  - `pdf-server/server.cjs`
  - `npm run typecheck`
  - `npm run test:pdf`
