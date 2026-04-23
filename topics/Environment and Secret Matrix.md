# Environment and Secret Matrix

## Summary

ResumeConverter has a mixed environment model:

- some variables are hard requirements at backend startup
- some only enable or disable integrations
- some are build-time concerns for the frontend bundle
- some are runtime concerns for backend/provider access

The important operational rule is that not all missing envs fail in the same way.

## Source of Truth by Runtime

- non-Docker local runtime uses `/.env`
- Docker build and runtime use `/.env.docker`
- `/.env.example` is the template/reference, not the live source of truth
- the Node runtime bootstrap now loads `/.env` first and then `/.env.docker` as a non-overriding fallback, so Docker-oriented env keys remain available even when the process was not started through the expected `env_file` injection path

This distinction matters because the frontend bundle can embed stale public env values if the image was not rebuilt.

## Hard Startup Requirements

The backend environment validation currently treats these as required:

- `JWT_SECRET`
- `POSTGRES_HOST`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `CSRF_SECRET`

Special case:

- `PDF_SERVER_INTERNAL_TOKEN` is effectively required in production
- outside production, its absence degrades internal PDF-generation routes rather than killing the whole app

## Recommended But Not Mandatory At Boot

The current validator treats several vars as recommended rather than strictly required:

- `REFRESH_TOKEN_SECRET`
- provider keys such as `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `HUGGINGFACE_API_KEY`, `DEEPSEEK_API_KEY`, `GLM_API_KEY`, `MINIMAX_API_KEY`
- `CACHE_BACKEND`
- `NODE_ENV`

Operational consequence:

- the app can boot without a given LLM provider key
- but any feature routed to that provider will fail or degrade later at runtime

## Build-Time Vs Runtime Variables

### Build-time frontend variables

The most important remembered example is Turnstile:

- `VITE_TURNSTILE_SITE_KEY`
- `CLOUDFLARE_TURNSTILE_SITE_KEY`

These are frontend public variables. In Docker, they must be present at build time or the widget will not be embedded into the final assets.

### Runtime backend variables

Examples:

- `TURNSTILE_SECRET_KEY`
- `CLOUDFLARE_TURNSTILE_SECRET_KEY`
- JWT / refresh / CSRF secrets
- provider API keys
- database credentials
- `PDF_SERVER_INTERNAL_TOKEN`

These are consumed by the backend process at runtime.

## Current Public Frontend Origin

Current remembered production-facing origin from the repository env files:

- `FRONTEND_URL=https://resumeconverter.net`
- Google auth and GDPR callback URIs also target `https://resumeconverter.net/...`

Operational note from live verification on 2026-04-21:

- `https://resumeconverter.net` serves the ResumeConverter SPA and authenticated workspace
- `https://resumeconverter.com` timed out on port `443` from the test environment
- `http://resumeconverter.com/` redirected to `https://resumepower.com/`, which is not the ResumeConverter application

Practical consequence:

- when validating the live app, treat `resumeconverter.net` as the current functional frontend origin unless deployment/docs are updated to say otherwise

## Secret Classes

ResumeConverter secrets fall into a few useful buckets:

### Identity and session

- `JWT_SECRET`
- `REFRESH_TOKEN_SECRET`
- `CSRF_SECRET`

These control token signing, rotation, and CSRF protection.

### Database and persistence

- `POSTGRES_HOST`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`

These determine whether the app can boot and persist data at all.

### Internal service boundary

- `PDF_SERVER_INTERNAL_TOKEN`

This protects the backend-to-PDF-server trust boundary.

### External anti-abuse

- `TURNSTILE_SECRET_KEY`
- `CLOUDFLARE_TURNSTILE_SECRET_KEY`

These control whether backend captcha verification can actually be enforced.

### AI/provider access

- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GEMINI_API_KEY`
- `HUGGINGFACE_API_KEY`
- `DEEPSEEK_API_KEY`
- `GLM_API_KEY`
- `MINIMAX_API_KEY`

These do not all need to exist simultaneously, but the configured runtime path must match what is actually available.

### Billing and mail

- Stripe secrets
- OAuth secrets
- `MAIL_TOKEN_ENCRYPTION_KEY`
- SMTP credentials and GDPR Gmail callback envs used as fallback defaults when the canonical mail settings record does not override them

These protect payment and mail-related flows.

## Placeholder and Weak-Secret Policy

Environment validation rejects or warns on obvious placeholders.

Important remembered rules:

- placeholder-like JWT/CSRF secrets fail validation
- placeholder-like provider secrets may not block startup but still represent broken operational config

The app therefore treats "example values left in env" as a real operational defect class.

## Cache-Related Env Notes

- `CACHE_BACKEND` supports `memory` or `redis`
- a wrong value produces warnings
- Redis selection changes the storage backend, not the core coherence model

This means cache envs influence performance and storage shape, but not the underlying PostgreSQL-driven invalidation truth.

## Failure Patterns Worth Remembering

### App fails to start

First suspects:

- missing/weak `JWT_SECRET`
- missing/weak `CSRF_SECRET`
- missing DB credentials

### Frontend widget missing but app boots

First suspect:

- missing or stale build-time public env, especially Turnstile site key

### App boots but AI features fail

First suspect:

- provider key mismatch between configured provider/model and available env keys

### PDF-related route fails while core app works

First suspect:

- missing or invalid `PDF_SERVER_INTERNAL_TOKEN`

## Practical Rule For Future Changes

When adding any integration or security-sensitive feature, document:

1. whether its env is build-time or runtime
2. whether missing config should fail boot or only disable the feature
3. whether placeholder values should be treated as fatal or warning-only
4. whether Docker needs an image rebuild or only a container restart

## Default Admin Password Behavior

Current remembered behavior:

- `DEFAULT_ADMIN_PASSWORD` is still used by the default-admin bootstrap script when the seed account must be created
- the app no longer blocks startup or bootstrap simply because `DEFAULT_ADMIN_PASSWORD` is unset, weak, or equal to the historical fallback `admin123`
- this means operational hardening of the default admin password is now a deployment responsibility rather than an enforced startup invariant

This is important when reasoning about local/dev bootstrap versus production safety assumptions.

## Mail Delivery Configuration Precedence

Current remembered behavior:

- application mail delivery is no longer env-only
- the admin GDPR tab can persist mail-delivery configuration into the canonical `llm_settings` row
- persisted fields currently include:
  - `mail_delivery_provider`
  - `smtp_host`
  - `smtp_port`
  - `smtp_secure`
  - `smtp_user`
  - encrypted `smtp_password`
  - sender name/email
  - GDPR Gmail callback URI
- when those persisted values are absent, runtime mail resolution falls back to the environment variables:
  - `GDPR_MAIL_PROVIDER` or `MAIL_DELIVERY_PROVIDER`
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`
  - `SMTP_FROM_NAME`, `SMTP_FROM_EMAIL`
  - `GOOGLE_GDPR_REDIRECT_URI`

Operational consequence:

- changing mail delivery through the GDPR tab generally requires no container restart because the runtime now reads the persisted control-plane values
- environment values still matter as bootstrap/defaults and for instances where no DB override has been saved yet

## Related

- [[topics/Docker Environment]]
- [[topics/Turnstile]]
- [[topics/LLM Control Plane]]
- [[topics/Security and Compliance]]

## Sources

- [[raw/sources/2026-04-16-env-session-batch-state]]
