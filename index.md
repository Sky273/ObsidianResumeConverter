# Index

## Core

- [[Bienvenue]]: vault home page and entry points.
- [[overview]]: high-level product, architecture, and priorities.
- [[SECURITY]]: consolidated security reference for auth, tenant isolation, public tokens, providers, and operations.
- [[log]]: chronological maintenance log.

## Entities

- [[entities/ResumeConverter]]: product identity, scope, and major surfaces.

## Topics

- [[topics/Architecture]]: backend, frontend, PDF server, and key runtime layers.
- [[topics/Application Surface]]: major routes and product surfaces exposed in the app.
- [[topics/Business Objects and Data Relationships]]: tenant-scoped domain model and key entity links.
- [[topics/Core Resume Workflows]]: how resume ingestion, analysis, improvement, adaptation, export, and matching work.
- [[topics/Clients Deals Missions Pipeline]]: commercial and candidate-delivery chain around clients, deals, missions, and interviews.
- [[topics/Batch Jobs and Long-Running Workflows]]: asynchronous processing model for import, improve, adapt, match, and exports.
- [[topics/Batch Job State Machine]]: job/item statuses, worker claiming, cancellation, completion, and credit settlement semantics.
- [[topics/Auth and Access Model]]: authentication, roles, admin policy, and multi-firm isolation.
- [[topics/AuthZ Decision Map]]: practical role matrix across backend middleware, frontend guards, and firm-scoped checks.
- [[topics/Session and Token Lifecycle]]: sign-in, refresh rotation, cookie scopes, CSRF bootstrap, and logout behavior.
- [[topics/Email and Verification Flows]]: email verification, password reset, invite, and forced-password-change behavior.
- [[topics/Admin and Operations]]: admin workspace, settings, credits, backup, sharing, metrics, and operational surfaces.
- [[topics/Settings and Governance Surfaces]]: distinction between settings control plane and admin workspace governance.
- [[topics/Settings Catalog]]: canonical `llm_settings` record and the runtime effect of provider, prompt, weight, and credit settings.
- [[topics/Settings Field Reference]]: high-signal settings fields and the behaviors they influence.
- [[topics/Environment and Secret Matrix]]: required vs recommended envs, build-time vs runtime config, and secret classes.
- [[topics/Upload OCR and Parsing Pipeline]]: upload staging, native extraction, OCR fallback, cleanup, and extraction metrics.
- [[topics/File Storage and Retention Map]]: where uploads, shares, staging, OCR temp files, and exports live, and which TTL/cleanup rules apply.
- [[topics/Operational Limits Matrix]]: consolidated memory of size, rate, timeout, concurrency, and retention limits.
- [[topics/Backup and Disaster Recovery]]: backup configuration, scheduling, restore, and recovery behavior.
- [[topics/Maintenance and Cleanup Jobs]]: scheduler-driven compliance/account hygiene plus temp-file, share, batch, and backup cleanup behavior.
- [[topics/Metrics and Diagnostics]]: operational dashboard and diagnostics surface across AI, OCR, cache, DB, and traffic.
- [[topics/Application Cache Model]]: scoped, versioned cache architecture with PostgreSQL invalidation and memory/Redis storage backends.
- [[topics/Matching and Scoring Model]]: distinction between resume-quality scoring, local pre-ranking, and LLM mission-fit analysis.
- [[topics/Resume Domain Model]]: how the base resume record accumulates analysis, versions, adaptations, comments, submissions, and consent state.
- [[topics/Data Persistence Map]]: which table families hold durable product truth versus temporary or derived artifacts.
- [[topics/Stripe Billing and Firm Credit Purchase]]: Stripe checkout, webhook fulfillment, and firm-credit top-up model.
- [[topics/LLM Control Plane]]: provider/model governance, prompts, credits, tokens, and timeout policy.
- [[topics/LLM Call Resolution and Runtime Selection]]: how configured provider/model settings resolve into real runtime LLM calls.
- [[topics/Provider Failure and Fallback Model]]: non-retryable provider auth failures, structured-output retries, and fallback semantics.
- [[topics/Resume Presentation and Templates]]: template CRUD, extraction, export, rendering, and sharing.
- [[topics/Template Extraction Pipeline]]: normalized Office/PDF template extraction flow, sanitization, layout splitting, and fallback behavior.
- [[topics/PDF and Document Generation Boundary]]: internal PDF-server trust boundary, proxying rules, payload guards, and rendering limits.
- [[topics/Public Token Flows]]: narrow tokenized public routes for consent and share access.
- [[topics/Header Size Budget]]: architectural rule to keep request headers comfortably under 4 KB.
- [[topics/Market Intelligence and Reference Data]]: market radar, facts, trends, and ROME metier data.
- [[topics/Security and Compliance]]: firm isolation, 2FA, Turnstile, GDPR, sharing, and billing integrity.
- [[topics/Runbooks Incident Ops]]: compact incident memory for Turnstile, CSRF, provider auth, credits, PDF server, and Docker boot failures.
- [[topics/Operational Dashboards Map]]: where to look first across health, metrics, security logs, GDPR audit, backup, and cache views.
- [[topics/API Surface by Domain]]: orientation map for the main backend route families.
- [[topics/Integrations]]: external providers and platform integrations used by the app.
- [[topics/Observability and Quality]]: tests, CI, audits, metrics, and validation strategy.
- [[topics/Codex Agent Tooling]]: local Codex skills and agent-side workflow tooling recorded for this project workspace.
- [[topics/Application Release History]]: durable memory of application-level release milestones and current version.
- [[topics/Priority Review 2026-04-16]]: current top-priority review areas across operational safety, security boundaries, tooling, and maintainability.
- [[topics/Priority Review 2026-04-17]]: refreshed whole-app priority review centered on backend decoupling, long-running workflow hardening, and scope discipline.
- [[topics/Product Scope and Priorities]]: nucleus vs secondary scope and roadmap guidance.
- [[topics/Docker Environment]]: Docker env source of truth and runtime/build behavior.
- [[topics/Turnstile]]: Cloudflare Turnstile configuration and Docker build implications.
- [[topics/AI Credits]]: upfront AI credit reservation model and insufficient-credit UX.
- [[topics/AI Operation Matrix]]: route-to-actionType-to-operationType map with configurable cost and token budgets.
- [[topics/AI Timeouts]]: standardized 15-minute IA timeout policy.

## Raw Sources

- [[raw/README]]: raw layer rules.
- [[raw/session-notes/2026-04-16-memory-bootstrap]]: bootstrap source note from codebase work and recent fixes.
- [[raw/sources/2026-04-16-karpathy-llm-wiki]]: source note for the LLM Wiki pattern used by this vault.
- [[raw/sources/2026-04-16-codebase-structure]]: source note for current codebase architecture and route surface.
- [[raw/sources/2026-04-16-product-scope-priorities]]: source note for product scope guidance.
- [[raw/sources/2026-04-16-karpathy-codex-skill-install]]: source note for the locally installed Codex adaptation of Karpathy coding guidelines.
- [[raw/sources/2026-04-16-release-v1.9.1]]: source note for the `v1.9.1` application release bump and changelog update.
- [[raw/sources/2026-04-16-functional-workflows]]: source note for core workflows, admin flows, and integrations.
- [[raw/sources/2026-04-16-backend-audit-and-quality]]: source note for access-control posture, validation, CI, and quality guidance.
- [[raw/sources/2026-04-16-domain-model-and-control-plane]]: source note for business objects, control plane, compliance, and secondary modules.
- [[raw/sources/2026-04-16-installation-and-bootstrap-docs]]: source note for README, install guides, bootstrap, OCR, migrations, and PRA.
- [[raw/sources/2026-04-16-cloudflare-turnstile-config]]: source note for Cloudflare Turnstile keys, verification, domains, and Docker build behavior.
- [[raw/sources/2026-04-16-stripe-billing]]: source note for Stripe checkout, webhook verification, purchase state, and credit fulfillment.
- [[raw/sources/2026-04-16-llm-call-resolution]]: source note for provider/model resolution, availability fallback, gateway dispatch, and parameter merging.
- [[raw/sources/2026-04-16-cache-architecture]]: source note for scoped cache versioning, invalidation notifications, and memory/Redis backend behavior.
- [[raw/sources/2026-04-16-security-layers]]: source note for CSP, CORS, CSRF, registration protections, auth, authorization, rate limits, and validation layers.
- [[raw/sources/2026-04-16-env-session-batch-state]]: source note for required envs, auth cookie/token lifecycle, and batch job/item state semantics.
- [[raw/sources/2026-04-16-public-token-and-pdf-boundaries]]: source note for public token routes, PDF-server trust boundary, and header-size budget guidance.
- [[raw/sources/2026-04-16-upload-limits-and-email-flows]]: source note for document ingestion/OCR behavior, operational limits, and account email flows.
- [[raw/sources/2026-04-16-settings-maintenance-persistence]]: source note for canonical settings, recurring maintenance jobs, cleanup behavior, and persistence families.
- [[raw/sources/2026-04-16-provider-failure-runbooks-authz]]: source note for provider failure classification, recurring incident patterns, and role/authorization structure.
- [[raw/sources/2026-04-16-settings-scoring-and-api-surface]]: source note for high-signal settings fields, scoring layers, and API domain grouping.
- [[raw/sources/2026-04-16-storage-dashboards-and-resume-model]]: source note for file retention, operational views, and the layered resume object model.
