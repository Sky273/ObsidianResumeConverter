# Security and Compliance

## Summary

Security and compliance are built into the application architecture, not bolted on. The strongest recurring invariant is firm isolation, followed by admin-gated operational controls and GDPR-focused candidate handling.

## Authentication and Access

- Authentication is split into sign-in, user management, Google auth, and password reset.
- Roles drive access to protected routes, admin workspace, settings, metrics, backup, and GDPR audit.
- The backend audit documents tenant isolation and admin policy as primary invariants.

## Two-Factor Authentication

- The app supports TOTP-based 2FA.
- Supported flows include:
  - status
  - setup with QR code
  - verification and enablement
  - disablement
  - backup code regeneration

## Turnstile and Registration Protection

- Cloudflare Turnstile is used on registration.
- The public site key must be present at frontend build time, especially in Docker.
- The secret key is verified server-side through Cloudflare's siteverify flow.
- Registration protection also includes honeypot, minimum form-fill time, suspicious-user-agent filtering, and disposable-email blocking.
- Cloudflare widget configuration must authorize the real domains where registration is served.

### Registration defense in depth

- The registration form includes a hidden `website` field used as a honeypot.
- The frontend submits a `formRenderedAt` timestamp so the backend can reject implausibly fast submissions.
- Turnstile is optional at render time but, when the backend secret exists, captcha verification becomes part of the enforced registration policy.
- The backend combines these checks with suspicious-user-agent filtering and disposable-email-domain blocking.
- This means the registration surface should be understood as an anti-abuse stack, not a single captcha integration.

## Firm Isolation

- Most business routes perform explicit firm ownership checks.
- Cross-entity workflows validate that resumes, missions, clients, deals, and adaptations belong to the same tenant.
- Admin can cross these boundaries; non-admin users cannot.

## GDPR Features

- Resume-linked consent can be initialized, sent by email, resent, checked, and answered through public tokenized routes.
- Public consent response handles accepted, refused, expired, invalid, and already-processed tokens.
- GDPR audit exposes admin-only logs, stats, action/category catalogs, firm lists, and target-email export.
- GDPR and other application outbound emails now go through a provider-selected delivery facade in `server/services/mail/gdprMailService.js`.
- The active provider can resolve to Gmail OAuth or SMTP, with `GDPR_MAIL_PROVIDER` supporting `gmail`, `smtp`, and `auto`.
- In SMTP mode, delivery is server-managed configuration rather than an admin-driven OAuth connection.
- DPO and GDPR-related settings exist in the settings surface.

## Sharing and Data Exposure

- Public resume sharing is token-based for PDFs and original files.
- Share generation itself remains authenticated and ownership-checked.
- Revocation endpoints exist, which is important for controlled exposure.

## Billing Security

- Stripe credit purchases are credited only after webhook confirmation.
- Browser redirects do not grant credits.
- Webhook verification is part of the security model for billing integrity.
- Purchase persistence and idempotent fulfillment are part of the billing-control model.

## Operational Security Shape

- The proxy server includes helmet/cors/csrf, request IDs, metrics, rate limits, and environment validation.
- The PDF server is isolated behind an internal auth token and trusted-internal-URL checks.
- Backup, metrics, and GDPR audit are admin-only operational surfaces.
- Default-admin bootstrap still supports the historical `DEFAULT_ADMIN_PASSWORD` fallback and is no longer protected by a startup guard that rejects default/weak values.

## Concrete HTTP and Session Protections

- Authenticated requests use an `accessToken` httpOnly cookie rather than a frontend-managed bearer token.
- The backend emits token-expiry headers so the SPA can react before access tokens become stale.
- CSRF uses a dedicated `/api/csrf-token` endpoint plus a double-submit cookie/header pattern.
- Invalid CSRF state explicitly clears the CSRF cookie and returns `403`, which matters for debugging broken sessions.
- CORS is intentionally scoped to `/api` and uses an explicit origin allowlist.
- CSP is deny-by-default and explicitly opens only the sources needed by the app and integrations such as Turnstile.

## Concrete Defensive Layers

The application uses defense in depth across:

- browser policy layer (CSP, HSTS, clickjacking protections)
- cross-origin and cookie layer (CORS + httpOnly cookie model)
- CSRF layer
- registration anti-abuse layer
- authentication layer
- authorization and tenant-isolation layer
- rate-limit layer
- validation/input-hardening layer
- business-integrity controls such as Stripe webhook fulfillment and AI credit reservation

This is why security analysis should not focus on one middleware only.

## Related

- [[topics/Auth and Access Model]]
- [[topics/AuthZ Decision Map]]
- [[topics/Public Token Flows]]
- [[topics/Turnstile]]
- [[topics/Docker Environment]]
- [[topics/AI Credits]]
- [[topics/Admin and Operations]]
- [[topics/Runbooks Incident Ops]]
- [[topics/Observability and Quality]]

## Sources

- [[raw/session-notes/2026-04-16-memory-bootstrap]]
- [[raw/sources/2026-04-16-backend-audit-and-quality]]
- [[raw/sources/2026-04-16-domain-model-and-control-plane]]
- [[raw/sources/2026-04-16-cloudflare-turnstile-config]]
- [[raw/sources/2026-04-16-stripe-billing]]
- [[raw/sources/2026-04-16-security-layers]]
- [[raw/sources/2026-04-16-provider-failure-runbooks-authz]]
