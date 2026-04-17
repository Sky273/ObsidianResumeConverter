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
- The remaining CI warnings at this point are non-blocking:
  - GitHub Actions deprecation warnings around Node 20-based action runtimes
  - Node `DEP0040` warnings around `punycode` from transitive dependencies during validation runs
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
