# Observability and Quality

## Summary

ResumeConverter has a mature quality and observability posture compared with many small internal apps, including tests across backend, client, PDF server, and e2e flows.

## Validation Structure

Core validation order documented in CI:

1. typecheck
2. backend tests
3. client tests
4. PDF tests
5. Playwright e2e

This order is intended to localize failures early and cheaply.

## Runtime Observability

The app exposes dedicated metrics and operational diagnostics for:

- requests and performance
- errors
- cache
- LLM usage
- OCR runtime
- storage
- cleanup behavior
- database metrics

## Audit Posture

The backend audit shows that the project already invested in:

- multi-firm isolation review
- admin-route alignment
- route validation and pagination hardening
- worker lifecycle correctness
- OAuth/callback integrity
- error sanitization

## Important Facts

- Quality in this project is not just unit tests; it includes cache-refresh behavior, stale-view detection, and security/access guarantees.
- Metrics and diagnostics are rich enough to be considered part of the operational product surface.
- The audit history is itself a durable signal about what the team considers risky.
- The GitHub `validate-core` job depends on `npm run migrate`; failures there can be infrastructure/bootstrap incompatibilities rather than application test regressions.
- As of 2026-04-17, `validate-core` has been re-stabilized after multiple CI-only compatibility fixes:
  - fresh-schema migration bootstrap now tolerates modern `pg_dump` output while still running against GitHub's `postgres:16` service
  - the share resume test path is now cross-platform-safe on Linux runners
  - the retry service test no longer leaks real logger output because the suite mocks the correct logger module path
- As of 2026-04-17, the main frontend warning burst that was still polluting `validate-core` has also been reduced:
  - `useScopedViewRefresh` no longer rebinds refresh behavior on every render for identical scope sets
  - the grouped deals header no longer nests action buttons inside a clickable `<button>` shell
  - sidebar sections use stable explicit keys instead of `null` titles
  - grouped-tag UI now filters blank/duplicate tags before rendering keyed chips/buttons
- As of 2026-04-17, the failing GitHub `validate:e2e` run was narrowed to a mix of stale Playwright assumptions and missing E2E bootstrap state:
  - Playwright helpers now ensure a canonical `llm_settings` row exists on a fresh database with `public_home_enabled = true` and a non-empty `llm_model`, so `/welcome`, self-service registration, and adaptation fixtures are deterministic in CI
  - the self-service auto-approval helper no longer does a no-op `UPDATE` when `llm_settings` is absent; it now creates or updates the canonical settings row before invalidating settings caches
  - the admin CRUD E2E flow no longer hardcodes a stale `firmId`; it derives the active admin firm at runtime
  - the GDPR audit page spec now disambiguates duplicated refresh buttons with `.first()`
  - the signin entry assertion now matches the current auth heading text (`Connectez-vous à votre compte` / `Sign in to your account`) instead of an older `connexion|login` expectation
- As of 2026-04-17, ESLint now has first-class TypeScript coverage for the Playwright suite:
  - a dedicated repo-root `tsconfig.e2e.json` covers `e2e/**/*.ts` and `playwright.config.ts`
  - `eslint.config.js` routes those files through that tsconfig instead of the generic TypeScript `projectService` lookup that previously failed to associate them with any project
  - the only remaining real lint defect was in `e2e/helpers/docx.ts`, where the control-character ASCII regex range was replaced with the equivalent Unicode `\p{ASCII}` form
- As of 2026-04-17, the remaining public-route E2E flake was traced to auth bootstrap rather than route wiring:
  - `AuthContext` blocks public rendering behind `restoreSession()` initialization
  - `authService.restoreSession()` previously used raw `fetch()` calls to `/api/auth/me` and `/api/auth/refresh` without any timeout
  - when those requests stalled in CI, `/welcome` stayed on the global auth spinner long enough for Playwright to miss the `/signin` and `/register` links
  - the fix was to put a short explicit timeout around public auth bootstrap requests and fail closed to unauthenticated state instead of waiting indefinitely
- As of 2026-04-17, the Playwright static build output is intentionally treated as generated state rather than source:
  - `playwright.config.ts` and `scripts/start-playwright-webserver.mjs` point Vite output at `client/dist-e2e`
  - `client/dist-e2e` is a disposable E2E build directory with hash-unstable bundle names
  - the repository now ignores `client/dist-e2e/` and keeps it out of Git tracking to avoid noisy rebuild diffs
- As of 2026-04-17, resume improvement is more resilient to weak/small-model structured-output failures:
  - the improvement generation step already had JSON/plain-text fallback behavior
  - the remaining hard failure point was the post-improvement persistence analysis, which could still abort the whole job on an invalid structured LLM response
  - batch improvement processing now falls back to the analysis embedded in the improvement response when that post-analysis specifically fails with an invalid-response error
  - this preserves the improved CV text and available structured metadata instead of losing the whole user action
- As of 2026-04-17, improvement observability now distinguishes two different degradation modes:
  - `fallbackRuns` continues to represent the original improvement-stage fallback where the model did not return usable structured JSON and the system salvaged plain text
  - `postAnalysisFallbackRuns` now counts the narrower case where improvement generation succeeded but the follow-up persistence analysis returned an invalid structured payload, so the worker persisted the embedded improvement analysis instead
  - the improvement metrics payload also records this path in recent entries with `source: embedded-analysis-fallback` and `stage: post-analysis`
- As of 2026-04-17, public-home E2E startup is less sensitive to runtime settings latency:
  - the `/welcome` route previously depended on the async public-home settings fetch before reliably rendering its public CTA links
  - the client now enables the public-home shell optimistically on the first render of `/welcome`, then lets the runtime settings fetch reconcile afterwards
  - this hardens Playwright navigation flows that click `/signin` and `/register` from the public landing page
- As of 2026-04-17, the remaining Firefox-only E2E flakes were narrowed further to test sequencing rather than product regressions:
  - password recovery was intermittently hanging on `page.goto(..., waitUntil: "load")`, while the page itself became usable earlier
  - the analysis/improve/export upload helper could try to set the file input before the second-step upload UI had fully mounted in Firefox
  - the targeted fix was to relax those navigations to `domcontentloaded` where appropriate and to explicitly wait for the file input before calling `setInputFiles(...)`
- As of 2026-04-17, the E2E helper layer is more intentional about localized/public-shell selectors:
  - `e2e/helpers/ui.ts` now centralizes the fragile localized regexes for signin, register, reset-password, improve, and list/by-deal view toggles
  - public-entry links (`/signin`, `/register`) and list/by-deal mode switches now have shared helper wrappers rather than repeated ad hoc locators in specs
  - this reduces flake risk from wording drift and makes public/auth specs align on the same selector contract
- As of 2026-04-17, local Playwright startup is also less misleading when validating targeted specs:
  - `playwright.config.ts` no longer reuses an arbitrary existing local server by default; reuse now requires `PLAYWRIGHT_REUSE_EXISTING_SERVER=true`
  - this prevents targeted E2E runs from silently binding to a stale manual dev server and producing misleading pass/fail signals
  - the webserver startup timeout was also raised to 180 seconds to better tolerate cold Windows bootstrap runs
- As of 2026-04-17, proxy startup fails fast when PostgreSQL initialization fails:
  - `server/config/lifecycle.js` now shuts the proxy down explicitly if `initializeDatabase()` returns false at startup
  - this avoids the previous state where the process could stay partially alive without ever exposing `/health`, causing Playwright to report a generic health timeout instead of a real startup failure
  - in practice, this makes local E2E bootstrap issues such as wrong PostgreSQL credentials surface immediately as startup defects rather than as misleading auth-spec failures
- As of 2026-04-17, the Playwright webserver wrapper itself now performs an explicit PostgreSQL preflight before the frontend build:
  - the wrapper now also probes the intended local E2E ports before startup (`3001` for the proxy, `3002` for the PDF server by default) and fails early if a stale listener is already present
  - this prevents misleading export-path `403` errors caused by Playwright talking to an old local PDF server instance left behind from a previous debug session or aborted run
  - `scripts/start-playwright-webserver.mjs` checks the live connection using the current `POSTGRES_*` env values and fails early with an actionable message if authentication or connectivity is wrong
  - this makes the most common local E2E bootstrap failure mode (`resume_user` password mismatch / wrong local DB target) obvious before the heavier Vite build step starts
  - the wrapper health timeout was aligned upward as part of the same pass so cold bootstrap runs do not fail prematurely
- As of 2026-04-17, the France market map regression is now explicitly locked by a component test:
  - `FranceMapCanvas` had a real lifecycle defect where MapLibre initialization could churn because the mount effect both created the map and depended on readiness/theme state
  - the runtime fix keeps initialization stable and leaves theme restyling to the dedicated style-sync effect
  - the component also no longer re-imports the MapLibre CSS during map initialization; CSS injection stays centralized in the dedicated runtime-style effect
  - `client/src/components/market/FranceMapCanvas.test.tsx` now asserts that theme changes restyle the existing map instance instead of recreating it
- As of 2026-04-17, the small-model improvement fallback is now covered downstream in adaptation tests:
  - resume adaptation already prefers `resume.improved_text` over `resume.original_text`
  - `server/tests/services/resumeAdaptation.service.test.js` now asserts that mocked downstream adaptation content is built from `improved_text` when present
  - this reduces the risk of silently validating only the persistence fallback while still regressing the user-visible adaptation path
- As of 2026-04-17, French UI and regression fixtures are expected to stay as real UTF-8 text without BOM:
  - accented strings in the resume-analysis and resume-improvement surfaces are preserved directly in source instead of being degraded to mojibake or ASCII fallbacks
  - the targeted regression tests around resume entry, improvement, export, and improved-text editing now use the same preserved accented fixtures
- As of 2026-04-17, the French accent cleanup was extended beyond the CV path into shared admin/editor surfaces:
  - visible fallback strings were corrected in upload/extraction, settings, templates, users, metrics, backup-failure email content, GDPR mail errors, and Tiptap toolbar/table controls
  - remaining mojibake-like patterns intentionally left in the codebase are compatibility matchers used to recognize corrupted LLM payloads or legacy malformed text during salvage/fallback processing
  - the repository policy for user-visible French text is now explicit: keep direct accented UTF-8 text without BOM instead of ASCII approximations such as `modele`, `acces`, or `reinitialiser`
- As of 2026-04-17, improvement fallback observability is now surfaced in the client metrics UI as well as the backend payload:
  - `postAnalysisFallbackRuns` is exposed in the metrics types and displayed in the improvement operations card
  - a dedicated client regression test now locks that rendering path so the post-analysis fallback counter cannot silently disappear during future refactors
- As of 2026-04-17, the weak-model improvement path is also resilient to sparse but technically valid post-analysis payloads:
  - improvement persistence no longer only distinguishes `valid` vs `invalid` post-analysis responses
  - when the post-analysis succeeds but omits fields such as title, summary, tags, or suggestions, the worker now merges those missing fields from the embedded analysis returned by the original improvement step
  - this merge path is tracked separately from the invalid-response fallback path through `postAnalysisMergeRuns` and `source: embedded-analysis-merge`
- As of 2026-04-17, adaptation diagnostics now preserve which resume text source fed the adaptation path:
  - recent adaptation metrics entries record whether the operation ran from `improved_text` or `original_text`
  - the client metrics card renders this as a human-readable resume-source label, so operators can tell whether a degraded downstream result still used the improved resume variant
- As of 2026-04-17, the upload phase of the analysis/improve/export Playwright flow uses a shared helper instead of an inline file-input sequence:
  - `e2e/helpers/ui.ts` now exposes a dedicated `setInputFilesWhenReady(...)` helper
  - the analysis/improve/export spec uses that helper so the upload step is less timing-sensitive and easier to reuse in future multi-step upload specs
- The remaining CI warnings at this point are non-blocking:
  - GitHub Actions deprecation warnings around Node 20-based action runtimes
  - Node `DEP0040` warnings around `punycode` from transitive dependencies during validation runs
- As of 2026-04-17, GitHub Actions is explicitly opted into Node 24-based JavaScript action runtimes via workflow env:
  - this removes the known deprecation path for `actions/checkout`, `actions/setup-node`, and `actions/upload-artifact` without changing the project runtime itself
  - the residual `punycode` warning remains transitive through `jsdom`/`whatwg-url` and `eslint`/`ajv` dependency chains, so it is tracked as dependency debt rather than an application defect
- As of 2026-04-17, CI log noise from the transitive `DEP0040` `punycode` warning is now suppressed at workflow level:
  - the project still carries that dependency debt transitively through `jsdom` and `eslint` chains
  - the CI workflow now uses `NODE_OPTIONS=--disable-warning=DEP0040` so validation logs stay focused on actionable failures while leaving runtime behavior unchanged
- The setup docs also define stable E2E reference flows:
  - `upload -> analysis`
  - `analysis -> improve -> export`
- Playwright authentication is intentionally helper-driven with JWT cookie bootstrapping instead of relying only on UI signin flows.
- Cache behavior should be understood as part of correctness, not only performance, because scope-version invalidation is part of the data-consistency contract.

## Current CI Status

- GitHub `validate-core`: green again after migration, cross-platform, and frontend warning-cleanup fixes
- Local `client` Vitest: green after the refresh-hook stabilization and grouped-deals/Sidebar fixes (`129` files, `529` tests)
- Targeted Playwright reruns on 2026-04-17 after the E2E bootstrap/spec fixes:
  - Chromium: `auth`, `public-navigation`, `admin-quality-pages`, `admin-crud-flows`, `resumes-adaptations-refresh` all green
  - Firefox: `auth`, `public-navigation`, `admin-quality-pages`, `admin-crud-flows` all green
- Local ESLint on 2026-04-17: `node .\scripts\run-eslint.mjs e2e playwright.config.ts` green after the dedicated E2E tsconfig hookup
- Targeted public-auth Playwright reruns on 2026-04-17 after the auth bootstrap timeout fix:
  - Chromium: `e2e/auth.spec.ts` and `e2e/public-navigation.spec.ts` green
  - Firefox: `e2e/auth.spec.ts` and `e2e/public-navigation.spec.ts` green
- Targeted CV-flow reruns on 2026-04-17 after the helper consolidation:
  - Chromium: `e2e/upload-to-analysis.spec.ts` green
  - Chromium: isolated `analysis-improve-export` PDF export green
  - the DOCX export scenario is now dependency-aware and skipped locally when `pandoc` is unavailable, instead of failing as a false product regression on Windows workstations without that binary
- As of 2026-04-17, the local combined `analysis-improve-export` Chromium run was hardened further:
  - `scripts/start-e2e-stack.mjs` now auto-restarts the proxy/PDF child processes on unexpected local exits, with a bounded restart budget
  - `e2e/helpers/ui.ts` retries `page.goto(...)` on transient `ERR_CONNECTION_REFUSED` so a momentary local restart does not immediately fail the next navigation
  - the combined Chromium rerun now completes as `2 passed, 1 skipped` on a machine without a local DOCX converter
- As of 2026-04-21, the previously recorded frontend typecheck breakage is no longer current:
  - `npm run typecheck` passes locally again
  - the current whole-app risk picture is therefore better described as hotspot concentration and runtime coupling than as an active baseline validation failure
- As of 2026-04-21, a fresh `validate-core` client-test failure was traced to stale ASCII expectations rather than a product regression:
  - `client/src/components/SettingsPage/LLMTab.test.tsx` still asserted `Reinitialiser`, `Tester le modele`, and `La valeur par defaut est`
  - the live UI now intentionally renders accented UTF-8 labels (`Réinitialiser`, `Tester le modèle`, `La valeur par défaut est`)
  - the durable rule for French UI regression tests is to match the real accented source text instead of ASCII approximations when the rendered copy is user-visible
- The remaining instability on the combined local `analysis-improve-export` Chromium run is currently classified as local stack instability:
  - one rerun still hit `ERR_CONNECTION_REFUSED` in mid-spec after earlier steps had already passed
  - isolated reruns of the new coverage behave correctly, so this is not currently treated as a regression in the new helper or export assertions
- Remaining CI warnings are now mostly non-blocking dependency/platform notices unless a fresh GitHub run proves otherwise

## Related

- [[topics/Auth and Access Model]]
- [[topics/Batch Jobs and Long-Running Workflows]]
- [[topics/Admin and Operations]]
- [[topics/Application Cache Model]]
- [[topics/Product Scope and Priorities]]

## Sources

- [[raw/sources/2026-04-16-backend-audit-and-quality]]
- [[raw/sources/2026-04-16-codebase-structure]]
- [[raw/sources/2026-04-16-installation-and-bootstrap-docs]]
- [[raw/sources/2026-04-16-cache-architecture]]
