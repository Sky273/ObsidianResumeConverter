# Source Note: domain model, control plane, and secondary product modules

## Purpose

Capture durable facts gathered from route and service inspection after the initial vault bootstrap, with a focus on business objects, workflow chains, settings governance, compliance, and secondary modules.

## Files inspected

- `server/routes/clients.routes.js`
- `server/routes/deals.routes.js`
- `server/routes/settings.routes.js`
- `server/routes/share.routes.js`
- `server/routes/pipeline.routes.js`
- `server/services/candidatePipeline.service.js`
- `server/routes/templates.routes.js`
- `server/services/templateExtraction.service.js`
- `server/routes/consent.routes.js`
- `server/routes/gdprAudit.routes.js`
- `server/routes/gdprMail.routes.js`
- `server/routes/twofa.routes.js`
- `server/routes/rome.routes.js`
- `server/routes/marketRadar/index.js`
- `server/routes/marketRadar/facts.routes.js`
- `server/routes/stripeWebhook.routes.js`
- `client/src/app/appRoutes.tsx`
- `docs/STRIPE_CONFIGURATION.md`

## Durable facts

- The product has a real business-object chain around `firm`, `user`, `resume`, `client`, `contact`, `deal`, `mission`, `adaptation`, and `candidate_pipeline`.
- Clients and deals are fully tenant-scoped and guarded by explicit access checks.
- Deals support many-to-many linkage with resumes and integrate with missions.
- Candidate pipeline is a structured subsystem with canonical stages and interview scheduling, not a lightweight tag/status add-on.
- Settings form a central AI control plane: provider, model, prompts, weights, credit costs, token ceilings, and provider-specific admin actions like Ollama discovery.
- Template handling is substantial: CRUD, extraction from DOCX/PDF, CSS/style preservation, PDF rendering, and controlled sharing.
- GDPR handling includes consent lifecycle, public response tokens, audit logs, global Gmail OAuth for consent email sending, and admin reporting.
- Security surface includes TOTP 2FA, Turnstile on registration, Stripe webhook integrity, and strict firm isolation.
- Market radar and ROME are real modules with ingestion, caching, and user-visible/admin-visible pages.

## Interpretation

- ResumeConverter should be documented as a multi-surface recruiting platform.
- The true architecture is centered on a tenant-scoped resume core plus operational control planes around AI, compliance, and delivery workflows.
- Secondary modules remain important but should stay modular to protect the core product nucleus.
