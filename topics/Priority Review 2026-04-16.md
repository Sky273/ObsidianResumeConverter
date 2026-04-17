# Priority Review 2026-04-16

## Summary

High-priority review areas now cluster around delivery/runtime integrity, secret handling in Docker packaging, and cross-cutting maintainability drift on top of the already-known backend operational hotspots.

## Current State

- The application surface is broad: SPA frontend, Express proxy, PostgreSQL-backed domain model, batch workers, OCR pipeline, PDF/DOCX generation service, billing, email, and admin tooling.
- Quality posture is meaningful:
  - `214` backend test files
  - `129` client test files
  - `16` Playwright spec files
  - CI runs `validate:core` then `validate:e2e` on Ubuntu with Node `22`
- The most important currently documented backend risks remain:
  - memory amplification and sync I/O in batch export generation
  - cleanup routines that need stricter managed-path boundaries
  - incomplete OCR temp directory cleanup
- Two previously identified hardening items have now been materially reduced in code:
  - DOCX validation is now strict OOXML validation that requires both `[Content_Types].xml`, `_rels/.rels`, and a declared main document part that actually exists
  - validation scripts now invoke local project binaries directly instead of depending on a globally resolvable `tsc` / `vitest` / `playwright`
- Structural complexity is still concentrated in a few central files:
  - `server/services/cache.service.js` (`731` lines)
  - `server/services/aiCredits.service.js` (`699` lines)
  - `server/services/batchJobsWorker/exportGenerator.js` (`669` lines)
  - `server/config/lifecycle.js` is a central bootstrap/orchestration hotspot
  - frontend complexity is distributed but still heavy in page hooks/sections such as `client/src/pages/UsersManagement.hooks.ts` (`674` lines) and `client/src/pages/ResumesPage.parts.tsx` (`625` lines)
- The route surface is extensive, with many feature-heavy backend route modules around `13k` to `20k` bytes each.
- Local validation now fails fast for environment-policy reasons rather than deep tool breakage:
  - `npm run typecheck` and `npm run lint` both abort through `scripts/tooling-preflight.mjs` when the workspace is not on Node `22.x`
  - the inspected workspace is currently on Node `25.9.0`, so local validation remains blocked until the runtime is aligned with `.nvmrc` and `package.json.engines`
- After switching the inspected workspace back to Node `22.22.2`, local validation progresses further and exposes an inconsistent dependency install:
  - `npm run typecheck` fails in `node_modules/typescript/lib/lib.dom.d.ts` because the file is truncated/corrupted around `SVGFEDropShadowElement.addEventListener`
  - `npm run lint` fails because `node_modules/eslint/package.json` is missing and `npm ls` marks the local `eslint` install as invalid
  - practical implication: the next corrective action is dependency reinstall/normalization (`npm ci` or equivalent), not application-code debugging
- After a clean dependency reinstall, validation reaches real project issues:
  - `npm ls` is healthy again for top-level `typescript@5.9.3` and `eslint@10.0.3`
  - `npm run typecheck` now reports a small set of real source errors in `client/src/components/ErrorBoundary.tsx`, `client/src/pages/UsersManagement.hooks.ts`, and `client/src/services/authService.ts`
  - `npm run lint` reports many source findings, but the result is heavily polluted by generated files under `client/dist-e2e/**`
  - `eslint.config.js` ignores `client/dist/**` and `client/coverage/**` but currently does not ignore `client/dist-e2e/**`, so lint scope should be corrected before treating the full lint count as actionable
- Current validated state after fixes:
  - `npm run typecheck` passes under Node `22.22.2`
  - `npm run lint` passes with zero errors after excluding generated `client/dist-e2e/**` output from lint scope
  - the remaining lint debt is warnings-only (`26` warnings), concentrated in React hook dependency warnings, a few `no-explicit-any` test/helpers, Fast Refresh export warnings, and a handful of unused variables
- Current validated state after warning cleanup:
  - `npm run typecheck` passes under Node `22.22.2`
  - `npm run lint` passes with zero errors and zero warnings
  - Fast Refresh warnings were resolved by moving non-component exports into dedicated helper/constants files where appropriate (`DealsTab` and `FactsPage`)
  - generated `client/dist-e2e/**` output remains excluded from lint scope so validation reflects source files rather than built artifacts
- Behavioral validation snapshot after the static cleanup:
  - `npm run test:pdf` passes (`359` tests, `11` files)
  - `npm test` now passes (`3354` tests, `214` files)
  - `npm run test:client` now passes (`526` tests, `129` files)
  - the previously failing backend/client suites were resolved without product-code refactors; the main fixes were test contract updates for current LLM/runtime behavior, stricter DOCX test fixtures, and UI test assumptions aligned with fresh-resume loading
  - `npm run validate:core` now passes end-to-end on Node `22.22.2`
  - `happy-dom` abort/noise traces have been suppressed in client test setup; remaining validation noise is limited to non-blocking Node deprecation warnings around `punycode` (`DEP0040`)
  - E2E validation is now also green: `npm run validate:e2e` passes (`86` Playwright tests across Chromium and Firefox)
  - the E2E-specific fixes were targeted and infrastructural rather than broad product refactors:
    - Playwright web-server startup now injects a strong fallback `DEFAULT_ADMIN_PASSWORD` so production-like env validation does not abort local E2E boot
    - the auth E2E helper now publishes settings cache invalidation after flipping `allow_user_registration_without_approval`, because the registration path reads process-local cached `llm_settings`
    - E2E bootstrap ensures the shared firm has a minimum credit balance so improve/export scenarios do not fail spuriously on insufficient credits
    - `server/services/batchJobCredits.service.js` no longer orders cancelled batch jobs by a non-existent `batch_jobs.updated_at`; it uses real lifecycle timestamps instead
    - the resumes/adaptations refresh spec now uses deterministic post-upload naming plus more stable UI selectors, which removes false failures caused by parser-derived duplicate names and filter-panel text collisions
- Runtime/toolchain versions are currently skewed across environments:
  - Docker builder now targets Node `22`
  - CI runs Node `22`
  - the inspected local workspace uses Node `25.9.0`
  - this increases the risk of contributor-only failures and hard-to-reproduce dependency behavior
- The repository now explicitly standardizes local validation on Node `22`:
  - `package.json` declares `engines.node >=22 <23`
  - `.nvmrc` pins `22`
  - local wrappers now fail fast with explicit diagnostics when Node or local tool installs are out of policy
- Secret handling still has a real packaging risk despite stronger runtime validation:
  - `.env.docker` is now ignored by git going forward
  - `Dockerfile` still bakes fallback `POSTGRES_PASSWORD`, `JWT_SECRET`, `REFRESH_TOKEN_SECRET`, and `CSRF_SECRET` values directly into the runtime image
- Documentation and text encoding drift are visible in user-facing and operational sources:
  - `README.md` version and stack badges are now aligned with runtime reality (`1.9.1`, Node `22.x`, React `19.2`, TypeScript `5.9`)
  - README/install/auth-related files still contain mojibake and mixed legacy terminology

## Important Facts

- Database migrations are driven by `server/scripts/docker-migrate.js` and canonical SQL assets under `docker/`, not a `server/database/migrations` directory.
- Migration/bootstrap logic still contains mojibake in seeded SQL labels, so encoding drift is not limited to docs and can leak into persisted reference data if uncorrected.
- Frontend route loading is already partially optimized through lazy loading and CSS-on-demand in `client/src/app/lazyPages.ts`.
- The backend lifecycle still coordinates many unrelated concerns at startup and shutdown: cache cleanup, schedulers, worker boot, backup init, OAuth state cleanup, memory monitor, and DB listeners.
- Existing audit material is high-signal and still aligned with current code hotspots, so it should be treated as active guidance rather than historical noise.
- Frontend auth/client models still carry compatibility aliases (`firmId`/`firm_id`, `firmName`/`firm`, legacy `customer*` aliases), which signals contract drift that should be reduced rather than expanded.
- The E2E registration auto-approval path is sensitive to the settings cache boundary: mutating `llm_settings` directly in a separate process is insufficient unless the app receives the corresponding cache invalidation event.
- The `batch_jobs` table schema does not include `updated_at`; batch-job maintenance/settlement code must rely on `created_at`, `started_at`, or `completed_at` instead.

## Open Questions

- Whether the local typecheck failure is a Windows-only environment issue or indicates a dependency/version mismatch that can also affect contributor onboarding.
- Whether `.env.docker` is intentionally meant to carry live secrets in version control or should be replaced by a sanitized template plus deployment-only injection.
- Whether batch export and OCR cleanup limits have production telemetry proving they are still within safe bounds.
- Whether the PDF server is ever reachable outside loopback in non-production deployments.

## Related

- [[overview]]
- [[topics/Architecture]]
- [[topics/Observability and Quality]]
- [[topics/Maintenance and Cleanup Jobs]]
- [[topics/PDF and Document Generation Boundary]]
- [[topics/Upload OCR and Parsing Pipeline]]
- [[topics/Security and Compliance]]
- [[topics/Docker Environment]]
- [[topics/Environment and Secret Matrix]]

## Sources

- [[raw/session-notes/2026-04-16-memory-bootstrap]]
- [[raw/sources/2026-04-16-backend-audit-and-quality]]
