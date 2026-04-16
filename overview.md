# Overview

## Summary

ResumeConverter is no longer just a CV conversion utility. It is a broader recruiting platform centered on resume ingestion, analysis, improvement, adaptation, matching, candidate pipeline, and surrounding admin and operational tooling.

## Current Product Shape

- Frontend: React and Vite SPA.
- Backend: Node.js and Express proxy server.
- Secondary service: dedicated PDF server.
- Infra in local Docker: app container plus Redis, with PostgreSQL inside the app container.
- Cross-cutting concerns already present:
  - AI provider routing
  - AI credits
  - AI settings and prompt governance
  - GDPR
  - email
  - payments
  - admin and metrics
  - template rendering and sharing
  - market/reference data

## Current Memory Priorities

1. Preserve infrastructure truths that are easy to forget.
2. Preserve cross-cutting AI behavior.
3. Preserve deployment-specific caveats.
4. Preserve product decisions that affect future changes.

## Known Important Areas

- Docker uses `/.env.docker` as source of truth for build and runtime.
- Turnstile public site key is injected at frontend build time, not just at container runtime.
- AI operations now rely on upfront credit reservation.
- User-facing insufficient-credit flows redirect to a dedicated page.
- AI operation timeout policy was standardized to 15 minutes on the server-side IA stack and aligned on key frontend IA flows.
- Bootstrap and schema evolution are expected to go through the explicit migration runner, not implicit startup side effects.
- OCR quality on scanned PDFs depends on the system-binary path; Docker bundles it, non-Docker installs must provide it.
- The tenant-scoped domain model around `firm`, `resume`, `client`, `deal`, `mission`, `adaptation`, and `pipeline` is a core architectural truth.
- Settings act as a real AI control plane, not only a preferences page.
- The canonical `llm_settings` row is part of the runtime control plane and can change provider, prompt, weight, and credit behavior without code changes.
- The settings surface contains a few especially high-leverage fields: provider/model, prompts, scoring weights, local matching weights, credit costs, max-token budgets, and onboarding/public-home flags.
- Provider failures are not monolithic: auth/configuration failures, malformed structured output, and transient upstream failures have different retry and messaging behavior.
- Template extraction/export/sharing and market/reference data are meaningful secondary product modules.
- Public tokenized flows exist for consent and sharing, and they follow a narrow capability model rather than broad anonymous access.
- Document generation crosses a dedicated internal PDF-server boundary with its own auth, payload guards, and capacity limits.
- Upload and parsing are a multi-step pipeline with temp staging, native extraction, OCR fallback, and cleanup.
- Uploaded and derived files are not all durable; many are managed artifacts with explicit retention and cleanup behavior.
- Account email flows are stateful control flows around verification, reset, invite, and forced password change.
- Session handling is cookie-oriented, with explicit refresh-token rotation and a separate CSRF bootstrap path.
- Authorization is role-based but also firm-scoped: `admin` is superadmin, `localAdmin` is manager, and many sensitive ops surfaces remain superadmin-only.
- Batch jobs are a persisted state machine with item-level statuses, worker claiming, and credit settlement.
- Cleanup and maintenance are split between scheduler-driven compliance/account jobs and separate file/artifact cleanup with explicit retention policies.
- Environment handling mixes fatal startup secrets, runtime-only integration secrets, and build-time frontend public config.
- PostgreSQL stores the durable truths; many files and exports are intentionally temporary artifacts under managed cleanup.
- Matching is layered: local pre-ranking, weighted resume scoring, and LLM mission-fit analysis are separate mechanisms.
- A resume is a compound object with analysis, versions, adaptations, comments, submissions, share state, and consent state.
- Because the app is cookie-authenticated and proxy-heavy, preserving a small request-header budget is an important reliability rule.
- Operational behavior is constrained by a real matrix of route, OCR, batch, and PDF-server limits rather than one global quota.

## Related

- [[entities/ResumeConverter]]
- [[SECURITY]]
- [[topics/Architecture]]
- [[topics/Core Resume Workflows]]
- [[topics/Business Objects and Data Relationships]]
- [[topics/Clients Deals Missions Pipeline]]
- [[topics/Batch Jobs and Long-Running Workflows]]
- [[topics/Batch Job State Machine]]
- [[topics/Auth and Access Model]]
- [[topics/AuthZ Decision Map]]
- [[topics/Session and Token Lifecycle]]
- [[topics/Email and Verification Flows]]
- [[topics/Admin and Operations]]
- [[topics/Settings Catalog]]
- [[topics/Settings Field Reference]]
- [[topics/Environment and Secret Matrix]]
- [[topics/Upload OCR and Parsing Pipeline]]
- [[topics/File Storage and Retention Map]]
- [[topics/Operational Limits Matrix]]
- [[topics/Settings and Governance Surfaces]]
- [[topics/Backup and Disaster Recovery]]
- [[topics/Maintenance and Cleanup Jobs]]
- [[topics/Metrics and Diagnostics]]
- [[topics/Application Cache Model]]
- [[topics/Matching and Scoring Model]]
- [[topics/Resume Domain Model]]
- [[topics/Data Persistence Map]]
- [[topics/Stripe Billing and Firm Credit Purchase]]
- [[topics/LLM Control Plane]]
- [[topics/LLM Call Resolution and Runtime Selection]]
- [[topics/Provider Failure and Fallback Model]]
- [[topics/Resume Presentation and Templates]]
- [[topics/PDF and Document Generation Boundary]]
- [[topics/Public Token Flows]]
- [[topics/Header Size Budget]]
- [[topics/Market Intelligence and Reference Data]]
- [[topics/Security and Compliance]]
- [[topics/Runbooks Incident Ops]]
- [[topics/Operational Dashboards Map]]
- [[topics/API Surface by Domain]]
- [[topics/Integrations]]
- [[topics/Observability and Quality]]
- [[topics/Product Scope and Priorities]]
- [[topics/Application Surface]]
- [[topics/Docker Environment]]
- [[topics/Turnstile]]
- [[topics/AI Credits]]
- [[topics/AI Timeouts]]
