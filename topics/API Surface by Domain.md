# API Surface by Domain

## Summary

The backend has many routes, but a small number of domains matter for orientation. This note maps the API by business or operational domain rather than by file.

## Platform and Session

- `/health`
- `/api/auth`
- `/api/2fa`

### Role

- health and diagnostics entry points
- sign-in, refresh, logout, registration, account/session lifecycle
- two-factor setup and verification

## Settings and Control Plane

- `/api/settings`
- `/api/llm`

### Role

- AI/provider/prompt/weight/credit control plane
- LLM admin/runtime support endpoints

## Resume Core

- `/api/resumes`
- `/api/templates`
- `/api/share`
- `/api/submissions`

### Role

- CV CRUD, upload, analysis, improvement, export-oriented behavior
- template management and extraction
- public share token generation and access
- submission workflows around resumes

## Mission and Adaptation

- `/api/missions`
- `/api/adaptations`
- `/api/pipeline`

### Role

- mission CRUD and ownership
- adaptation creation and mission-fit artifacts
- candidate progression and interview pipeline

## Commercial Domain

- `/api/clients`
- `/api/deals`

### Role

- client/company records
- contacts/opportunities and linkage to missions/resumes

## Async and Export Domain

- `/api/batch-jobs`
- `/api/batch-export`

### Role

- long-running workflow creation, tracking, cancellation, and result retrieval
- bulk export orchestration

## Admin and Tenant Governance

- `/api/admin`
- `/api/firms`
- `/api/users`
- `/api/tags`
- `/api/email-templates`

### Role

- platform diagnostics/admin tools
- tenant and firm governance
- user management
- controlled taxonomy
- communication-template governance

## Compliance and Communication

- `/api/consent`
- `/api/gdpr/mail`
- `/api/gdpr-audit`
- `/api/mail`
- `/api/calendar`

### Role

- GDPR consent flows and public responses
- GDPR mail integration and auditability
- outbound mail and calendar integrations

## Billing and Credits

- `/api/billing`

### Role

- Stripe checkout and firm-credit purchase flow when billing is enabled

## Observability and Operations

- `/api/metrics`
- `/api/backup`

### Role

- metrics and operational telemetry
- backup configuration, runs, and recovery-oriented operations

## Market and Reference Data

- `/api/market-radar`
- `/api/rome`

### Role

- market-intelligence collection/refresh
- metiers and reference data

## Chatbot

- `/api/chatbot`

### Role

- conversation-style AI assistance with credit enforcement and provider routing

## Why This Matters

- Most navigation questions can be answered from domain ownership instead of route-file names.
- Many incidents are easier to isolate once the failing path is mapped to the right domain family.
- The OpenAPI/Swagger implementation is now generated from `server/config/openapi.js` instead of the removed hand-written `server/config/swagger*.js` files.
- Swagger UI is served locally from the `swagger-ui-dist` package through `server/config/routeRegistry/swaggerRoutes.js`; it no longer depends on CDN-hosted Swagger UI assets.
- Reusable OpenAPI schemas are maintained separately in `server/config/openapiSchemas.js` and are wired into request bodies via `$ref` from `server/config/openapi.js`.
- The Swagger regression coverage now checks that the document exposes domain schemas and that request bodies such as sign-in, settings, clients, and batch jobs reference those schemas.

## Related

- [[topics/Application Surface]]
- [[topics/Core Resume Workflows]]
- [[topics/Admin and Operations]]
- [[topics/AuthZ Decision Map]]

## Sources

- [[raw/sources/2026-04-16-settings-scoring-and-api-surface]]
- `server/config/openapi.js`
- `server/config/openapiSchemas.js`
- `server/tests/config/openapi.test.js`
