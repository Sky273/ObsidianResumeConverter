# Log

## [2026-04-20] fix | preserve extracted template HTML and inline logos through review and fallback paths

- Reworked the template-extraction review/edit flow around three user-visible defects.
- Frontend editor:
  - replaced the Tiptap-based header/body/footer editors in `client/src/pages/NewTemplatePage.tsx` with plain HTML `textarea` fields
  - reason: Tiptap was reparsing extracted template fragments and overwriting layout-oriented markup/classes
- Backend fallback path:
  - updated `server/services/templateExtraction.service.js` and `server/services/templateExtractionFallback.service.js` so deterministic layout fallback now receives extracted images
  - fallback templates now replace `-logo-` with extracted base64 image markup instead of leaving the placeholder behind
- Frontend preview/runtime:
  - updated `client/src/utils/sanitizer.frontend.ts` to allow `data:image/...;base64,...` sources so extracted inline logos remain visible in preview frames
- View refresh:
  - updated `client/src/components/ExtractTemplateModal.tsx` to mark the templates view dirty after a successful extraction and again when handing off to `/admin/templates/new?fromExtraction=true`
  - this ensures the templates dashboard refreshes when users return from the extraction workflow
- Revalidated with:
  - `node .\node_modules\vitest\vitest.mjs run --config client/vitest.config.ts client/src/pages/NewTemplatePage.test.tsx client/src/components/ExtractTemplateModal.test.tsx client/src/utils/sanitizer.frontend.test.ts`
  - `node .\node_modules\vitest\vitest.mjs run server/tests/services/templateExtraction.service.test.js --config server/vitest.config.js`

## [2026-04-20] fix | support pdf-parse v2 class export in CV template extraction

- Investigated template-extraction warnings showing:
  - `pdf-parse extraction failed, falling back to pdfjs-dist`
  - `pdf-parse module does not expose a callable parser`
- Confirmed the cause in `server/routes/templates/extraction/pdfExtractionHelpers.js`:
  - the repository now installs `pdf-parse@2.4.5`
  - this version exposes `PDFParse` as a class-based API instead of the older callable default export expected by the helper
- Fixed the compatibility layer so template extraction now supports:
  - callable default export
  - direct callable module export
  - `pdfParse` named export
  - `PDFParse` class export by instantiating the parser with `{ data: buffer }`, calling `getText()`, and destroying it
- Added regression coverage in `server/tests/routes/templates.extraction.pdfExtractionHelpers.test.js`.
- Revalidated with:
  - `node .\node_modules\vitest\vitest.mjs run server/tests/routes/templates.extraction.pdfExtractionHelpers.test.js --config server/vitest.config.js`
  - `node .\node_modules\vitest\vitest.mjs run server/tests/routes/templates.extraction.extractors.test.js --config server/vitest.config.js`

## [2026-04-18] feat | add firm credit detail screen by user and action

- Added a dedicated cabinet credit detail flow reachable from the administration cabinet-credit screen.
- Backend:
  - added `GET /api/firms/:id/credits/detail`
  - returns firm credit summary, breakdown by user, breakdown by action, user/action matrix, and recent transactions
  - local admins are restricted to their own firm; super admins can inspect any firm
- Frontend:
  - added `client/src/pages/FirmCreditsDetailPage.tsx`
  - added routing through `/admin/firm-credits/:id`
  - added detail entry buttons on `client/src/pages/FirmCreditsPage.tsx`
- Revalidated with:
  - `node .\node_modules\vitest\vitest.mjs run server\tests\routes\firms.routes.test.js --config server\vitest.config.js`
  - `node .\node_modules\vitest\vitest.mjs run server\tests\services\firms.service.test.js --config server\vitest.config.js`
  - `node .\node_modules\vitest\vitest.mjs run --config client\vitest.config.ts client\src\pages\FirmCreditsPage.test.tsx client\src\pages\FirmCreditsPage.refresh.test.tsx client\src\pages\FirmCreditsDetailPage.test.tsx`

## [2026-04-18] review | whole-app inspection refreshed with validation signal

- Re-read the vault entry points and re-inspected the current repository entry points, runtime layers, hotspot services, and validation posture.
- Refreshed `[[topics/Priority Review 2026-04-18]]` with current confirmed facts:
  - `380` test files across `server`, `client`, `pdf-server`, and `e2e`
  - `server/config/lifecycle/runtimeMaintenance.js` is now only a thin shim, while orchestration still converges through the lifecycle subtree
  - `npm run test:pdf` passes with `11` files and `359` tests
  - `npm run typecheck` currently fails in frontend test tooling rather than product runtime code
- Recorded the concrete current typecheck blockers:
  - `client/src/components/Metrics/OperationLLMCard.test.tsx` uses an incompatible `i18next` mock shape
  - frontend tests importing `jest-axe` are missing a declaration file

## [2026-04-18] refactor | split runtime maintenance startup and shutdown orchestration

- Reduced the maintenance hotspot under `server/config/lifecycle/` without changing the external lifecycle API.
- Split the previous single-file runtime maintenance logic into:
  - `server/config/lifecycle/runtimeMaintenance.startup.js`
  - `server/config/lifecycle/runtimeMaintenance.shutdown.js`
  - thin re-export shim `server/config/lifecycle/runtimeMaintenance.js`
- Updated `server/tests/config/lifecycle.test.js` to align with the current fail-fast startup contract when PostgreSQL initialization fails and to keep shutdown assertions focused on a normally started server.
- Revalidated with:
  - `node .\node_modules\vitest\vitest.mjs run server\tests\config\lifecycle.test.js --config server\vitest.config.js`
  - `node .\scripts\run-eslint.mjs server\config\lifecycle.js server\config\lifecycle\runtimeMaintenance.js server\config\lifecycle\runtimeMaintenance.startup.js server\config\lifecycle\runtimeMaintenance.shutdown.js server\tests\config\lifecycle.test.js`

## [2026-04-18] refactor | split startup runtime maintenance by concern

- Continued the lifecycle hotspot reduction inside `server/config/lifecycle/runtimeMaintenance.startup.js`.
- Extracted startup subdomains into:
  - `server/config/lifecycle/runtimeMaintenance.cacheBootstrap.js`
  - `server/config/lifecycle/runtimeMaintenance.database.js`
  - `server/config/lifecycle/runtimeMaintenance.alwaysOn.js`
- Kept the startup order and public behavior stable while separating:
  - startup cache cleanup/bootstrap
  - database-backed runtime services
  - always-on cleanup/monitor services
- Revalidated with:
  - `node .\node_modules\vitest\vitest.mjs run server\tests\config\lifecycle.test.js --config server\vitest.config.js`
  - `node .\scripts\run-eslint.mjs server\config\lifecycle\runtimeMaintenance.js server\config\lifecycle\runtimeMaintenance.startup.js server\config\lifecycle\runtimeMaintenance.shutdown.js server\config\lifecycle\runtimeMaintenance.cacheBootstrap.js server\config\lifecycle\runtimeMaintenance.database.js server\config\lifecycle\runtimeMaintenance.alwaysOn.js server\tests\config\lifecycle.test.js`

## [2026-04-18] refactor | group shutdown runtime maintenance steps by concern

- Continued the lifecycle hotspot reduction inside `server/config/lifecycle/runtimeMaintenance.shutdown.js`.
- Extracted the shutdown step list into grouped concerns via:
  - `server/config/lifecycle/runtimeMaintenance.shutdownGroups.js`
- Kept shutdown ordering unchanged while making the grouped sequence explicit across:
  - local state and cache teardown
  - application service teardown
  - database-backed runtime teardown
- Revalidated with:
  - `node .\node_modules\vitest\vitest.mjs run server\tests\config\lifecycle.test.js --config server\vitest.config.js`
  - `node .\scripts\run-eslint.mjs server\config\lifecycle\runtimeMaintenance.js server\config\lifecycle\runtimeMaintenance.startup.js server\config\lifecycle\runtimeMaintenance.shutdown.js server\config\lifecycle\runtimeMaintenance.shutdownGroups.js server\config\lifecycle\runtimeMaintenance.cacheBootstrap.js server\config\lifecycle\runtimeMaintenance.database.js server\config\lifecycle\runtimeMaintenance.alwaysOn.js server\tests\config\lifecycle.test.js`

## [2026-04-18] refactor | split batch export generator by document and support concerns

- Reduced the `server/services/batchJobsWorker/exportGenerator.js` hotspot without changing the public export workflow.
- Extracted document-specific behavior into:
  - `server/services/batchJobsWorker/exportGenerator.documents.js`
  - source loading for resumes/adaptations
  - template placeholder processing
  - PDF/DOCX generation retry logic
- Extracted shared export support behavior into:
  - `server/services/batchJobsWorker/exportGenerator.support.js`
  - workload and batch-size resolution
  - export item selection and status summaries
  - archive path and duplicate-name handling
  - temporary artifact workspace helpers
- Revalidated with:
  - `node .\node_modules\vitest\vitest.mjs run server\tests\services\batchJobsWorker.exportGenerator.test.js --config server\vitest.config.js`
  - `node .\scripts\run-eslint.mjs server\services\batchJobsWorker\exportGenerator.js server\services\batchJobsWorker\exportGenerator.documents.js server\services\batchJobsWorker\exportGenerator.support.js server\tests\services\batchJobsWorker.exportGenerator.test.js`

## [2026-04-18] refactor | split improvement processor by analysis and persistence concerns

- Reduced the `server/services/batchJobsWorker/processors/improvement.js` hotspot without changing the batch-improvement workflow.
- Extracted post-improvement analysis and fallback handling into:
  - `server/services/batchJobsWorker/processors/improvementAnalysis.js`
- Extracted improved-resume scoring and persistence into:
  - `server/services/batchJobsWorker/processors/improvementPersistence.js`
- Kept `improvement.js` focused on orchestration:
  - retry loop
  - job-item progress updates
  - final analysis/persistence sequencing
- Revalidated with:
  - `node .\node_modules\vitest\vitest.mjs run server\tests\services\batchJobsWorker.itemProcessors.test.js --config server\vitest.config.js`
  - `node .\scripts\run-eslint.mjs server\services\batchJobsWorker\processors\improvement.js server\services\batchJobsWorker\processors\improvementAnalysis.js server\services\batchJobsWorker\processors\improvementPersistence.js server\tests\services\batchJobsWorker.itemProcessors.test.js`

## [2026-04-18] refactor | split AI credit action flow from broader credit service concerns

- Reduced the `server/services/aiCredits.service.js` hotspot without changing its public surface.
- Extracted reservation/refund/action-execution orchestration into:
  - `server/services/aiCreditsActions.service.js`
- Kept `aiCredits.service.js` focused on:
  - configuration lookup
  - import/workflow planning helpers
  - firm credit listing/reporting
  - public function composition
- Revalidated with:
  - `node .\node_modules\vitest\vitest.mjs run server\tests\services\aiCredits.service.test.js --config server\vitest.config.js`
  - `node .\scripts\run-eslint.mjs server\services\aiCredits.service.js server\services\aiCreditsActions.service.js server\services\aiCreditsLedger.service.js server\tests\services\aiCredits.service.test.js`

## [2026-04-18] refactor | split resume service consent and invalidation concerns

- Reduced the `server/services/resumes.service.js` hotspot without changing its public exports.
- Extracted cache/view invalidation helpers into:
  - `server/services/resumesInvalidation.service.js`
- Extracted consent-related mutations and retention/expiration helpers into:
  - `server/services/resumesConsent.service.js`
- Kept `resumes.service.js` focused on:
  - CRUD queries
  - list/count helpers
  - compatibility exports
  - adaptation creation and timeout-based record lookups
- Revalidated with:
  - `node .\node_modules\vitest\vitest.mjs run server\tests\services\resumes.service.test.js --config server\vitest.config.js`
  - `node .\scripts\run-eslint.mjs server\services\resumes.service.js server\services\resumesInvalidation.service.js server\services\resumesConsent.service.js server\tests\services\resumes.service.test.js`

## [2026-04-18] test | add direct coverage for extracted AI credit and resume consent modules

- Added direct tests for the newly extracted credit-action module:
  - `server/tests/services/aiCreditsActions.service.test.js`
  - covers reservation, refund, and upfront-reservation action execution
- Added direct tests for the newly extracted resume-consent module:
  - `server/tests/services/resumesConsent.service.test.js`
  - covers consent initialization, consent error marking, pending-consent expiration, and reminder-side invalidation
- Revalidated with:
  - `node .\node_modules\vitest\vitest.mjs run server\tests\services\aiCreditsActions.service.test.js server\tests\services\resumesConsent.service.test.js --config server\vitest.config.js`
  - `node .\scripts\run-eslint.mjs server\services\aiCreditsActions.service.js server\services\resumesConsent.service.js server\tests\services\aiCreditsActions.service.test.js server\tests\services\resumesConsent.service.test.js`

## [2026-04-18] review | refreshed whole-application priority assessment

- Re-read the vault entry points and re-inspected the current repository entry points and route surface.
- Added [[topics/Priority Review 2026-04-18]] to record the refreshed priority stack:
  - backend runtime decomposition
  - long-running AI/document workflow hardening
  - secondary-scope discipline
  - control-plane contract tightening
  - targeted hotspot decomposition
- Recorded updated surface-size facts from the current repository:
  - `45` backend route modules
  - `154` frontend page files
  - `378` test files
- Captured that lifecycle decoupling has progressed into `server/config/lifecycle/runtimeMaintenance.js`, but runtime orchestration is still materially centralized.

## [2026-04-17] fix | preserve French UTF-8 fixtures in resume UI regression coverage

- Cleaned the remaining French accent corruption in targeted client regression fixtures tied to resume entry and improvement flows.
- Reaffirmed the repository rule to keep accented strings as UTF-8 without BOM in source and tests instead of ASCII fallbacks or mojibake.

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

## [2026-04-16] fix | malformed LLM JSON during CV analysis

- Recorded that resume-analysis failures with `Expected ',' or '}' after property value` came from malformed provider JSON where a comma was missing between properties.
- Updated the provider-failure topic to note that the local structured-output parser now repairs this defect before retrying or surfacing an error.
- Extended that durable note with the broader repair envelope now supported locally: comments, smart quotes, duplicated separators, and obvious root-level missing closers, while still leaving mid-string truncation to retry/repair logic.

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

## [2026-04-16] add | application-wide priority review

- Added [[topics/Priority Review 2026-04-16]] to capture the current top review priorities across backend operational safety, file/document trust boundaries, tooling drift, and maintainability hotspots.
- Linked the priority review into [[index]] so later sessions can start from the current risk stack instead of rebuilding it from scratch.

## [2026-04-16] update | priority remediation progress

- Updated [[topics/Priority Review 2026-04-16]] after implementing stricter DOCX OOXML validation and more robust local validation script invocation.
- Recorded that the remaining `typecheck` failure now points at `node_modules/typescript/lib/lib.dom.d.ts`, so the open issue is dependency/runtime health rather than missing CLI resolution.

## [2026-04-16] add | template extraction pipeline memory

- Added [[topics/Template Extraction Pipeline]] to document the current hybrid extraction flow:
  - DOC/DOCX to PDF via LibreOffice
  - PDF to structured HTML/CSS layout
  - sanitization of fragments and stylesheet
  - header/content/footer splitting
  - vision and text fallbacks
- Updated [[topics/Resume Presentation and Templates]] and [[index]] to link the extraction pipeline as first-class project memory.

## [2026-04-16] update | template extraction confidence and review metadata

- Updated [[topics/Template Extraction Pipeline]] to reflect the extraction metadata now returned with templates:
  - `extractionConfidence`
  - `extractionReview`
- Clarified that extraction diagnostics are now surfaced in the frontend through confidence labels and intermediate fragments.
- Updated [[topics/Resume Presentation and Templates]] so the vault matches the current PDF-centered extraction path and review model.

## [2026-04-16] update | template extraction review UI and visual PDF blocks

- Extended [[topics/Template Extraction Pipeline]] with the new operator-facing review flow in the extraction modal:
  - manual correction of final header/body/footer/CSS before template creation
  - one-click re-application of detected fragments
- Recorded that PDF layout recovery now includes a lightweight operator-list pass to capture:
  - large filled rectangles
  - approximate image regions
- Updated [[topics/Resume Presentation and Templates]] so the presentation memory reflects both the review UI and the richer PDF layout analysis.

## [2026-04-16] update | docker helper scripts re-run explicit migration

- Updated the Docker helper flow so the standard build/run scripts explicitly invoke `docker-migrate` inside `resumeconverter-app` after container startup.
- Recorded this in [[topics/Docker Environment]] because Docker bootstrap behavior is a durable operational fact and the repo already distinguishes explicit migration runners from implicit web-process side effects.

## [2026-04-16] update | template extraction aligned with AI credit and gateway metadata

- Confirmed that template extraction is governed by the same AI credit framework as the other AI operations through action type `template.extract`.
- Updated [[topics/Template Extraction Pipeline]] to record that its cost and max-token budget are configurable through:
  - `aiCreditTemplateExtract`
  - `aiMaxTokensTemplateExtract`
- Recorded that the extraction service now sends explicit business `operationType` metadata into the shared LLM gateway so tracing and provider-side classification are aligned with the rest of the AI stack.

## [2026-04-16] audit | business AI operationType coverage

- Audited backend business AI call sites across:
  - `callLLM`
  - `callLLMWithVision`
  - `callBusinessChatCompletion`
- Confirmed that the business operations routed through `callBusinessChatCompletion` were already carrying explicit `operationType` metadata.
- Fixed the remaining direct `callLLM` business path in the chatbot route so it now sends:
  - `operationType: Chatbot Message`
  - `userMetadata.actionType: chatbot.message`

## [2026-04-16] doc | AI operation matrix

- Added [[topics/AI Operation Matrix]] as the operational reference that maps each user-facing AI surface to:
  - charged `actionType`
  - traced business `operationType`
  - configurable credit-cost setting
  - configurable max-token setting
- Recorded the deliberate one-to-many mappings where a single billed action spans several traced LLM sub-operations, notably:
  - `template.extract`
  - `profile.search`
  - `resume.improvement`

## [2026-04-16] doc | AI governance pages linked to operation matrix

- Extended [[topics/AI Credits]] with the governance rule that each AI feature should define:
  - `actionType`
  - `operationType`
  - configurable cost
  - configurable max-token budget
- Extended [[topics/LLM Control Plane]] to make the distinction explicit between:
  - `actionType` as the charging unit
  - `operationType` as the tracing label
- Linked both pages back to [[topics/AI Operation Matrix]] so the operational mapping is reachable from the main governance topics.

## [2026-04-16] update | advanced OCR enabled by default

- Changed the OCR runtime default so `OCR_ADVANCED_BACKEND` now resolves to `paddleocr` when the environment does not override it.
- Updated [[topics/Upload OCR and Parsing Pipeline]] to record that advanced OCR is now opt-out rather than opt-in.
- Recorded the fallback order explicitly:
  - advanced OCR when available
  - CLI OCR when available
  - `tesseract.js` as the last fallback

## [2026-04-16] fix | template extraction no longer crashes on HTML responses

- Hardened the frontend extraction client so it no longer assumes `POST /api/templates/extract-from-cv` always returns JSON.
- Recorded in [[topics/Template Extraction Pipeline]] that:
  - the client now requests `Accept: application/json`
  - HTML error pages are converted into readable extraction errors
  - invalid non-JSON success payloads are rejected explicitly instead of surfacing `Unexpected token <`
- Normalized upload-layer errors on the extraction route so file upload failures stay in the JSON API contract.

## [2026-04-16] fix | Docker APT bootstrap survives blocked HTTP mirrors and missing initial CA roots

- Diagnosed the Docker build failure on the first APT layer as an environment issue rather than missing package names:
  - HTTP access to Ubuntu/PGDG mirrors can be blocked
  - the base `ubuntu:22.04` image may not have usable CA certificates for the first HTTPS fetch
- Updated `Dockerfile` to:
  - rewrite Ubuntu and PGDG repositories to HTTPS
  - add APT retries/timeouts
  - temporarily disable HTTPS peer/host verification only for the bootstrap step until `ca-certificates` is installed
  - remove that temporary override before the remaining package installation proceeds
- Validated the fix with a full `docker build` of the app image.

## [2026-04-16] update | Docker app image no longer embeds PostgreSQL or Redis server

- Reduced Docker coupling by removing PostgreSQL server and Redis server from the application image.
- Updated the standard Compose topology so Docker now runs:
  - `resumeconverter-app`
  - `resumeconverter-postgres`
  - `resumeconverter-redis`
- Kept `postgresql-client-18` inside the app image because Docker bootstrap and backup tooling still require:
  - `pg_isready`
  - `psql`
  - `pg_dump`
- Reworked the app entrypoint so it now waits for external PostgreSQL, runs `docker-migrate`, verifies bootstrap state, then starts the proxy and PDF services under Supervisor.
- Updated Docker helper scripts to start the Compose stack instead of running the all-in-one application container directly.
- Added a compatibility bootstrap step that resynchronizes the `resumeconverter` PostgreSQL role password from `/.env.docker` when reusing volumes created by the previous embedded-PostgreSQL layout.
- Validated the new topology with:
  - full `docker build`
  - `docker compose up -d`
  - successful `/health` response on `https://localhost:3443/health`

## [2026-04-16] update | Docker multi-stage build for smaller final app image

- Reworked `Dockerfile` into a multi-stage build:
  - builder stage: `npm ci --legacy-peer-deps`, frontend build, `npm prune --omit=dev --legacy-peer-deps`
  - runtime stage: heavy system runtime dependencies plus the pruned `node_modules` and built `client/dist`
- Preserved the current runtime behavior while removing the full JavaScript build toolchain from the final application image.
- Validated with:
  - full `docker build`
  - PowerShell operator path `docker/docker-build.ps1 -Run`
  - successful `/health` response on `https://localhost:3443/health`
- Observed image size reduction for `resumeconverter:latest` from about `1.78 GB` to about `1.46 GB`.

## [2026-04-16] fix | PostgreSQL startup sequencing no longer forces avoidable restart/auth loops

- Identified that the local Docker startup path was making PostgreSQL feel slow and brittle for two concrete reasons:
  - helper scripts forced a full `docker compose down` before every start, so PostgreSQL was restarted even when already healthy
  - the app could start before the compatibility password sync had repaired the `resumeconverter` role on reused data volumes
- Updated the startup flow so helper scripts now:
  - start `postgres` and `redis` first
  - wait for PostgreSQL health
  - resynchronize the `resumeconverter` role password inside `resumeconverter-postgres`
  - only then start `resumeconverter-app`
- Added retry logic in the app entrypoint around `docker-migrate` so transient PostgreSQL auth races no longer cause an immediate crash-loop.
- Revalidated with the PowerShell operator path and healthy `/health` response after the sequencing change.

## [2026-04-16] fix | removed duplicate post-start docker-migrate invocation

- Identified a second Docker migration issue after startup: the operator scripts were still executing `docker-migrate` inside the already-starting app container even though the app entrypoint had already become responsible for schema bootstrap.
- This created an unnecessary race between:
  - `docker-migrate` inside the app entrypoint
  - a second `docker exec ... node server/scripts/docker-migrate.js` launched by the host-side scripts
- Updated the Windows and shell helper scripts so they now:
  - synchronize the PostgreSQL role password
  - start the app container
  - wait for the app container health check
  - do not run a second migration command
- Kept the retry logic inside the app entrypoint as the sole Docker bootstrap authority for schema convergence.

## [2026-04-16] fix | Docker startup now clears the previous app container before PostgreSQL password sync

- Investigated a remaining Docker startup failure where `resumeconverter-app` stayed in health state `starting` while logs showed repeated `docker-migrate` retries ending on `password authentication failed for user "resumeconverter"`.
- Root cause: after the stack refactor, helper scripts no longer did a full `docker compose down`, but the existing `resumeconverter-app` container still used `restart: unless-stopped`. That meant the previous app container could auto-restart and race the PostgreSQL role-password repair on reused volumes.
- Updated the Windows batch, PowerShell, and shell helper scripts so they now:
  - stop and remove the existing `app` container first
  - start `postgres` and `redis`
  - wait for PostgreSQL health and resynchronize the `resumeconverter` role password
  - create/start a fresh `app` container only after the password repair
- Revalidated with `docker/docker-build.ps1 -Run`: `resumeconverter-postgres` and `resumeconverter-app` reached `healthy`, and `https://localhost:3443/health` responded again.

## [2026-04-16] fix | Windows Docker password repair no longer depends on fragile batch interpolation

- Investigated a second startup failure mode where the operator output showed:
  - PostgreSQL role password sync reported success
  - `resumeconverter-app` still remained stuck in health state `starting`
  - container logs still showed repeated `password authentication failed for user "resumeconverter"` during `docker-migrate`
- The durable risk was Windows batch interpolation around `POSTGRES_PASSWORD` values containing `!`. Even when `.env.docker` and the app container both held the right secret, the old batch-driven `ALTER ROLE ... PASSWORD '!POSTGRES_PASSWORD!'` path was too fragile to trust.
- Added `docker/sync-postgres-role-password.ps1` and switched the Windows helper scripts to call it instead of embedding the SQL directly in batch.
- The helper now:
  - reads `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` from `/.env.docker`
  - applies `ALTER ROLE ... PASSWORD ...`
  - immediately verifies authenticated TCP login to `resumeconverter-postgres` with that same password before reporting success
- Revalidated with `docker/docker-build.ps1 -Run`: password sync succeeded, the app became `healthy`, and the backend started serving again on `https://localhost:3443`.

## [2026-04-16] update | template extraction now forcibly normalizes candidate text into placeholders

- Tightened `server/services/templateExtraction.service.js` so template extraction no longer relies only on the LLM prompt to remove candidate-specific content.
- The post-processing step now normalizes the extracted body HTML into the reusable placeholder contract:
  - first visible identity block -> `-name-`
  - next visible role/title block -> `-title-`
  - remaining visible CV text -> removed, with `-content-` preserved or injected as the single body placeholder
- This specifically addresses extractions where the model kept real candidate text such as the person name, job title, contact details, or section text inside the final template.
- Added a targeted regression test in `server/tests/services/templateExtraction.service.test.js` to verify that raw candidate content is stripped while template branding in the header can remain intact.

## [2026-04-16] fix | settings API now exposes canonical template extraction max tokens consistently

- Verified the full chain for template extraction governance:
  - frontend settings form exposes `aiCreditTemplateExtract` and `aiMaxTokensTemplateExtract`
  - settings save payload persists both fields
  - extraction runtime reads `template.extract` cost/maxTokens through `aiCredits.service`
- Found one API gap in `server/routes/settings.routes.helpers.js`: canonical settings overlay merged the credit-cost family but omitted the `aiMaxTokens*` family from `/api/settings`.
- Consequence: the extraction runtime could already use the correct canonical `aiMaxTokensTemplateExtract` budget while the admin settings page still displayed a stale/default max-token value.
- Fixed the canonical merge so all `aiMaxTokens*` fields, including `aiMaxTokensTemplateExtract`, are now returned consistently in the settings payload.
- Added regression coverage in `server/tests/routes/settings.routes.test.js` for:
  - canonical exposure of template extraction cost/max tokens
  - persistence of `aiCreditTemplateExtract` and `aiMaxTokensTemplateExtract` during settings update

## [2026-04-16] update | CV export now replaces `-logo-` with the firm logo

- Updated both export paths so resume/document generation now replaces the template placeholder `-logo-` with the exporting firm's logo:
  - HTTP batch export route
  - batch-job worker export generator
- Added a shared helper in `server/utils/exportTemplatePlaceholders.js` to:
  - replace `-name-`, `-title-`, and `-logo-`
  - convert stored firm logo binaries into data URLs for rendering
- The export flow now prefers `firms.logo_data` / `firms.logo_mime_type` over a plain logo URL so PDF/DOCX generation remains self-contained and does not rely on a separate authenticated asset fetch during rendering.
- Logo lookup is only performed when the selected template actually contains `-logo-`, so existing exports without that placeholder keep the same query/workload profile.
- Added targeted regression coverage in:
  - `server/tests/routes/batchExport.routes.test.js`
  - `server/tests/services/batchJobsWorker.exportGenerator.test.js`

## [2026-04-16] fix | single CV export/share flows now replace `-logo-` too

- Found that the previous `-logo-` fix only covered backend batch exports.
- Single resume export/share and adaptation export flows were still building HTML on the frontend with placeholder replacement limited to `-name-`, `-title-`, and `-content-`, which left literal `-logo-` markers in generated PDFs/DOCXs.
- Extended the frontend template placeholder layer so `-logo-` is now replaced there as well.
- The frontend now resolves the logo from the source CV's `firm_id`:
  - directly from the loaded resume/adaptation when available
  - or by resolving the linked resume before export if needed
- It then fetches `/api/firms/:id/logo/image`, converts the response into a `data:` URL, and injects an `<img>` tag before sending the export/share payload to the PDF/DOCX generator.
- This allows `-logo-` to work in `header`, `content`, and `footer` on single export/share flows, matching the behavior already present in batch exports.

## [2026-04-16] fix | template extraction no longer depends on puppeteer for PDF vision fallback

- Found that template extraction still imported `puppeteer` in `server/routes/templates/extraction/extractors.js` even though the intended pipeline is:
  - `DOC/DOCX -> LibreOffice -> PDF`
  - `PDF -> structured HTML/CSS`
  - optional vision fallback only if layout extraction is too sparse
- This made the extraction module unnecessarily depend on a browser runtime and increased the risk of environment-specific failures on PDFs where the normal layout path should have been enough.
- Replaced first-page PDF image rendering with a server-side renderer based on `pdfjs-dist` + `canvas`.
- Result:
  - no `puppeteer` dependency in the extraction path
  - no browser launch for the vision fallback
  - extraction backend remains aligned with the intended LibreOffice/PDF/HTML pipeline
- Revalidated targeted backend extraction tests after the change.

## [2026-04-16] fix | template extraction now degrades to deterministic layout fallback when LLM normalization fails

- Reproduced a real failing PDF extraction case (`CV - Mehdi HENNAD.pdf`) and measured the pipeline:
  - PDF text extraction and structured layout recovery completed quickly
  - the failure occurred later during the provider-backed HTML-to-template normalization step
- Observed runtime failure pattern on the real case:
  - initial provider transport failure (`socket hang up`)
  - then provider-side request rate limiting (`429`)
  - this caused the whole extraction chain to fall through to weaker fallbacks
- Hardened `server/services/templateExtraction.service.js` so that when HTML/layout normalization fails and `layoutAnalysis` is already available, the service now returns a deterministic layout-based template instead of throwing.
- This deterministic fallback:
  - preserves the recovered stylesheet
  - strips header/footer text while keeping structure
  - injects `-logo-` in the header when the layout detects a header image region
  - guarantees the body placeholder contract `-name-`, `-title-`, `-content-`
- Also fixed a separate extraction bug in `server/routes/templates/extraction/extractors.js`:
  - `extractPdfText()` could return the full OCR result object instead of a plain string when falling back away from `pdf-parse`
  - this later caused `fallbackText.trim is not a function` in the legacy text fallback path
- Revalidated targeted backend extraction tests after these changes.

## [2026-04-16] fix | extracted CV templates now default to the current user's firm instead of global scope

- Found that `client/src/pages/NewTemplatePage.tsx` forced `firmId: ''` when loading a template from `sessionStorage` after the CV extraction modal.
- Because an empty `firm_id` means "Global (tous les cabinets)" in the template creation flow, extracted templates were being saved globally even for firm-scoped users.
- Updated the extraction handoff so the created template now inherits the authenticated user's `firmId` / `firm_id`.
- Also delayed consumption of the extracted template payload until auth bootstrap completes, preventing a race where the page could clear `sessionStorage` before the current user's firm was available.
- Added a frontend regression test covering extraction-created templates being saved with the current user's firm id.

## [2026-04-16] fix | template extraction now inherits the standard 15-minute LLM timeout floor

- Found that CV template extraction still used `server/services/llm.service.js` (`callLLM` / `callLLMWithVision`) instead of the business-call helper that already enforced the platform-wide timeout minimum.
- The extraction service passed a local HTML normalization timeout of `120000ms`, which meant the effective provider timeout could still be shorter than the standard 15-minute baseline used by other AI business flows.
- Updated `server/services/llm.service.js` so legacy facade calls now clamp explicit timeouts to at least `LLM_OPERATION_TIMEOUT_MS`.
- Result:
  - CV template extraction keeps its local timeout hint for diagnostics and deterministic fallback decisions
  - but the real provider call now benefits from the same 15-minute minimum as the rest of the LLM stack
- Revalidated targeted backend tests for the LLM facade and template extraction service.

## [2026-04-16] analysis | refreshed priority review with delivery, secrets, and documentation risks

- Re-ran a whole-application review using the external vault plus direct inspection of the current repository structure, runtime entry points, CI workflow, Docker packaging, and validation scripts.
- Confirmed that the application surface remains broad but substantially covered by tests:
  - `214` backend test files
  - `129` client test files
  - `16` Playwright specs
- Recorded a new high-priority delivery concern:
  - local validation is not currently trustworthy in the inspected Windows workspace because `npm run typecheck` fails inside `node_modules/typescript/lib/lib.dom.d.ts`
  - and `npm run lint` fails because the local ESLint install is incomplete/corrupted
- Recorded a new high-priority runtime/security concern:
  - `.env.docker` is tracked and contains real secret-bearing values
  - `Dockerfile` still bakes fallback database/auth secrets into the runtime image
- Recorded a new medium-priority maintainability concern:
  - Node version skew is now explicit across Docker (`20`), CI (`22`), and the inspected local workspace (`24.13.0`)
  - README/install/auth-related files still show stale metadata and mojibake
  - seeded SQL in `server/scripts/docker-migrate.js` also contains mojibake, so encoding drift is not docs-only
- Updated [[topics/Priority Review 2026-04-16]] to preserve these findings as the current review baseline.

## [2026-04-16] change | standardized local validation on Node 22 and added preflight diagnostics

- Added explicit Node runtime policy to the repository:
  - `package.json` now declares `engines.node >=22 <23`
  - `.nvmrc` pins Node `22`
  - Docker builder now uses NodeSource `22.x` to reduce version skew with CI
- Replaced direct `eslint` and `tsc` script calls with wrapper scripts that:
  - verify Node major version before execution
  - verify required project-local tool files exist
  - emit actionable diagnostics instead of failing opaquely on corrupted local installs
- Extended the client Vitest wrapper with the same preflight plus a `happy-dom` dependency check, because the inspected workspace had an incomplete local install.
- Added `.env.docker` to `.gitignore` so future changes to that environment file are not tracked by default.
- Reduced duplication in `client/src/pages/UsersManagement.hooks.ts` by extracting shared optimistic-list helpers into `UsersManagement.hookUtils.ts`.

## [2026-04-16] analysis | traced CV upload UTF-8 0x00 failures to unsanitized text persistence boundaries

- Investigated a production upload/analyze failure surfaced in the frontend as `invalid byte sequence for encoding "UTF8": 0x00`.
- Confirmed that the batch import flow cleans extracted text but does not explicitly strip NUL characters before persistence.
- Confirmed that `server/services/batchJobsWorker/itemProcessors.js` writes extracted text and `JSON.stringify(analysis)` directly into PostgreSQL through `updateResume(...)`.
- Confirmed that `server/services/resumes.service.js` and `server/services/batchJobs/itemCrud.js` pass those string values straight to `pg` without a final sanitizer layer.
- Confirmed that the repository already contains `server/utils/sanitizer.backend.js`, which strips NUL characters, but that utility is not used on the resume import/analyze persistence path.
- Recorded the practical failure mode in [[topics/Upload OCR and Parsing Pipeline]] so future sessions can recognize the likely cause quickly.

## [2026-04-16] fix | stripped NUL characters at resume and batch-item persistence boundaries

- Added shared helpers in `server/utils/sanitizer.backend.js` to strip NUL characters from plain strings and nested payloads.
- Wired `server/services/resumes.service.js` to sanitize string values before `INSERT` and dynamic `UPDATE` queries against `resumes`.
- Wired `server/services/batchJobs/itemCrud.js` to sanitize direct string updates and pending JSON payloads before writing `batch_job_items`.
- This specifically hardens the CV upload/analyze flow against PostgreSQL `invalid byte sequence for encoding "UTF8": 0x00` failures caused by extracted text, OCR artifacts, or provider-returned strings.
- Revalidated targeted service tests for `resumes.service` and `batchJobs.itemCrud`.

## [2026-04-16] fix | hardened resume-analysis structured JSON recovery and locked request max-token precedence

- Updated `server/services/openai/resumeOperations.js` so resume analysis now uses deterministic structured-output settings (`temperature: 0`) without introducing a new hardcoded output-token default.
- Added a three-step malformed-response recovery path for resume analysis:
  - initial structured JSON request
  - compact-JSON retry
  - JSON repair pass that asks the provider to repair malformed JSON into valid compact JSON
- Updated `server/services/openai/textUtils.js` so local JSON parsing also strips BOM/NUL characters and repairs trailing commas in addition to existing control-character fixes.
- Added targeted tests proving that request-level `maxTokens` overrides remain the effective runtime value for resume analysis and keep precedence over persisted model parameters.
- Revalidated targeted tests for `openai.textUtils`, `openai.resumeOperations`, `llmProvider.service`, and `batchJobsWorker.itemProcessors`.

## [2026-04-16] add | local Codex Karpathy-guidelines skill

- Added [[topics/Codex Agent Tooling]] to record a local Codex-native adaptation of the upstream `forrestchang/andrej-karpathy-skills` guidance.
- Recorded the installed skill path `C:\Users\mail\.codex\skills\karpathy-guidelines` and the validation step performed with the Codex skill validator.
- Added [[raw/sources/2026-04-16-karpathy-codex-skill-install]] as the source note for the upstream repository and local installed files.

## [2026-04-16] add | application release note v1.9.1

- Added [[topics/Application Release History]] to record the current app version and the scope of release `v1.9.1`.
- Added [[raw/sources/2026-04-16-release-v1.9.1]] for the source-of-truth files touched during the release bump.
- Recorded that `v1.9.1` is a frontend-focused maintenance release centered on:
  - CVthèque list/by-deal presentation alignment
  - Missions list/by-deal presentation alignment
  - CVthèque tooltip overlay hardening
## 2026-04-16

- Refreshed `[[topics/Priority Review 2026-04-16]]` after whole-app review from the current workspace.
- Recorded that local validation now fails fast because the inspected environment runs Node `25.9.0` while the repo enforces Node `22.x`.
- Corrected the priority note about `README.md`: version and stack badges are aligned again, but mojibake remains in user-facing documentation.
- Rechecked local validation after switching back to Node `22.22.2`; confirmed the next blocker is an inconsistent local dependency install (`typescript` lib file truncated and local `eslint` package metadata missing).
- Rechecked validation after `npm ci`; confirmed dependencies are healthy again, typecheck now exposes real app-level TypeScript errors, and lint is materially polluted by generated files under `client/dist-e2e/**` not covered by current ESLint ignore rules.
- Fixed the current validation blockers in the workspace: TypeScript errors in `ErrorBoundary`, `UsersManagement.hooks`, and `authService`, plus multiple ESLint hard errors and lint-scope pollution from `client/dist-e2e/**`.
- Verified the current baseline on Node `22.22.2`: `npm run typecheck` passes and `npm run lint` passes with warnings only (`26` warnings, `0` errors).
- Cleared the remaining warning debt in the inspected workspace: React hook dependency warnings, `any`-typed test fixtures, Fast Refresh export warnings, and unused-variable warnings were removed or resolved structurally.
- Verified the current local baseline on Node `22.22.2`: `npm run typecheck` passes and `npm run lint` passes with `0` errors and `0` warnings.
- Ran behavioral validation on Node `22.22.2`: `npm run test:pdf` is green, while backend and client suites still fail in concentrated clusters (LLM/provider mocks and AI route flows on the backend; improved-resume and extraction/batch-export UI flows on the client).
- Completed full behavioral validation on Node `22.22.2`: `npm test` passes (`3354` tests / `214` files), `npm run test:client` passes (`526` tests / `129` files), and `npm run test:pdf` remains green (`359` tests / `11` files).
- Most test fixes were contract/test-fixture alignment rather than runtime product changes: updated LLM/provider mocks for current exports and payload normalization, refreshed stricter DOCX fixture structure, aligned JWT expectations with minimal token payloads, and updated client tests for fresh resume loading plus batch-export timeout plumbing.
- Suppressed the residual non-blocking `happy-dom` iframe/abort noise in client test setup; `npm run validate:core` now passes end-to-end on Node `22.22.2`.
- Remaining console noise during core validation is limited to non-blocking Node `DEP0040` deprecation warnings for `punycode`.
## 2026-04-17

- Continued implementation work on the 2026-04-17 priority stack:
  - tightened `server/utils/mappers.js` so `mapSettingsToFrontend(...)` preserves explicit `0`, `off`, and empty-string values instead of replacing them with defaults through broad `||` fallbacks
- Revalidated the backend settings-mapper correction with targeted checks:
  - `server/tests/utils/mappers.test.js`
  - ESLint on `server/utils/mappers.js` and the mapper test
  - result: green

- Continued implementation work on the 2026-04-17 priority stack:
  - centralized backend user-response shaping in `server/utils/mappers.js`
  - aligned `auth/signin`, `auth/google`, `users`, and `auth/users` routes on the shared mapper
  - kept legacy aliases on session/auth responses for compatibility while keeping admin/user-management responses canonical
- Revalidated the auth/user route contract work with targeted checks:
  - `server/tests/routes/auth.signin.routes.test.js`
  - `server/tests/routes/users.routes.test.js`
  - ESLint on the touched auth/user route and mapper files
  - result: green

- Continued implementation work on the 2026-04-17 priority stack:
  - extracted cache invalidation key-set helpers out of `server/services/cache.service.js` into `server/services/cacheInvalidation.service.js`
  - kept grouped-view and GDPR invalidation behavior unchanged while reducing `cache.service.js` to namespace/runtime concerns
- Revalidated the cache invalidation decomposition with targeted checks:
  - `server/tests/services/cache.service.test.js`
  - `server/tests/services/cacheInvalidation.service.test.js`
  - ESLint on the touched cache files
  - result: green

- Continued implementation work on the 2026-04-17 priority stack:
  - extracted Redis connection state bookkeeping out of `server/services/cache.service.js` into `server/services/cacheRedisState.service.js`
  - tightened frontend API normalization for settings and user data so explicit values such as `0`, `off`, and legacy firm aliases are preserved/canonicalized instead of being overwritten by broad fallbacks
- Revalidated the cache/settings contract work with targeted checks:
  - `server/tests/services/cache.service.test.js`
  - `client/src/pages/SettingsPage.hooks.test.ts`
  - `client/src/components/UsersManagement/UserFormModal.test.tsx`
  - `client/src/pages/UsersManagement.hooks.refresh.test.ts`
  - ESLint on the touched backend/frontend files
  - result: green

- Continued implementation work on the 2026-04-17 priority stack:
  - extracted the PDF/DOCX renderer retry path out of `server/services/batchJobsWorker/exportGenerator.js` into a dedicated helper with explicit dependencies
  - kept retry count, timeout behavior, logging, and error semantics unchanged while reducing closure coupling inside `generateJobExport(...)`
- Revalidated the export-renderer decomposition with targeted checks:
  - `server/tests/services/batchJobsWorker.exportGenerator.test.js`
  - ESLint on the touched export-generator files
  - result: green

- Continued implementation work on the 2026-04-17 priority stack:
  - decomposed `server/services/batchJobsWorker/exportGenerator.js` by extracting export-item preparation concerns ahead of document rendering
  - isolated source loading for resume vs adaptation items, firm-logo resolution, and template section expansion while keeping the PDF/DOCX retry path unchanged
- Revalidated the export-generator decomposition with targeted checks:
  - `server/tests/services/batchJobsWorker.exportGenerator.test.js`
  - ESLint on the touched export-generator files
  - result: green

- Continued implementation work on the 2026-04-17 priority stack:
  - normalized legacy auth/user firm aliases into canonical `firmId` / `firmName` during frontend sign-in, session restore, token refresh, and cached-user writes in `client/src/services/authService.ts`
  - updated core auth consumers to stop depending directly on `firm_id` fallback reads in `AdminFirmSelector`, `UserFormModal`, and `UsersManagement.hooks.ts`
- Revalidated the auth-contract tightening with targeted checks:
  - `client/src/services/authService.test.ts`
  - `client/src/context/AuthContext.test.tsx`
  - ESLint on the touched frontend auth/consumer files
  - result: green

- Continued implementation work on the 2026-04-17 priority stack:
  - extracted firm-credit ledger primitives from `server/services/aiCredits.service.js` into `server/services/aiCreditsLedger.service.js`
  - kept reservation, refund, and workflow credit policy in `aiCredits.service.js` while isolating low-level row locking, firm balance updates, transaction insertion, and cache invalidation
- Revalidated the AI credits hotspot decomposition with targeted checks:
  - `server/tests/services/aiCredits.service.test.js`
  - ESLint on `server/services/aiCredits.service.js`, `server/services/aiCreditsLedger.service.js`, and the service test
  - result: green

- Continued implementation work on the 2026-04-17 priority stack:
  - added a page-budget decision for forced full-document OCR in `server/services/pdfTextExtraction.service.js`
  - surfaced forced full-document OCR attempt/skip metadata through the PDF upload handler metrics/log path
  - bounded template-extraction prompt construction in `server/services/templateExtraction.service.js`, including omission of oversized raw HTML when structured layout fragments are available
  - added per-item LLM deadline propagation in `server/services/batchJobsWorker/llmIntegration.js` and deadline-aware retry stopping in `server/services/openai/resumeOperations.js`
- Revalidated the OCR/template/deadline hardening with targeted checks:
  - `server/tests/services/pdfTextExtraction.service.test.js`
  - `server/tests/services/templateExtraction.service.test.js`
  - `server/tests/services/openai.resumeOperations.test.js`
  - `server/tests/services/batchJobsWorker.llmIntegration.test.js`
  - `server/tests/routes/resumes.upload.routes.test.js`
  - ESLint on the touched files

- Continued implementation work on the 2026-04-17 priority stack:
  - added shared batch-export archive budget guards in `server/utils/batchExportArchiveBudget.js`
  - enforced the archive-byte budget in both `server/routes/batchExport.routes.js` and `server/services/batchJobsWorker/exportGenerator.js`
  - added targeted regression coverage for HTTP and worker rejection on oversized generated archives
  - enriched worker PDF generation retry logs with attempt-level diagnostics
- Revalidated the export hardening with targeted checks:
  - `server/tests/routes/batchExport.routes.test.js`
  - `server/tests/services/batchJobsWorker.exportGenerator.test.js`
  - ESLint on the touched export files

- Started implementation work on the 2026-04-17 priority stack:
  - extracted backend runtime startup/shutdown orchestration from `server/config/lifecycle.js` into `server/config/lifecycle/runtimeMaintenance.js`
  - changed shutdown cleanup to best-effort so one failing cleanup step no longer prevents later runtime teardown steps
- Revalidated the lifecycle path with targeted checks:
  - `server/tests/config/lifecycle.test.js`
  - ESLint on the touched lifecycle files

- Added [[topics/Priority Review 2026-04-17]] after a fresh whole-application inspection of the current repository structure and runtime entry points.
- Recorded the updated priority stack as:
  - backend operational decoupling
  - long-running AI/document workflow hardening
  - control-plane simplification and contract tightening
  - hotspot decomposition
  - product-scope discipline
- Linked the new review into [[index]] so future sessions can start from the current application-wide prioritization instead of only the 2026-04-16 baseline.

- Extended degraded resume-analysis observability for low-capability models such as Gemma 4B: salvage logs now include provider/model hints, detected loose-response shape, recovered vs missing fields, section counts, salvage source, and a short response preview.
- Added a low-level metadata test for the loose-text resume-analysis salvage helper.

- Hardened resume-analysis malformed-output recovery for integration/prod-like environments where the provider can ignore `json_object` and still return useful Markdown/text.
- Updated `server/services/openai/resumeOperations.js` to add a final local salvage pass after the existing trio of JSON recovery attempts (normal parse, compact retry, repair prompt).
- Updated `server/services/openai/textUtils.js` with a loose resume-analysis extractor that can rebuild a minimal payload from `key: value`, headings, and bullet-list output.
- Added targeted tests proving both the low-level salvage helper and the full `analyzeResume(...)` fallback path now succeed on non-JSON Markdown responses.
- Revalidated the change with targeted backend checks: `npm test -- server/tests/services/openai.textUtils.test.js`, `npm test -- server/tests/services/openai.resumeOperations.test.js`, and ESLint on the modified files.

- Reinvestigated the transient `DEP0040` `punycode` warnings after the validation cleanup.
- Direct traced runs of backend Vitest, client Vitest, PDF Vitest, `npm run test:pdf`, and `node --trace-deprecation scripts/run-validation-suite.mjs --stage=core` no longer reproduce the warning.
- Current conclusion: there is no stable repo-local failure to fix; if `DEP0040` reappears, the most likely transitive candidates remain `jsdom -> whatwg-url -> tr46 -> punycode` and `ajv -> uri-js -> punycode`, but no active remediation is justified without a reproducible stack.
- Reworked the E2E validation path and brought `npm run validate:e2e` back to green (`86` Playwright tests across Chromium and Firefox).
- Fixed Playwright stack startup by injecting a strong fallback `DEFAULT_ADMIN_PASSWORD` in `scripts/start-playwright-webserver.mjs`, which satisfies the production-like env validation used by the proxy on boot.
- Fixed a real cross-process cache issue in `e2e/helpers/auth.ts`: toggling `allow_user_registration_without_approval` now also bumps/publishes `settings:ui` and `settings:llm` cache invalidations, so the registration route sees the updated flag during the same E2E run.
- Stabilized improve/export E2E fixtures by guaranteeing a minimum firm credit balance in the Playwright bootstrap helper.
- Fixed a schema-drift bug in `server/services/batchJobCredits.service.js`: cancelled job settlement no longer orders `batch_jobs` on a non-existent `updated_at` column.
- Stabilized `e2e/resumes-adaptations-refresh.spec.ts` by renaming the uploaded resume to a deterministic unique candidate name via API and by replacing brittle card locators with filtered-result interactions that match the actual page structure.
- Reduced residual `validate:e2e` noise:
  - `scripts/start-playwright-webserver.mjs` now runs Vite build directly from `client/` instead of nesting `npm run build`, which removes inherited npm config warnings from the Playwright web-server bootstrap
  - `server/routes/auth/config.js` now suppresses the expected non-`Secure` cookie warnings when `E2E_QUIET_EXPECTED_WARNINGS=true`
- Current remaining E2E noise is narrowed to a `DEP0040` `punycode` deprecation emitted by the web-server process during the full Playwright run; direct traced reruns still do not expose a precise repo-local stack, so no safe code fix has been applied yet.
- Reduced backend settings route duplication:
  - `server/routes/settings.routes.js` now delegates default settings payload construction, lightweight presentation/public-home responses, and mutation preparation/persisted-response shaping to `server/routes/settings.routes.helpers.js`
  - targeted validation stayed green with `server/tests/routes/settings.routes.test.js` and ESLint on the touched settings route files
- Decomposed the grouped mission view hotspot:
  - extracted the heavy grouped-by-deal assembly path from `server/services/missions.service.js` into `server/services/missionsGroupedView.service.js`
  - centralized attachment-count hydration for both assigned and unassigned mission collections
  - revalidated with `server/tests/services/missions.service.test.js` and ESLint on the touched mission service files
- Continued the backend settings-route decomposition:
  - moved the Ollama base-URL resolver and `test-llm` payload preparation into `server/routes/settings.routes.helpers.js`
  - kept `server/routes/settings.routes.js` focused on transport/auth/cache orchestration
  - revalidated with `server/tests/routes/settings.routes.test.js` and ESLint on the touched settings files
- Decomposed the resume-submissions hotspot:
  - extracted SQL assembly and persistence primitives from `server/services/resumeSubmissions.service.js` into `server/services/resumeSubmissionsPersistence.service.js`
  - kept client-cache invalidation and service-level semantics in the main service file
  - revalidated with `server/tests/services/resumeSubmissions.service.test.js` and ESLint on the touched submission service files
- Continued the backend settings decomposition again:
  - `GET /api/settings` and `GET /api/settings/defaults` now use helper-owned response builders instead of assembling canonical-overlay/default-decoration logic inline in `server/routes/settings.routes.js`
  - admin LLM/settings preparation inside `server/routes/settings.routes.helpers.js` now has clearer shared steps for normalize -> optional Ollama discovery -> parameter sanitization
  - revalidated with `server/tests/routes/settings.routes.test.js`, `server/tests/services/llmSettingsValidation.service.test.js`, and ESLint on the touched settings files
- Decomposed the mission matching hotspot:
  - extracted the matching-specific provider/retry/parse/metrics pipeline from `server/services/openai/missionOperations.js` into `server/services/openai/missionMatching.service.js`
  - kept the public `matchResumeWithMission(...)` and `adaptResumeToMission(...)` entrypoints in `missionOperations.js`
  - revalidated with `server/tests/services/openai.missionOperations.test.js` and ESLint on the touched mission-operation files
- Decomposed the resume-analysis hotspot:
  - extracted the analysis-specific JSON request/retry/repair/salvage flow from `server/services/openai/resumeOperations.js` into `server/services/openai/resumeAnalysis.service.js`
  - kept public resume workflow entrypoints in `resumeOperations.js`
  - revalidated with `server/tests/services/openai.resumeOperations.test.js` and ESLint on the touched resume-operation files
- Reduced duplication again on persistent settings admin routes:
  - `PUT /api/settings/:id` and `POST /api/settings` now reuse a shared helper for prepare -> persist -> response in `server/routes/settings.routes.helpers.js`
  - `server/routes/settings.routes.js` keeps cache invalidation and security-log concerns local
  - revalidated with `server/tests/routes/settings.routes.test.js`, `server/tests/services/llmSettingsValidation.service.test.js`, and ESLint on the touched settings files
- Decomposed the resume-improvement hotspot:
  - extracted the improvement-specific provider/retry/fallback path from `server/services/openai/resumeOperations.js` into `server/services/openai/resumeImprovement.service.js`
  - kept the public `improveResume(...)` entrypoint in `resumeOperations.js`
  - revalidated with `server/tests/services/openai.resumeOperations.test.js` and ESLint on the touched files
- Decomposed the mission-adaptation hotspot:
  - extracted the adaptation-specific provider/parse/fallback path from `server/services/openai/missionOperations.js` into `server/services/openai/missionAdaptation.service.js`
  - kept the public `adaptResumeToMission(...)` entrypoint in `missionOperations.js`
  - revalidated with `server/tests/services/openai.missionOperations.test.js` and ESLint on the touched files
- Decomposed the cache namespace/runtime implementation:
  - extracted the versioned cache namespace implementations and Redis/memory backend mechanics from `server/services/cache.service.js` into `server/services/cacheNamespaces.service.js`
  - kept `cache.service.js` focused on public cache instances, grouped invalidation helpers, registry-level operations, and exported cache APIs
  - revalidated with `server/tests/services/cache.service.test.js` and ESLint on the touched cache files
- Reduced low-level duplication in the resumes CRUD service:
  - extracted executor resolution, string sanitation, and dynamic update-statement building from `server/services/resumes.service.js` into `server/services/resumesPersistence.service.js`
  - kept SQL execution, cache invalidation, and higher-level resume workflow behavior in the main service file
  - revalidated with `server/tests/services/resumes.service.test.js` and ESLint on the touched resume service files
- Decomposed the template-extraction hotspot:
  - extracted prompt construction from `server/services/templateExtraction.service.js` into `server/services/templateExtractionPrompt.service.js`
  - extracted response processing, placeholder normalization, sanitization, and deterministic layout fallback into `server/services/templateExtractionFallback.service.js`
  - kept the public HTML/vision orchestration entrypoints in `templateExtraction.service.js`
  - revalidated with `server/tests/services/templateExtraction.service.test.js` and ESLint on the touched template extraction files
- Reduced coupling in OpenAI text utilities:
  - extracted the resume-analysis-specific degraded salvage path from `server/services/openai/textUtils.js` into `server/services/openai/resumeAnalysisTextSalvage.service.js`
  - kept `textUtils.js` focused on generic text, HTML, and JSON parsing helpers while preserving the exported salvage functions
  - revalidated with `server/tests/services/openai.textUtils.test.js` and ESLint on the touched OpenAI text utility files
- Decomposed the backup artifact lifecycle:
  - extracted PostgreSQL binary resolution, dump/restore artifact execution, gzip/gunzip handling, legacy dump detection, and best-effort temporary cleanup from `server/services/backup/core.service.js` into `server/services/backup/artifacts.service.js`
  - kept `core.service.js` focused on backup orchestration, history, settings, FTP transfer, retention cleanup, and top-level logging
  - revalidated with `server/tests/services/backup.core.service.test.js` and ESLint on the touched backup files
- Decomposed the OpenAI contract evidence layer:
  - extracted keyword-evidence normalization, scoring, categorization, and evidence-array shaping from `server/services/openai/contracts.js` into `server/services/openai/contracts.keywordEvidence.js`
  - kept the public payload validators in `contracts.js`
  - revalidated with `server/tests/services/openai.resumeOperations.test.js` and ESLint on the touched OpenAI contract files
- Decomposed the OpenAI resume normalization collections layer:
  - extracted shared tag-array and suggestion normalization helpers from `server/services/openai/resumeNormalization.js` into `server/services/openai/resumeNormalizationCollections.js`
  - kept the improvement/analysis orchestration entrypoints in `resumeNormalization.js`
  - revalidated with `server/tests/services/openai.resumeOperations.test.js` and ESLint on the touched normalization files
- Decomposed the email-template MJML lifecycle:
  - extracted lazy MJML loading, compilation, unload scheduling, and graceful shutdown cleanup from `server/services/emailTemplates.service.js` into `server/services/emailTemplatesMjml.service.js`
  - kept template CRUD, rendering, preview, and cache-facing access helpers in `emailTemplates.service.js`
  - preserved keyword substitution through the existing `emailTemplatesKeywords.service.js` helper and removed duplicated inline keyword helpers from the main service
  - revalidated with `server/tests/services/emailTemplates.service.test.js` and ESLint on the touched email template files
- Decomposed the persistent settings route flow:
  - extracted the shared load-current -> prepare -> persist -> response path for `PUT /api/settings/:id` and `POST /api/settings` into `server/routes/settings.routes.persistence.helpers.js`
  - kept `server/routes/settings.routes.js` focused on HTTP/auth, cache invalidation, and security logging
  - revalidated with `server/tests/routes/settings.routes.test.js` and ESLint on the touched settings route files
- Investigated a real GitHub Actions `validate-core` failure on commit `9b88e0bc3c30df4c655df57f6886e67441518bc5`:
  - confirmed the failure happened in `npm run migrate` during fresh-schema bootstrap, not in typecheck or test execution
  - traced the root cause to `docker/schema.sql` being a modern `pg_dump` artifact containing `psql` meta-commands (`\restrict` / `\unrestrict`) that were executed through the Node `pg` driver
  - added `sanitizeSqlForPgExecution(...)` in `server/scripts/dockerMigrate.helpers.js` and applied it in `server/scripts/docker-migrate.js` before executing SQL files
  - added targeted coverage in `server/tests/scripts/dockerMigrate.helpers.test.js`
  - revalidated with the targeted Vitest file, ESLint on the touched migration files, and a local `npm run migrate` that advanced past the previous schema bootstrap crash
- Completed the fresh-schema migration fix path for GitHub CI:
  - moved `ensureSchemaMigrationsTable()` behind the existing-schema branch so fresh bootstrap no longer collides with the canonical dump's own `schema_migrations` definition
  - qualified migration bookkeeping against `public.schema_migrations` to avoid failures after the dump clears `search_path`
  - reset `search_path` to `public` after each SQL-file execution so later bootstrap steps continue to resolve unqualified application tables
  - revalidated on a throwaway PostgreSQL database with `npm run migrate` and then `npm run validate:core`, both passing end-to-end under CI-like env overrides
- Reproduced and fixed the remaining GitHub-only PostgreSQL version mismatch:
  - ran `npm run migrate` against a real local `postgres:16` Docker container to match GitHub Actions exactly
  - confirmed the fresh-schema bootstrap still failed on `SET transaction_timeout = 0;`, which is emitted by the PostgreSQL 18 dump but rejected by Postgres 16
  - updated `sanitizeSqlForPgExecution(...)` to strip that version-specific GUC before execution and added targeted test coverage
  - revalidated with `npm run migrate` and `npm run validate:core` against the Postgres 16 container, both passing end-to-end
- Fixed a cross-platform share-path validation gap revealed by GitHub CI:
  - traced the failing `shareResume.service` test to `isManagedSharedPdfPath(...)` treating Windows absolute paths like `C:\temp\outside.pdf` as safe relative paths when running on Linux
  - updated `server/services/shareResume.helpers.js` to reject Windows absolute paths even on POSIX runners before resolving them under the managed share directory
  - added direct coverage in `server/tests/services/shareResume.helpers.test.js`
  - revalidated with the targeted share service/helper Vitest files and ESLint on the touched files
- Fixed the remaining cross-platform test assertions in `shareResume.service`:
  - replaced Windows-only path expectations such as `uploads\\shared\\...` and absolute `C:\\...` paths with `path.join(...)` / `path.resolve(...)`
  - kept the service behavior unchanged while making the share resume test suite stable on both Windows and Linux runners
  - revalidated again with the targeted share service/helper Vitest files and ESLint
- Updated CI state memory after the latest GitHub reruns:
  - recorded that `validate-core` is green again after the migration bootstrap, share resume, and retry test-path fixes
  - recorded the remaining non-blocking CI warnings: GitHub Actions Node 20 deprecation notices and Node `DEP0040` `punycode` warnings
  - noted that `validate-e2e` was still in progress at the time of the update, so no durable E2E conclusion was captured yet
- Reduced the remaining frontend warning noise that was still surfacing inside `validate-core`:
  - stabilized `client/src/hooks/useScopedViewRefresh.ts` so identical scope subscriptions no longer cause repeated refresh wiring across renders
  - removed the nested-button DOM violation in `client/src/components/ResumesPage/DealSection.tsx`
  - replaced unstable `null`-based sidebar section keys with explicit ids in `client/src/components/Sidebar.tsx`
  - filtered blank/duplicate grouped-tag render keys in `client/src/components/ResumesPage/DealsGroupedView.sections.tsx`
  - revalidated with targeted client Vitest files, ESLint on the touched frontend files, and a full `node scripts/run-client-vitest.mjs run --config client/vitest.config.ts` pass (`129` files / `529` tests)
- Investigated and fixed the remaining `validate:e2e` regressions from GitHub Actions:
  - identified that fresh CI databases could start without any canonical `llm_settings` row, which broke three distinct E2E assumptions at once: public home routing, self-service auto-approval, and adaptation fixture creation
  - updated `e2e/helpers/auth.ts` so Playwright bootstrap now ensures canonical settings exist with `public_home_enabled = true`, a deterministic non-empty `llm_model`, and cache invalidation after settings mutations
  - changed `setSelfServiceRegistrationAutoApproval(...)` to create-or-update canonical settings instead of issuing an `UPDATE` that silently affects zero rows on fresh databases
  - removed the stale hardcoded admin `firmId` from `e2e/admin-crud-flows.spec.ts` by deriving the active admin firm at runtime
  - tightened stale Playwright expectations in `e2e/admin-quality-pages.spec.ts` and `e2e/auth.spec.ts` to match the current DOM/text contract
  - revalidated with targeted Playwright runs:
    - Chromium: `auth`, `public-navigation`, `admin-quality-pages`, `admin-crud-flows`, `resumes-adaptations-refresh`
    - Firefox: `auth`, `public-navigation`, `admin-quality-pages`, `admin-crud-flows`
  - all targeted reruns passed
- Fixed E2E lint coverage so ESLint now passes on the Playwright suite:
  - added repo-root `tsconfig.e2e.json` covering `e2e/**/*.ts` and `playwright.config.ts`
  - updated `eslint.config.js` with a dedicated override so those files no longer fail TypeScript project resolution
  - fixed the only remaining real lint error in `e2e/helpers/docx.ts` by replacing the control-character ASCII regex range with the equivalent Unicode `\p{ASCII}` form
  - revalidated with `node .\scripts\run-eslint.mjs e2e playwright.config.ts`
- Fixed the remaining public-route E2E flake from GitHub `validate:e2e`:
  - traced the last `/welcome` and `/signin` failures to `client/src/services/authService.ts`, where `restoreSession()` used raw `fetch()` calls without a timeout
  - when `/api/auth/me` stalled, `AuthContext` stayed in its initialization spinner and the public `/welcome` links never became interactable within Playwright's 30s budget
  - added an explicit short-timeout wrapper for public auth bootstrap requests and made session restore fail closed to unauthenticated state on timeout
  - added unit coverage in `client/src/services/authService.test.ts` for the hung-session-restore path
  - revalidated with:
    - `node .\node_modules\vitest\vitest.mjs run client\src\services\authService.test.ts`
    - `node .\node_modules\@playwright\test\cli.js test e2e/public-navigation.spec.ts e2e/auth.spec.ts --project=chromium`
    - `node .\node_modules\@playwright\test\cli.js test e2e/public-navigation.spec.ts e2e/auth.spec.ts --project=firefox`
- Cleaned up E2E build artifact tracking:
  - confirmed `playwright.config.ts` and `scripts/start-playwright-webserver.mjs` generate static assets into `client/dist-e2e`
  - recorded `client/dist-e2e` as generated Playwright/Vite output rather than durable source
  - added `client/dist-e2e/` to repo ignore rules and removed the directory from Git tracking while keeping local files in place
- Hardened resume improvement persistence against weak-model invalid structured responses:
  - traced a real failure path where improvement generation succeeded but the post-improvement analysis still aborted the whole job with `Le modèle LLM a retourné une réponse invalide`
  - updated `server/services/batchJobsWorker/processors/improvement.js` so invalid-response failures in the post-improvement analysis now fall back to the structured analysis already embedded in the improvement result when usable
  - added targeted regression coverage in `server/tests/services/batchJobsWorker.itemProcessors.test.js`
  - revalidated with `node .\node_modules\vitest\vitest.mjs run server\tests\services\batchJobsWorker.itemProcessors.test.js`
- Hardened public landing-page startup for E2E and slow runtime settings paths:
  - traced the stable `validate:e2e` failures on `e2e/public-navigation.spec.ts` to `/welcome` sometimes not rendering its public auth links quickly enough on first paint
  - updated `client/src/app/publicHomeSetting.ts` so `/welcome` renders the public-home shell optimistically before the async runtime settings fetch resolves
  - added targeted coverage in `client/src/app/publicHomeSetting.test.tsx`
  - revalidated with:
    - `node .\node_modules\vitest\vitest.mjs run client\src\app\publicHomeSetting.test.tsx`
    - `node .\node_modules\@playwright\test\cli.js test e2e/public-navigation.spec.ts --project=chromium`
- Stabilized the remaining reproduced Firefox E2E flakes by tightening test sequencing:
  - updated `e2e/password-recovery.spec.ts` to use `page.goto(..., { waitUntil: 'domcontentloaded' })` on reset-password routes instead of waiting for the full `load` event
  - updated `e2e/analysis-improve-export.spec.ts` to wait for the second-step upload file input before calling `setInputFiles(...)`
  - revalidated with:
    - `node .\node_modules\@playwright\test\cli.js test e2e/password-recovery.spec.ts --project=firefox`
    - `node .\node_modules\@playwright\test\cli.js test e2e/analysis-improve-export.spec.ts --project=firefox`
- Extended improvement observability to separate structured-output degradation modes:
  - added `postAnalysisFallbackRuns` to the persisted/public improvement metrics surface alongside the existing `fallbackRuns`
  - emit that counter from `server/services/batchJobsWorker/processors/improvement.js` when the improvement text is valid but the post-improvement persistence analysis falls back to the embedded analysis because the returned structured payload is invalid
  - revalidated with `node .\node_modules\vitest\vitest.mjs run server\tests\services\batchJobsWorker.itemProcessors.test.js`
- Fixed the France market map blinking/reload loop:
  - traced the issue to `client/src/components/market/FranceMapCanvas.tsx`, where the MapLibre initialization effect depended on `mapReady` and `isDarkMode` even though that same effect created the map and flipped readiness state
  - this could trigger repeated cleanup/recreation cycles and make the France map appear to flash or never settle during loading
  - stabilized initialization by making the mount effect depend only on stable initialization inputs and by freezing the initial style in a ref, while leaving theme switches to the separate style-sync effect
  - revalidated with:
    - `node .\node_modules\vitest\vitest.mjs run --config client\vitest.config.ts client\src\components\market\useFranceMapData.test.ts client\src\components\market\useMarketTrendsDashboard.test.ts`
    - `node .\scripts\run-eslint.mjs client\src\components\market\FranceMapCanvas.tsx`
- Locked and extended the follow-up quality work around the France map and small-model fallback paths:
  - added `client/src/components/market/FranceMapCanvas.test.tsx` to assert that MapLibre is initialized once and only restyled on theme changes
  - simplified `FranceMapCanvas.tsx` by removing the redundant second MapLibre CSS import from the map-initialization effect; runtime CSS injection remains centralized in the dedicated style-loading effect
  - added a downstream regression in `server/tests/services/resumeAdaptation.service.test.js` proving adaptation content prefers `improved_text` over `original_text`
  - confirmed the touched files remain UTF-8 without BOM and revalidated with:
    - `node .\node_modules\vitest\vitest.mjs run --config client\vitest.config.ts client\src\components\market\FranceMapCanvas.test.tsx client\src\components\market\useFranceMapData.test.ts client\src\components\market\useMarketTrendsDashboard.test.ts`
    - `node .\node_modules\vitest\vitest.mjs run server\tests\services\resumeAdaptation.service.test.js server\tests\services\batchJobsWorker.itemProcessors.test.js`
    - `node .\scripts\run-eslint.mjs client\src\components\market\FranceMapCanvas.tsx client\src\components\market\FranceMapCanvas.test.tsx server\services\batchJobsWorker\processors\improvement.js server\tests\services\resumeAdaptation.service.test.js`
- Added a GitHub Pages showcase for the Obsidian vault:
  - added a static-site generator in `scripts/build-pages.mjs` that turns vault markdown into browsable HTML under `docs/`
  - added a dedicated Pages deployment workflow in `.github/workflows/github-pages.yml`
  - added `site-assets/site.css` as the shared visual layer for the generated showcase
  - generated the initial `docs/` site so core pages, topics, entities, and raw source notes are directly browsable on GitHub Pages
- Tightened GitHub Pages coverage for the vault showcase:
  - removed the last broken wiki-link in the generated site by exposing `AGENTS.md` as a published page
  - extended the static-site generator to publish non-markdown vault files (`.base`, `.canvas`) as plain-text pages
  - revalidated that the Pages output now exposes all supported vault source files with zero generated broken links
- Completed a wider UTF-8-without-BOM cleanup for visible French strings across the application:
  - corrected user-facing ASCII fallback text in CV improvement/adaptation flows, template extraction/preview, settings, metrics, users, editor controls, GDPR mail errors, and backup-failure email content
  - kept only the intentionally corrupted string matchers used by LLM salvage/fallback code paths
  - revalidated with targeted ESLint plus focused Vitest suites on resume analysis UI, metrics UI, and backend adaptation/improvement workers
- Surfaced the improvement post-analysis fallback metric in the client and CI configuration:
  - added `postAnalysisFallbackRuns` display and regression coverage in the metrics UI
  - forced GitHub Actions JavaScript actions onto Node 24 in `.github/workflows/ci.yml`
  - confirmed the remaining `punycode` warning is transitive dependency noise rather than app/runtime code
- Catalogued the repository’s main Markdown documentation in the vault:
  - added a raw source inventory for the main repo docs including `README.md`, `INSTALL.md`, `INSTALL_PG.md`, `SECURITY.md`, `ARCHITECTURE.md`, `USER_GUIDE.md`, Docker docs, OCR docs, and LLM governance docs
  - added a synthesized page `topics/Repository Documentation Map` describing which Markdown files are authoritative for install, Docker, security, OCR, prompt governance, and user-facing guidance
  - updated the vault index to expose this documentation map and its raw source note
- Deepened the vault ingest of repository markdown docs by domain:
  - added dedicated raw source notes for installation/deployment docs, security/user-guide docs, and OCR/LLM technical docs
  - updated `topics/Docker Environment`, `topics/Upload OCR and Parsing Pipeline`, `topics/LLM Control Plane`, `SECURITY`, and `topics/Repository Documentation Map` with facts explicitly grounded in those repo markdown sources
  - recorded that several repo docs remain useful operationally despite visible mojibake/legacy encoding in parts of the source text
- Tightened the repository-doc encoding assessment and cleanup:
  - verified with explicit UTF-8 reads that the broad doc-encoding issue was overstated and mostly a terminal-display artifact
  - repaired the confirmed remaining corruption in `README.md` (Stripe doc link text plus Hugging Face French labels) and `ARCHITECTURE.md` (broken diagram arrows)
  - updated `topics/Repository Documentation Map` to record that the remaining documentation debt is now mostly wording/consolidation rather than encoding repair
- Consolidated a few remaining quality priorities after the CI/runtime stabilization work:
  - centralized fragile localized Playwright selectors in `e2e/helpers/ui.ts` for signin, register, reset-password, improve, and list/by-deal toggles
  - migrated the affected public/auth/password-recovery/improvement/refresh specs onto those helpers to reduce wording-coupled flake risk
  - made improvement metrics more operationally readable by translating `embedded-analysis-fallback` / `post-analysis` recent-entry details into human-readable labels in the client metrics card
  - reduced CI warning noise by suppressing the transitive `DEP0040` `punycode` warning at workflow level while recording that the underlying dependency debt still exists
  - clarified in `README.md` that `INSTALL.md` and `docker/README.md` are the canonical install/runtime docs to limit future documentation drift
- Treated the lingering `auth.spec.ts` validation caveat by fixing the E2E bootstrap semantics rather than patching auth flows:
  - identified that the apparent auth-spec instability could come from Playwright reusing an unrelated local server when `reuseExistingServer` was implicit
  - changed Playwright to require `PLAYWRIGHT_REUSE_EXISTING_SERVER=true` before reusing a local server, and raised the startup timeout to 180 seconds for cold Windows runs
  - changed proxy startup to fail fast when PostgreSQL initialization fails, so local DB credential problems now surface as explicit startup failures instead of generic Playwright `/health` timeouts
- Continued that local-E2E/bootstrap cleanup with docs and preflight work:
  - `scripts/start-playwright-webserver.mjs` now probes PostgreSQL before the frontend build and emits an actionable failure message when the local `POSTGRES_*` credentials are wrong
  - `INSTALL.md` now records the local E2E bootstrap requirement (`npm run migrate` plus valid PostgreSQL credentials) instead of leaving Playwright behavior implicit
  - `docker/README.md` now states clearly that it is the canonical Docker reference
  - `client/src/i18n/locales/fr/metrics.json` received a last wording pass on several visible labels (`succès du cache`, `routes API les plus sollicitées`, `reçus / stockés en base`, `recherche de profils`, etc.)
- Added a durable LLM pricing and profitability note to the vault:
  - recorded current AI credit economics from `server/config/aiCredits.js` and current Stripe pack defaults from `server/config/stripe.js`
  - captured an official 2026-04-17 pricing snapshot for OpenAI, Anthropic, DeepSeek, Z.AI / GLM, MiniMax, and Hugging Face routed inference
  - modeled an explicit local Ollama option as infra-backed cost rather than fake token pricing
  - added `topics/LLM Cost Model and Pricing Strategy` with per-action indicative costs and three tariff ranges: budget/local-first, universal hosted, and premium-safe
- Mirrored that pricing note into the repository:
  - added `docs/LLM_COST_MODEL_AND_PRICING.md`
  - linked it from `README.md`
  - updated `topics/Repository Documentation Map` so pricing and tariff discussions now have a clear repo-side reference
- Refreshed the pricing documents against the latest public provider model set visible on 2026-04-17:
  - updated repo-side pricing docs to replace old `GPT-5.2` / `Claude 3.5` assumptions with `GPT-5.4`, `GPT-5.4 mini`, `Claude Opus 4.7`, `Claude Haiku 4.5`, `MiniMax M2.7`, and current DeepSeek V3.2
  - recorded that `GLM-5.1` is publicly available in Z.AI overview/release notes but still lacks a distinct public pricing row, so projections currently use `GLM-5` as the closest official pricing proxy
  - confirmed that the commercial conclusion still holds: the current Stripe packs remain premium-safe even under the refreshed frontier-model mix
# 2026-04-17

- Added a management-facing executive presentation for LLM selection and tariff posture, derived from the repository pricing studies, with a recommended hosted-universal operating model and tariff grid.
- Hardened the small-model CV flow further:
  - post-improvement persistence analysis now merges sparse successful payloads with the embedded improvement analysis instead of only handling hard invalid-response fallbacks
  - improvement metrics now distinguish full post-analysis fallback vs post-analysis merge
  - adaptation metrics now record whether the operation used `improved_text` or `original_text`
  - the analysis/improve/export Playwright flow now uses a shared file-input helper instead of an inline upload wait sequence

- Tightened local Playwright bootstrap against stale listeners:
  - confirmed a misleading local export `403` came from an old PDF server process still listening on `3002`, not from the export flow itself
  - `scripts/start-playwright-webserver.mjs` now probes the intended local E2E ports before startup and fails early if `3001` or `3002` is already occupied
- Finished the next code-priority pass on E2E coverage, admin diagnostics, and residual quality debt:
  - `e2e/helpers/ui.ts` now centralizes the remaining localized selectors in UTF-8 (`rafraîchir`, `connectez-vous`, `créer un compte`, `réinitialiser`, `améliorer`)
  - `analysis-improve-export.spec.ts` now covers improved PDF export and conditionally covers DOCX export only when `pandoc` is available on the machine
  - `client/src/components/Metrics/OperationLLMCard.tsx` now surfaces recent-entry degradation explicitly (`generation fallback`, `post-analysis fallback`, `post-analysis merge`, `adaptation fallback`, `failed run`)
  - `client/src/i18n/locales/fr/metrics.json` was repaired from mojibake to UTF-8 without BOM
  - targeted validation passed for ESLint, `OperationLLMCard.test.tsx`, `upload-to-analysis.spec.ts`, and the isolated PDF export scenario; the remaining combined-run `ERR_CONNECTION_REFUSED` is still classified as local stack instability
- Closed the two remaining local E2E reservations on the analysis/improve/export flow:
  - `scripts/start-e2e-stack.mjs` now auto-restarts the proxy and PDF children on unexpected exits, which removes the mid-sequence local `ERR_CONNECTION_REFUSED` failure from the combined Chromium rerun
  - `e2e/helpers/ui.ts` now retries navigations on transient `ERR_CONNECTION_REFUSED`
  - DOCX export no longer assumes `pandoc` specifically: `pdf-server/lib/docxGenerator.cjs` now uses `pandoc` when present, falls back to LibreOffice/`soffice` for DOCX generation when available, and only fails explicitly when no DOCX converter exists at all
  - the combined local Chromium run of `analysis-improve-export` now completes as `2 passed, 1 skipped` on a workstation without a local DOCX converter
- Added a first durable accessibility quality pass on the frontend:
  - `Layout.tsx` now exposes a skip link and a stable `main-content` landmark target
  - the custom `UsersManagement` modal now has labelled dialog semantics, focus restoration, and `Escape` close behavior
  - `ImprovementAnimation.tsx` now exposes reader-friendly live status semantics and a labelled fullscreen dialog wrapper
  - `ChatbotWindow.tsx` now exposes dialog semantics and an explicit label path for the message input
  - targeted ESLint and Vitest checks passed on the touched surfaces
- Added the next accessibility hardening layer:
  - the frontend lint stack now includes `eslint-plugin-jsx-a11y`, with the crashing `label-has-associated-control` rule explicitly disabled until the repository's current `minimatch` / plugin interop issue is resolved
  - targeted `axe` smoke tests now cover `SignIn`, `Register`, and `ResetPasswordPage`
  - `SignIn`, `Register`, and `ResetPasswordPage` now expose `role="alert"` summaries plus `aria-invalid` / `aria-describedby` associations on their critical fields
  - `Register` and `ResetPasswordPage` now focus the first invalid field on client-side validation failures
  - targeted ESLint and client-side Vitest checks passed on the auth and accessibility surfaces
# 2026-04-18

- Tightened the CTA hierarchy on the editorial CVthèque and Missions pages:
  - the page-primary action now reuses the same visual recipe as the active view toggle (`segmented-control__item--active`) instead of introducing a separate competing primary style
  - the affected CTA surfaces are `client/src/components/ResumesPage/SearchAndActions.tsx` and `client/src/components/MissionsPage/MissionsDealsGroupedView.parts.tsx`
  - the shared style contract now lives in `client/src/styles/resumesEditorial.css` and `client/src/styles/editorialPages.css` as `cv-page-primary-action`
- Extended the CTA hierarchy to matching and auth entry flows:
  - `client/src/pages/ProfileMatchSearchPanel.tsx` now uses `cv-page-primary-action` for the main "search profiles" CTA
  - `client/src/components/SignIn.tsx`, `client/src/components/Register.tsx`, and `client/src/pages/ForgotPasswordPage.tsx` now use a shared global `app-primary-action`
  - `client/src/styles/_base.css` now carries the non-editorial primary CTA recipe so auth pages do not duplicate inline button gradients
- Extended the CTA and tabs cleanup to the authenticated home and older legacy primaries:
  - `client/src/components/HomePage/HomeStickyNav.tsx` now reuses `ResponsivePageTabs` instead of a custom sticky-pill implementation, with `ResponsivePageTabs` updated to allow icon-less usage
  - the authenticated home dashboard now promotes `Importer un CV` as the page-primary CTA instead of rendering it with the same secondary quick-action card treatment
  - a broad frontend pass replaced many remaining legacy blue primaries (`btn btn-primary` and explicit `bg-indigo-600` button styles) with the shared `app-primary-action` contract
- Fixed the authenticated home tabs contrast contract in both themes:
  - `client/src/components/page/ResponsivePageTabs.tsx` no longer injects local Tailwind text-color utilities for inactive tabs; segmented tab contrast now comes only from the shared CSS contract
  - `client/src/styles/_base.css` now gives the global segmented-control clearer active/inactive contrast in light mode and higher inactive-text readability plus stronger active-state separation in dark mode

## [2026-04-18] fix | preserve consumed batch AI credit markers when persisting result data

- Investigated reports of successful LLM operations being refunded anyway.
- Confirmed the false-refund path on reserved batch actions:
  - consumption markers are stored in `batch_job_items.pending_data.creditUsage`
  - `server/services/batchJobCredits.service.js` refunds any reserved action missing from that map during final settlement
  - `server/services/batchJobs/itemCrud.js:updateJobItemStatus()` was overwriting `pending_data` when storing `result_data`, which could erase `creditUsage` after a successful action
- Fixed `updateJobItemStatus()` to preserve existing `creditUsage` while writing `result_data`.
- Added a regression test in `server/tests/services/batchJobs.itemCrud.test.js`.
- Revalidated with:
  - `npx vitest run server/tests/services/batchJobs.itemCrud.test.js`
  - `npx vitest run server/tests/services/batchJobsWorker.itemProcessors.test.js`

## [2026-04-18] fix | keep all in-scope profiles in mission search results even when LLM scoring omits some ids

- Investigated a profile-search result gap where the returned result set could be smaller than the number of CVs in scope even with default segmentation and no explicit result limit.
- Confirmed the root cause in `server/services/profileMatching.service.js`:
  - all in-scope resumes were fetched correctly
  - for small sets, the usual prefilter cap was not the cause
  - the final result builder dropped any profile whose `resumeId` was omitted from the LLM `scores` payload
- Fixed the consolidation step so omitted candidates remain in the results with an explicit low/default score instead of disappearing.
- Added a regression test in `server/tests/services/profileMatching.service.test.js` covering the case where the LLM returns scores for only a subset of candidates.
- Revalidated with:
  - `npx vitest run server/tests/services/profileMatching.service.test.js`
  - `npx vitest run server/tests/services/batchJobsWorker.itemProcessors.test.js`

## [2026-04-18] fix | score all accessible CVs in profile matching, including LLM failure fallback

- Investigated a stronger matching regression where the UI could show `Aucun profil ne correspond aux critères` even though the user had accessible CVs.
- Confirmed two backend causes in `server/services/profileMatching.service.js`:
  - profile search still built an LLM scoring subset instead of treating all accessible CVs as candidates for final scoring
  - when batch LLM scoring failed completely or no model was configured, the service returned an empty `profiles` array instead of falling back to local scoring
- Changed profile matching so all accessible CVs are sent through the batching pipeline, and added deterministic local heuristic fallback scoring for:
  - complete LLM failure
  - missing LLM score entries for some candidate ids
- Added/updated regression coverage in `server/tests/services/profileMatching.service.test.js`.
- Revalidated with:
  - `npx vitest run server/tests/services/profileMatching.service.test.js`
  - `npx vitest run server/tests/services/batchJobsWorker.itemProcessors.test.js`

## [2026-04-18] fix | reduce GLM rate-limit bursts on profile matching batch scoring

- Investigated a production `429` on GLM during profile matching:
  - `/var/log/supervisor/proxy-server.err.log` showed `GLM API call failed` with `Rate limit reached for requests` on `glm-5.1`
  - the provider-level retry layer already retries `429`, so the remaining issue was burst pressure from the matching batch orchestration itself
- Confirmed that `server/services/profileMatching/llmScoring.js` could still launch multiple GLM scoring batches in parallel with generic hosted-provider defaults.
- Tightened GLM-specific defaults for profile matching:
  - `maxConcurrency = 1`
  - `batchSize = 16`
- Practical effect: medium result sets such as 14 accessible CVs now go through a single GLM scoring request instead of multiple near-simultaneous requests that can trigger provider-side request-rate limiting.
- Added regression coverage in `server/tests/services/profileMatching.service.test.js`.
- Revalidated with:
  - `npx vitest run server/tests/services/profileMatching.service.test.js`
  - `node .\scripts\run-eslint.mjs server\services\profileMatching\llmScoring.js server\tests\services\profileMatching.service.test.js`
## [2026-04-18] fix | prevent legacy submit hover from overriding migrated auth CTAs

- Investigated auth/public screens where CTA buttons looked correct at rest but switched to the old visual treatment on hover.
- Confirmed the root cause in `client/src/styles/_base.css`: legacy global selectors on `button[type="submit"]` and `input[type="submit"]` were still applying on top of the newer `.app-primary-action` CTA style used by sign-in, register, forgot-password, reset-password, and similar screens.
- Fixed the overlap at the source by excluding `.app-primary-action` from the legacy submit selectors for base, hover, and active states.
- Result: migrated CTA buttons now keep their intended hover/active treatment consistently, while untouched legacy submit buttons keep their previous styling.
- Revalidated with:
  - `node .\scripts\run-eslint.mjs client\src\styles\_base.css client\src\components\SignIn.tsx client\src\components\Register.tsx client\src\pages\ForgotPasswordPage.tsx client\src\pages\ResetPasswordPage.tsx`

## [2026-04-18] fix | improve CV template header/footer extraction

- Investigated template extraction quality for CV models where body reconstruction was already strong but `headerContent` and `footerContent` were often empty, truncated, or misclassified.
- Confirmed the weak point in `server/routes/templates/extraction/pdfLayoutTemplateBuilder.js`:
  - header/footer detection relied mainly on fixed top/bottom first-page ratios
  - this missed deeper but still contiguous header/footer blocks
  - it also ignored repeated cabinet branding or pagination visible on later pages
- Improved the structured PDF layout builder so header/footer detection now combines:
  - fixed ratio seeding
  - short-range continuity extension for contiguous top/bottom blocks
  - repeated top/bottom line hints detected across up to the first three PDF pages
- Added regression coverage in `server/tests/routes/templates.extraction.pdfLayoutTemplateBuilder.test.js` for:
  - a header block extending below the old ratio cutoff
  - repeated top/bottom lines being promoted into header/footer regions
- Revalidated with:
  - `npx vitest run server/tests/routes/templates.extraction.pdfLayoutTemplateBuilder.test.js`
  - `npx vitest run server/tests/routes/templates.extraction.extractors.test.js`
  - `node .\scripts\run-eslint.mjs server\routes\templates\extraction\pdfLayoutTemplateBuilder.js server\tests\routes\templates.extraction.pdfLayoutTemplateBuilder.test.js`

## [2026-04-18] tweak | give more label space to transverse page tabs

- Adjusted the shared transverse tabs component in `client/src/components/page/ResponsivePageTabs.tsx`.
- Reduced the grid gap and outer segmented-control padding slightly, and also tightened per-tab horizontal padding and icon/text spacing.
- Kept the same responsive grid behavior and active-state styling while increasing the effective width available to each tab label before truncation.
- Revalidated with:
  - `node .\scripts\run-eslint.mjs client\src\components\page\ResponsivePageTabs.tsx client\src\pages\SettingsPage.tsx client\src\pages\AdminWorkspacePage.tsx client\src\pages\ResumeImprovePage.tsx`
  - `pnpm exec tsc --noEmit -p client/tsconfig.json`

## [2026-04-18] tweak | stop aggressive truncation in transverse page tabs

- Reworked `client/src/components/page/ResponsivePageTabs.tsx` again after observing that labels were still truncated too aggressively on dense admin screens.
- The shared tab component now:
  - uses a smaller default minimum item width
  - uses tighter outer and inner spacing
  - allows label text to wrap instead of forcing single-line ellipsis
- Goal: prioritize full tab-label visibility over preserving a single-line layout at all costs.
- Revalidated with:
  - `node .\scripts\run-eslint.mjs client\src\components\page\ResponsivePageTabs.tsx client\src\pages\AdminWorkspacePage.tsx client\src\pages\SettingsPage.tsx`
  - `pnpm exec tsc --noEmit -p client/tsconfig.json`

## [2026-04-18] fix | recover from stale lazy-loaded chunks after template extraction

- Investigated a reported "template extraction" failure that surfaced in the UI as:
  - `TypeError: Failed to fetch dynamically imported module`
  - missing hashed asset for `NewTemplatePage`
- Correlated the user-facing error with backend logs showing:
  - `POST /api/templates/extract-from-cv` completed with `200`
  - the extraction request was slow but successful
- Conclusion: the extraction itself succeeded; the failure happened after navigation when the SPA tried to lazy-load a stale JS chunk from an older deployment.
- Updated `client/src/app/lazyPages.ts` so lazy-loaded routes now:
  - detect recoverable dynamic-import/chunk-load failures
  - trigger a one-time full page reload to pick up the current asset manifest
  - avoid infinite recovery loops by allowing only one retry for the current path
- Added regression coverage in `client/src/app/lazyPages.test.ts`.
- Revalidated with:
  - `npx vitest run client/src/app/lazyPages.test.ts`
  - `node .\scripts\run-eslint.mjs client\src\app\lazyPages.ts client\src\app\lazyPages.test.ts`
  - `pnpm exec tsc --noEmit -p client/tsconfig.json`

## [2026-04-18] fix | degrade cleanly when GDPR mail token decryption fails

- Investigated recurring scheduler logs during proactive GDPR token refresh:
  - `[GDPR Token Refresh] Proactive refresh failed`
  - `Unsupported state or unable to authenticate data`
- Confirmed the failure point in `server/services/mail/gdprMailService.js`:
  - the scheduler was reaching the refresh-token decryption step
  - the backend crypto layer threw an AEAD authentication error, which indicates unreadable stored token ciphertext for the current key/material rather than a normal Google refresh failure
- Updated the GDPR mail service so unreadable stored tokens now:
  - are classified explicitly as local token-decryption failures
  - mark the stored GDPR token as requiring reconnection by nulling encrypted access/refresh fields and expiring the record
  - return a user-facing reconnect-required message instead of the raw crypto runtime error text
- This prevents the scheduler from surfacing opaque `Unsupported state or unable to authenticate data` errors for this class of failure.
- Added regression coverage in `server/tests/services/gdprMailService.test.js`.
- Revalidated with:
  - `npx vitest run server/tests/services/gdprMailService.test.js`
  - `node .\scripts\run-eslint.mjs server\services\mail\gdprMailService.js server\tests\services\gdprMailService.test.js`

## [2026-04-18] fix | regenerate unreadable stored share tokens instead of breaking share flows

- Investigated failures around share-link / QR-code generation and narrowed the risk to stored share-token handling.
- Confirmed two brittle spots in the share layer:
  - `getOrCreateShareToken(...)` could throw if an existing stored token was unreadable
  - `getShareStatus(...)` could fail entirely when trying to decode a corrupted or incompatible stored token
- Updated the share services so unreadable stored share tokens now fail soft:
  - original-file token generation treats the stored token as invalid and regenerates a fresh one
  - share status hides unreadable PDF/file tokens instead of throwing
- Practical effect: stale/corrupted/incompatible stored share-token values no longer block QR-code/link generation paths.
- Added regression coverage in `server/tests/services/shareResume.service.test.js`.
- Revalidated with:
  - `npx vitest run server/tests/services/shareResume.service.test.js`
  - `node .\scripts\run-eslint.mjs server\services\shareResume.helpers.js server\services\shareResume.service.js server\tests\services\shareResume.service.test.js`

## [2026-04-18] fix | keep resume share-token persistence within varchar(64)

- Investigated a remaining public-share generation failure with logs showing:
  - `value too long for type character varying(64)`
  - failure on `UPDATE resumes ... shared_pdf_token = $2`
- Confirmed the root cause in `server/utils/shareTokenStorage.js`:
  - the recently introduced versioned/encrypted stored token format exceeded the real schema width of `resumes.shared_pdf_token` / `shared_file_token`
  - share generation therefore failed before the QR-code/link flow could complete
- Fixed the persistence contract so new resume share-token writes stay within the original 64-character token budget.
- Kept compatibility for lookup helpers so legacy versioned token patterns can still be queried if encountered.
- Revalidated with:
  - `npx vitest run server/tests/utils/shareTokenStorage.test.js server/tests/services/shareResume.service.test.js server/tests/routes/share.routes.test.js`
  - `node .\scripts\run-eslint.mjs server\utils\shareTokenStorage.js server\tests\utils\shareTokenStorage.test.js server\services\shareResume.helpers.js server\services\shareResume.service.js`

## [2026-04-18] fix | standardize CV template extraction timeout to the platform LLM baseline

- Investigated reports that the CV-template extraction timeout still looked non-standard even after the general IA timeout unification.
- Confirmed the inconsistency in `server/services/templateExtraction.service.js`:
  - the shared LLM facade already enforces the platform baseline `LLM_OPERATION_TIMEOUT_MS`
  - but the extraction service still passed a legacy local `120000 ms` timeout on the HTML branch
  - the vision branch did not pass the standardized timeout explicitly
- Fixed the extraction service so both paths now request the same standard timeout:
  - HTML extraction uses `LLM_OPERATION_TIMEOUT_MS`
  - vision fallback uses `LLM_OPERATION_TIMEOUT_MS`
  - fallback logging now reports the standardized timeout instead of the old 120-second hint
- Updated regression coverage in `server/tests/services/templateExtraction.service.test.js` to lock this contract.
- Revalidated with:
  - `npx vitest run server/tests/services/templateExtraction.service.test.js`
  - `node .\scripts\run-eslint.mjs server\services\templateExtraction.service.js server\tests\services\templateExtraction.service.test.js`

## [2026-04-18] fix | preserve extracted images and source CSS in CV template extraction

- Reworked the template-extraction post-processing to improve asset fidelity rather than only placeholder compliance.
- Confirmed two quality gaps in the previous pipeline:
  - extracted images were mostly reduced to a single logo replacement path
  - recovered layout CSS could still be discarded when the LLM returned sparse or generic stylesheet output
- Updated the extraction stack so the final template now:
  - hydrates detected `template-image-slot` placeholders with extracted document images in sequence
  - still replaces classic logo placeholders where relevant
  - merges the structured-layout stylesheet back into the final returned stylesheet instead of relying only on the LLM stylesheet
  - appends shared asset rules so embedded extracted images render correctly inside stored templates
- Expanded targeted regression coverage for:
  - multi-slot image hydration
  - merged source stylesheet preservation on the final extracted template
- Revalidated with:
  - `npx vitest run server/tests/routes/templates.extraction.imagePlaceholders.test.js server/tests/services/templateExtraction.service.test.js server/tests/routes/templates.extraction.extractors.test.js`
  - `node .\scripts\run-eslint.mjs server\routes\templates\extraction\imagePlaceholders.js server\services\templateExtractionFallback.service.js server\services\templateExtraction.service.js server\utils\sanitizer.backend.js server\tests\routes\templates.extraction.imagePlaceholders.test.js server\tests\services\templateExtraction.service.test.js`

## [2026-04-18] fix | rebase extracted CV templates on detected layout classes and embed logos inline

- Investigated a remaining extraction-quality defect where:
  - `-logo-` could still be visible in extracted template output
  - the recovered stylesheet was present, but the final header/body/footer no longer carried the `template-region-*` classes expected by that stylesheet
- Confirmed the mismatch came from the final LLM-normalized HTML drifting away from the structured PDF layout fragments, while the source layout stylesheet was still merged into the result.
- Updated `server/services/templateExtractionFallback.service.js` so that when structured layout fragments are available:
  - header, content, and footer are re-based on the detected `template-region-*` fragments
  - content line blocks are rewritten into `-name-`, `-title-`, and `-content-` placeholders while preserving the layout classes
  - header/footer text line blocks are stripped while retaining layout chrome and image-slot structure
  - extracted logo/image content is then injected inline as `data:image/...;base64,...`, eliminating residual `-logo-` in the final stored template when image data exists
- Updated `server/services/templateExtraction.service.js` to pass the full layout-analysis context into the extraction post-processor.
- Added regression coverage in `server/tests/services/templateExtraction.service.test.js` to lock:
  - class-preserving layout rebasing
  - inline base64 logo injection
  - removal of leaked detected text from the final layout-backed template
- Revalidated with:
  - `npx vitest run server/tests/services/templateExtraction.service.test.js server/tests/routes/templates.extraction.extractors.test.js server/tests/routes/templates.extraction.imagePlaceholders.test.js`
  - `node .\scripts\run-eslint.mjs server\services\templateExtractionFallback.service.js server\services\templateExtraction.service.js server\tests\services\templateExtraction.service.test.js`

## [2026-04-18] fix | preserve extracted template HTML/CSS fidelity in the admin template editor

- Investigated a remaining user-visible defect after backend extraction fixes:
  - extracted template fragments still appeared in the editor as `<p></p>` and `<p>-name-</p><p>-title-</p><p>-content-</p>`
  - this proved the backend output was no longer the only problem; the admin template-editing surface itself was flattening extracted HTML into paragraph-oriented rich text
- Confirmed the destructive step in `client/src/pages/NewTemplatePage.tsx`:
  - header/content/footer were edited through the shared Tiptap editor
  - that editor is optimized for prose content and reparses arbitrary HTML through a limited schema, dropping the original extracted `div` structure, classes, and layout-specific nodes
- Fixed the template editor so header/content/footer are now edited as raw HTML textareas rather than through Tiptap.
- Added a live preview frame to keep template-editing UX usable without sacrificing structural fidelity.
- Updated frontend sanitization to explicitly allow `data:image/...;base64,...` sources in previewed HTML so embedded extracted logos/images remain visible.
- Updated `client/src/pages/NewTemplatePage.test.tsx` to lock the new contract that extracted header/footer HTML is preserved when creating a template from extraction.
- Revalidated with:
  - `npx vitest run client/src/pages/NewTemplatePage.test.tsx`
  - `node .\scripts\run-eslint.mjs client\src\pages\NewTemplatePage.tsx client\src\pages\NewTemplatePage.test.tsx client\src\utils\sanitizer.frontend.ts`
  - `pnpm exec tsc --noEmit -p client/tsconfig.json`

## [2026-04-20] feat | route transactional app emails through a configurable provider with SMTP support

- Implemented a provider switch for real outbound app emails in `server/services/mail/gdprMailService.js`.
- Added `server/services/mail/smtpProvider.js` using `nodemailer`.
- Added `GDPR_MAIL_PROVIDER` support with modes `gmail`, `smtp`, and `auto`; `MAIL_DELIVERY_PROVIDER` is accepted as fallback.
- Wired existing application mail sends behind the provider facade so password reset, invite, forced password change, registration confirmation, email verification, and GDPR consent sends all reuse the same provider selection.
- Updated the GDPR settings route/UI contract so SMTP-managed mode reports provider capabilities and suppresses Gmail OAuth/disconnect actions while keeping test-send available.
- Added targeted backend tests for SMTP dispatch and provider-specific route errors.
- Revalidated with:
  - `node ./node_modules/vitest/vitest.mjs run server/tests/services/gdprMailService.test.js server/tests/routes/gdprMail.routes.test.js --config server/vitest.config.js`
  - `node ./node_modules/vitest/vitest.mjs run server/tests/services/passwordReset.service.test.js server/tests/services/registrationEmail.service.test.js server/tests/services/emailVerification.service.test.js --config server/vitest.config.js`
  - `npm run typecheck`
  - `node scripts/run-eslint.mjs client/src/components/SettingsPage/GdprTab.tsx server/services/mail/gdprMailService.js server/services/mail/smtpProvider.js server/routes/gdprMail.routes.js server/tests/services/gdprMailService.test.js server/tests/routes/gdprMail.routes.test.js --ext js,jsx,ts,tsx`

## [2026-04-21] memory | align vault with current default-admin password policy and email delivery model

- Updated `topics/Environment and Secret Matrix.md` to remove the stale claim that `DEFAULT_ADMIN_PASSWORD` is a production startup guard.
- Recorded that the default-admin bootstrap still allows the historical fallback/default password and that this is now a deployment responsibility rather than an enforced runtime invariant.
- Updated `topics/Security and Compliance.md` to reflect the current outbound email model:
  - app emails are routed through `server/services/mail/gdprMailService.js`
  - provider selection supports Gmail OAuth and SMTP
  - SMTP mode is server-managed configuration rather than an OAuth connection owned from the admin UI
