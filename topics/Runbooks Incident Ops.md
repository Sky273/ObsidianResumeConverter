# Runbooks Incident Ops

## Summary

This note captures the recurring operational incidents that are easy to re-diagnose from scratch. It is not a full SOP manual; it is a compact memory of symptoms, likely causes, and first checks.

## Turnstile Missing on Registration

### Symptom

- registration page loads without the Turnstile widget

### Likely causes

- public site key missing at frontend build time
- wrong env source used for Docker build
- browser using an old cached frontend bundle
- Cloudflare domain allowlist mismatch

### First checks

- confirm the Docker/frontend build used `/.env.docker`
- confirm the bundled frontend contains the expected site key
- confirm the site key exists in both public env aliases when needed
- confirm Cloudflare Turnstile allows the served domain

## CSRF Broken

### Symptom

- authenticated mutations return `403 Invalid CSRF token`
- login may still work while later actions fail

### Likely causes

- stale/corrupted `x-csrf-token` cookie
- missing `x-csrf-token` header on API mutations
- frontend failed to bootstrap `/api/csrf-token`
- origin/cookie behavior mismatch

### First checks

- verify `/api/csrf-token` returns correctly
- verify cookie `x-csrf-token` exists
- verify request header `x-csrf-token` is present on mutating API calls
- verify the app is served from an allowed origin

### Important detail

The backend deliberately clears the CSRF cookie on invalid-CSRF errors to allow clean regeneration.

## LLM Provider Auth Error

### Symptom

- AI improvement or other AI flows fail with a stable provider-configuration message

### Likely causes

- expired provider token
- incorrect provider secret
- provider key missing in server env

### First checks

- inspect active provider in settings
- verify corresponding server secret exists and is current
- use settings/provider test endpoints when available
- distinguish configuration failure from insufficient credits

## Insufficient AI Credits

### Symptom

- AI action redirects to insufficient-credits page
- batch job creation can fail early with `402 INSUFFICIENT_CREDITS`

### Likely causes

- firm balance depleted
- action cost increased in settings
- workflow now reserves budget upfront and exceeds available firm credits

### First checks

- inspect current firm credits
- inspect per-action credit settings
- confirm whether the workflow is synchronous or batch and therefore how much it reserves upfront

## PDF Server Unavailable

### Symptom

- PDF/document generation fails
- health or proxy errors around internal PDF generation

### Likely causes

- PDF server not running
- invalid `PDF_SERVER_INTERNAL_TOKEN`
- internal URL or trust-boundary mismatch
- PDF generation timeout/capacity exhaustion

### First checks

- check PDF server `/health`
- verify proxy-to-PDF token on both sides
- verify request size/capacity limits are not exceeded
- inspect generation timeout configuration

## Docker App Fails to Boot

### Symptom

- app container exits or never becomes healthy

### Likely causes

- required secrets in `/.env.docker` missing or placeholder-like
- invalid admin password policy
- invalid JWT/CSRF/PDF internal token secrets
- migration/bootstrap failure

### First checks

- inspect container logs for env-validation failure
- verify secrets in `/.env.docker`
- verify the app reports healthy after migrations complete

## Practical Reading

- distinguish `frontend build-time problem`, `backend secret problem`, and `runtime provider problem` early
- do not treat every AI failure as a provider outage; credits, settings, and CSRF also break AI UX
- in Docker incidents, start with `/.env.docker`, health endpoints, and container logs

## Related

- [[SECURITY]]
- [[topics/Turnstile]]
- [[topics/Session and Token Lifecycle]]
- [[topics/Provider Failure and Fallback Model]]
- [[topics/PDF and Document Generation Boundary]]
- [[topics/Docker Environment]]

## Sources

- [[raw/sources/2026-04-16-provider-failure-runbooks-authz]]
