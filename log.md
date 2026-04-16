# Log

## [2026-04-16] bootstrap | ResumeConverter external memory vault

- Added a vault schema in `AGENTS.md`.
- Added `index.md`, `overview.md`, and typed topic/entity pages.
- Recorded current durable knowledge from recent ResumeConverter codebase work:
  - Docker env source of truth
  - Turnstile Docker build behavior
  - upfront AI credit reservation
  - insufficient-credit UX
  - 15-minute IA timeout standardization
- Added a repo-level `AGENTS.md` pointing future ResumeConverter sessions to this vault.

## [2026-04-16] ingest | codebase structure and product priorities

- Added architecture memory from the current codebase entry points.
- Added product surface memory from frontend routes and backend route registry.
- Added product scope memory from `docs/PRODUCT_SCOPE_PRIORITIES.md`.

## [2026-04-16] ingest | functional workflows and operational surfaces

- Added pages for core resume workflows and batch processing.
- Added pages for auth/access model and admin/operations surfaces.
- Added pages for integrations and observability/quality posture.
- Captured durable facts from routes, services, and docs covering backup, sharing, billing, metrics, settings, chatbot, and backend audit findings.

## [2026-04-16] ingest | domain model, control plane, and secondary modules

- Added a domain-model page centered on tenant-scoped business objects and their relationships.
- Added dedicated pages for:
  - clients/deals/missions/pipeline
  - LLM control plane
  - resume presentation and templates
  - market intelligence and reference data
  - security and compliance
- Added a source note capturing route/service evidence for these modules.
- Updated overview, index, and entity navigation so the vault can serve as a more exhaustive project memory rather than a thin bootstrap.

## [2026-04-16] ingest | install, bootstrap, and recovery docs

- Ingested `README.md`, `INSTALL.md`, and `INSTALL_PG.md` as source material.
- Captured durable setup truths around OCR prerequisites, explicit migrations, Docker bootstrap, local multi-process startup, cache behavior, E2E reference flows, and backup/PRA.
- Propagated the stable facts into architecture, Docker, integrations, observability, and overview pages instead of copying setup docs verbatim.

## [2026-04-16] ingest | Cloudflare and Turnstile configuration

- Added a dedicated source note for Cloudflare Turnstile configuration.
- Enriched the Turnstile topic with:
  - key mapping
  - Cloudflare domain allowlist expectations
  - backend verification endpoint
  - no-webhook clarification
  - common failure patterns
- Linked Turnstile behavior back into Docker and security/compliance pages.

## [2026-04-16] add | consolidated vault security reference

- Added `SECURITY.md` at vault root as a durable security reference.
- Consolidated the security model around:
  - authentication and roles
  - firm isolation
  - Turnstile and registration protection
  - 2FA
  - public token flows
  - provider mediation
  - billing and AI credit integrity
  - observability and compliance
- Linked the document from the vault index and overview for easier future reuse.

## [2026-04-16] ingest | deeper admin, backup, metrics, and batch-credit docs

- Identified under-documented operational areas after the first vault pass:
  - settings/admin governance split
  - backup and disaster recovery behavior
  - metrics and diagnostics surface
  - batch-job reservation details
- Added dedicated topic pages for governance surfaces, backup/recovery, and metrics/diagnostics.
- Enriched existing AI credits, batch jobs, admin/operations, overview, entity, and index pages with these operational details.

## [2026-04-16] ingest | Stripe billing model

- Added a dedicated source note for Stripe billing and firm credit purchase behavior.
- Added a topic page covering:
  - access model
  - checkout-session creation
  - pending purchase persistence
  - webhook-only credit fulfillment
  - purchase states
  - credit-ledger linkage
- Linked Stripe behavior into integrations, admin/operations, security, index, and overview pages.

## [2026-04-16] ingest | LLM runtime call-resolution model

- Added a dedicated source note for how LLM calls are resolved according to configuration.
- Added a topic page covering:
  - canonical settings lookup
  - provider/model defaults
  - model normalization
  - runtime availability and fallback
  - effective parameter merging
  - gateway dispatch
  - response normalization
  - provider-auth error sanitization
- Linked this runtime-resolution note into the LLM control-plane and settings governance pages.

## [2026-04-16] ingest | application cache architecture

- Added a dedicated source note for the application cache model.
- Added a topic page explaining:
  - cache namespaces
  - scope-versioned keys
  - PostgreSQL-backed version truth
  - LISTEN/NOTIFY invalidation propagation
  - memory vs Redis backend roles
  - pending-load coalescing
  - `refresh=1` cache bypass
- Linked the note into metrics, Docker, observability, index, and overview pages.

## [2026-04-16] enrich | detailed security layers

- Added a dedicated source note for the concrete security layers implemented in the app.
- Expanded the vault security reference with a defense-in-depth breakdown covering:
  - CSP/browser policy
  - CORS and cookie/session layer
  - CSRF
  - registration anti-abuse protections
  - authentication
  - authorization and tenant isolation
  - rate limiting
  - validation and business-integrity controls
- Linked the new source into security and Turnstile documentation.

## [2026-04-16] enrich | concrete CSRF and registration defense details

- Expanded the vault security docs with the current operational behavior of:
  - CSRF token issuance and exemptions
  - `accessToken` cookie authentication
  - token-expiry signaling headers
  - registration honeypot and `formRenderedAt` timing checks
  - suspicious-user-agent and disposable-email filtering
  - concrete rate-limit layers, including registration and LLM limits
- Tightened the raw source note so future sessions can distinguish the high-level security model from the exact middleware behavior.

## [2026-04-16] add | env matrix, session lifecycle, and batch state machine

- Added a dedicated source note for environment/secrets behavior, auth cookie/token lifecycle, and batch job state semantics.
- Added topic pages for:
  - environment and secret matrix
  - session and token lifecycle
  - batch job state machine
- Linked these notes into the existing Docker, auth/access, batch workflow, overview, and index navigation so they become first-class memory, not isolated notes.

## [2026-04-16] add | public token flows, PDF boundary, and header budget

- Added dedicated notes for:
  - public tokenized consent/share flows
  - the internal PDF/document-generation boundary
  - the architectural rule to keep request headers comfortably under 4 KB
- Added a supporting raw source note grounded in the share routes, consent routes, proxy-to-PDF auth, and PDF-server request guards.
- Linked these notes into resume presentation, integrations, security, overview, and index navigation.

## [2026-04-16] add | upload pipeline, limits matrix, and account email flows

- Added dedicated notes for:
  - upload/OCR/parsing pipeline
  - operational limits matrix
  - email verification and password reset flows
- Added a supporting raw source note grounded in resume upload handlers, OCR services, document-limit docs, and account email services.
- Linked these notes into core resume workflows, metrics, integrations, overview, and index navigation.

## [2026-04-16] add | settings catalog, maintenance jobs, and persistence map

- Added dedicated notes for:
  - settings catalog and runtime effects
  - maintenance and cleanup jobs
  - data persistence map
- Added a supporting raw source note grounded in `settings.service.js`, `scheduler.service.js`, `fileCleanup.js`, and `docker/schema.sql`.
- Linked these notes into settings/governance, admin/operations, business-object, overview, and index navigation.

## [2026-04-16] add | provider failure model, incident runbooks, and authorization map

- Added dedicated notes for:
  - provider failure and fallback behavior
  - compact incident runbooks
  - role and authorization decision map
- Added a supporting raw source note grounded in LLM gateway/provider services, auth middleware/helpers, route guards, security config, and operational routes.
- Linked these notes into LLM control-plane, security, overview, and index navigation.

## [2026-04-16] add | settings field reference, scoring model, and API domain map

- Added dedicated notes for:
  - high-signal settings fields
  - matching and scoring layers
  - backend API surface grouped by domain
- Added a supporting raw source note grounded in settings form/types, settings routes/services, local ranking, mission operations, and the API route registry.
- Linked these notes into overview and index navigation.

## [2026-04-16] add | storage map, dashboards map, and resume object model

- Added dedicated notes for:
  - file storage and retention behavior
  - operational dashboards and diagnostics entry points
  - the layered resume domain model
- Added a supporting raw source note grounded in upload/share cleanup code, health/metrics/admin surfaces, schema comments, and resume CRUD/improvement flows.
- Linked these notes into overview and index navigation.
