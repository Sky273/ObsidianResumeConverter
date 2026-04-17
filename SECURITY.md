# Security

## Purpose

This document is the consolidated security reference for ResumeConverter inside the vault. It is not meant to replace the repository's own `SECURITY.md`; it extracts the durable truths that matter for design, debugging, operations, and future changes.

## Security Model Summary

ResumeConverter is a tenant-scoped recruiting platform. Its security model is built around these priorities:

1. strong firm isolation
2. authenticated access to business data
3. admin-gated operational surfaces
4. controlled public token flows
5. server-side mediation of external providers
6. auditable operational behavior

The most important invariant is that non-admin users must not cross firm boundaries, even when resources are linked indirectly through resumes, missions, deals, clients, adaptations, or pipeline entries.

## Trust Boundaries

### Browser to application backend

- The frontend is a React/Vite SPA.
- Sensitive operations go through the Express proxy backend.
- Authentication and authorization are enforced server-side, not by frontend route guards alone.

### Backend to PDF/document services

- PDF generation is delegated to a separate internal PDF server.
- The PDF server is not a generic public renderer; it is protected by internal authentication and trusted-internal-URL checks.

### Backend to external providers

- LLM providers, Cloudflare Turnstile, Stripe, Google OAuth, Gmail/GDPR mail, and market-data APIs are all mediated by backend services.
- Secrets remain server-side.
- Failure handling, retries, and sanitization are backend concerns.

### Public token surfaces

- Some flows are intentionally public:
  - GDPR consent response
  - shared PDF access
  - shared original-file access
- These are protected by purpose-specific tokens, expiration rules, and narrow scopes instead of account authentication.

## Authentication

### Primary auth shape

- Auth is split into:
  - sign-in
  - user-account routes
  - Google auth
  - password reset
- Protected frontend routes exist, but backend middleware is the real security boundary.

### Session and token behavior

Based on the repository security doc and the current codebase shape, ResumeConverter uses:

- JWT-based authentication
- separate access and refresh token handling
- httpOnly cookie-oriented session behavior
- CSRF protection on authenticated flows
- user-status checks on authenticated requests

Concrete authenticated-request behavior:

- the backend reads the access token from the `accessToken` httpOnly cookie
- token verification is not enough on its own; the backend also reloads the current user
- requests are rejected if the current user status is `inactive`
- the backend emits `X-Token-Expires-In` and, when near expiry, `X-Token-Expiring-Soon`
- a very short-lived authenticated-user cache reduces repeated lookups without becoming a durable trust source

Security consequence:

- a token that was valid moments ago is not treated as sufficient forever
- account disablement still takes effect because current user state is rechecked during authenticated traffic

### Role model

Observed role/access layers include:

- authenticated user
- manager-level or local-admin surfaces
- transverse admin or super-admin capability

Security consequence:

- access control is not binary `logged-in / not-logged-in`
- many routes also depend on firm membership and role

## Tenant Isolation

### Core invariant

Firm isolation is the dominant backend security concern in this application.

Non-admin users should only be able to access or mutate:

- resumes for their firm
- missions for their firm
- clients and contacts for their firm
- deals for their firm
- pipeline data for their firm
- templates and exports for their firm
- credit-linked operations for their firm

### Why it is difficult

The data model is linked. A single workflow may join:

- resume
- mission
- adaptation
- client
- deal
- pipeline entry

Security bugs often happen when one object is validated but a related object is not.

### Current posture

The backend audit explicitly reviewed and tightened:

- resume-linked resources
- deals
- clients/contacts
- missions
- pipeline/interviews
- consent
- share/export
- templates
- batch jobs
- firms
- admin surfaces

This means multi-firm isolation is not just a design goal; it has been treated as an audited defect class.

## Registration Protection

### Turnstile

ResumeConverter currently uses Cloudflare Turnstile on registration.

Expected keys:

- frontend public key:
  - `VITE_TURNSTILE_SITE_KEY`
  - `CLOUDFLARE_TURNSTILE_SITE_KEY`
- backend secret key:
  - `TURNSTILE_SECRET_KEY`
  - `CLOUDFLARE_TURNSTILE_SECRET_KEY`

Backend verification uses Cloudflare siteverify:

- `https://challenges.cloudflare.com/turnstile/v0/siteverify`

### Extra anti-abuse checks

Registration protection also includes:

- honeypot field
- minimum form fill time
- suspicious user-agent filtering
- disposable email-domain filtering

### Concrete registration anti-abuse stack

The registration flow is protected by several independent signals on both frontend and backend.

Frontend behavior:

- renders a hidden `website` field as a honeypot
- captures `formRenderedAt` when the form is first displayed
- renders Turnstile only when a site key is available
- submits `captchaToken` and `captchaProvider` with the registration payload
- resets the Turnstile widget if registration fails

Backend behavior:

- rejects requests where the honeypot `website` field is non-empty
- rejects suspicious user agents that look like bots/crawlers
- requires `formRenderedAt` metadata and rejects implausibly fast submissions
- uses a default minimum fill time of 4000 ms unless overridden by env
- blocks a built-in disposable-email list plus extra blocked domains from env
- requires captcha when a registration captcha secret is configured
- verifies captcha server-side with a short timeout

Security consequence:

- registration does not rely on captcha alone
- the frontend honeypot and timestamp are only useful because the backend interprets and enforces them
- bot resistance still exists if captcha is misconfigured or temporarily degraded

### Docker-specific security caveat

The Turnstile public key is a build-time concern in Docker because the frontend bundle must embed it. A runtime-only env change is not enough for the widget to appear if the image was built with the wrong key.

## Two-Factor Authentication

The app supports TOTP-based 2FA with flows for:

- status
- setup
- verify and enable
- disable
- backup code regeneration

This is an important account-hardening layer for privileged users, especially in an admin-heavy product.

## Authorization and Admin Policy

### Admin-by-default principle for transverse routes

The audit and route organization indicate a strong policy direction:

- global or transverse routes should be admin-only unless there is a clear reason not to be
- business routes should remain firm-scoped for non-admins

This matters for:

- metrics
- backup
- settings
- GDPR audit
- user management
- billing administration
- admin workspace tabs

### Frontend and backend alignment

Security depends on both:

- frontend route guards for UX separation
- backend middleware for real enforcement

Frontend restrictions without backend checks are not considered sufficient.

## Public Token Flows

### GDPR consent

Resume-linked consent flows allow:

- initialization
- email send/resend
- status lookup
- public response by token

Public consent response supports:

- accept
- refuse
- invalid token
- expired token
- already processed token

### Resume sharing

Public sharing supports:

- PDF by token
- original file by token

Generation and revocation remain authenticated and ownership-checked.

Security implication:

- public access is intentionally narrow and artifact-scoped
- token validation replaces account auth only for those bounded use cases

## Billing and Credit Integrity

### Stripe

Firm credits purchased via Stripe are granted only after webhook confirmation.

Implications:

- browser redirects do not grant credits
- webhook verification is a core financial integrity control
- purchases and credit transactions form part of the security-sensitive ledger surface

### AI credits

AI credit logic is also a security/control concern because it protects billable provider usage.

Recent hardening established:

- upfront reservation for long-running AI jobs
- workflow-level reservation for synchronous multi-step IA flows
- refund/settlement behavior on failure or partial completion

This reduces race conditions, abuse paths, and late-failing cost leakage.

## Provider Security

### LLM providers

LLM calls are server-mediated. Important security properties:

- provider keys stay server-side
- input validation and payload shaping happen before provider calls
- retries and circuit-breaker behavior are controlled centrally
- raw provider errors should be sanitized before reaching users

### Google and Gmail

OAuth flows exist for:

- Google authentication
- GDPR mail integration

The backend audit specifically called out OAuth/callback integrity, which means callback state handling is part of the security-critical surface.

### PDF/document pipeline

PDF rendering and document conversion are isolated into a dedicated service and protected by internal tokens and network guards. This reduces direct exposure of document-rendering internals to public callers.

## Secrets and Environment Validation

### Security-critical envs

Examples include:

- JWT secret
- refresh token secret
- CSRF secret
- Turnstile secret
- PDF server internal token
- mail token encryption key
- Stripe secrets
- provider API keys

### Current operational rule

ResumeConverter relies on strict environment validation. Placeholder or weak values can prevent startup. In Docker, `.env.docker` is the operational source of truth.

### Migration/bootstrap interaction

Security assumptions should not rely on hidden startup side effects. The project now expects explicit migration/bootstrap via the migration runner, which reduces accidental drift and unclear startup behavior.

## API and Middleware Security Shape

The proxy server includes a standard defensive layer with:

- helmet
- cors
- csrf
- rate limiting
- request IDs
- environment validation
- metrics and security logging hooks

This is complemented by:

- route validation
- pagination and numeric-parameter hardening
- error sanitization
- admin-only deep diagnostics for certain health/provider checks

### Browser and HTTP boundary details

The browser-facing security layer is intentionally restrictive:

- Helmet is enabled with CSP, HSTS, and restrictive document-policy defaults
- CSP defaults to `default-src 'none'`
- `object-src 'none'`, `base-uri 'self'`, and `frame-ancestors 'self'` reduce plugin injection and clickjacking exposure
- Turnstile is explicitly allowlisted in script and frame directives instead of opening broad wildcards
- CORS is applied only to `/api`, with an explicit origin allowlist and credential support

Security consequence:

- the application follows a deny-by-default posture in the browser, then opens only the dependencies it needs
- cross-origin authenticated traffic is not left to permissive default middleware behavior

## Concrete Security Layers

The application should be understood as a stack of overlapping controls.

### 1. Browser and document-policy layer

- strict CSP through Helmet
- explicit source allowlists for scripts, styles, fonts, images, connect targets, workers, and frames
- clickjacking protection through `frame-ancestors`
- plugin blocking through `object-src 'none'`
- HSTS in production

This layer tries to reduce what the browser is allowed to execute or load.

### 2. Cross-origin and cookie/session layer

- CORS restricted to `/api`
- explicit allowed-origin list
- credentialed requests enabled
- httpOnly cookies for authenticated session tokens
- same-origin/no-Origin allowance where appropriate

This layer controls how browsers may send authenticated requests to the backend.

### 3. CSRF layer

CSRF protection is not implied by cookies alone. The app uses a double-submit model with:

- dedicated `/api/csrf-token` endpoint
- CSRF cookie
- `x-csrf-token` request header
- session/user identifier binding
- explicit invalid-token handling with cookie reset

Important nuance:

- safe methods are exempt
- selected auth/public paths are exempt where first-load usability would otherwise break

### CSRF implementation details

The current CSRF shape matters for both design and debugging:

- the CSRF cookie name is `x-csrf-token`
- the frontend must fetch `/api/csrf-token` before protected state-changing calls
- the backend compares the cookie and the `x-csrf-token` header through the double-submit middleware
- invalid CSRF state clears the CSRF cookie and returns `403`

Current CSRF exemptions include:

- `/api/auth/signin`
- `/api/auth/refresh`
- `/api/auth/logout`
- `/api/auth/register`
- `/api/consent/respond/*`
- `/api/gdpr/mail/callback`

Security consequence:

- cookie auth remains usable for first-load auth flows and public callbacks without disabling CSRF globally
- CSRF debugging should always inspect both cookie issuance and header propagation

### 4. Registration anti-abuse layer

Registration is protected by several overlapping mechanisms:

- frontend hidden honeypot field
- frontend form-render timestamp
- optional Turnstile widget
- backend honeypot rejection
- backend minimum form-fill-time check
- suspicious user-agent filtering
- disposable-email blocking
- captcha verification with network timeout
- registration-specific rate limit

This means registration does not rely only on captcha.

### Why the honeypot matters

The honeypot is not cosmetic:

- the field is present in the DOM
- it uses a plausible business name, `website`
- it is visually hidden and removed from normal keyboard flow
- automated form fillers frequently populate it anyway

That makes it a cheap server-verifiable anti-bot signal that complements captcha rather than replacing it.

### 5. Authentication layer

Authenticated requests are protected by:

- cookie token presence check
- JWT verification
- user lookup
- active/inactive account enforcement
- token-expiration signaling
- short-lived authenticated-user caching

The important point is that a syntactically valid token is not enough; current user state is still checked.

### 6. Authorization layer

After authentication, access is constrained by:

- role checks
- manager/local-admin checks
- firm-scoped access rules
- resource-level firm ownership verification

This is where ResumeConverter enforces its most important invariant: tenant isolation.

### 7. Rate-limit and abuse-control layer

The app applies multiple rate limits, including:

- global
- auth
- registration
- per-user
- combined IP + user
- upload
- LLM

This means abuse control is tuned per risk surface, not only globally.

### Concrete rate-limit shape

The current implementation distinguishes several abuse patterns:

- a global limiter for general API pressure
- an auth limiter for brute-force-oriented auth traffic
- a registration limiter of 50 requests per hour
- a per-user limiter backed by a dedicated in-memory store
- a combined IP + user limiter to make bypass harder through proxies, VPNs, or account rotation
- an upload limiter for file-heavy routes
- an LLM limiter for provider-cost-heavy routes

The user-scoped limiter also raises limits for more privileged/admin-equivalent users, which is operationally useful but worth remembering when evaluating abuse posture.

### 8. Validation and input-hardening layer

The app also treats validation as a security mechanism through:

- Zod request-body validation
- parameter validation
- query validation
- UUID checks on resource identifiers
- request-body alias normalization

This reduces malformed-input drift and blocks many accidental or hostile invalid states before business logic runs.

### Validation specifics worth remembering

The validation layer is not just schema hygiene:

- body validation is centralized with Zod
- path params and query params are validated separately
- alias normalization reduces drift from inconsistent client payloads
- route params named `id` or ending in `Id` are treated as UUID-sensitive inputs

Security consequence:

- invalid cross-entity references are often rejected before business services run
- validation changes can have direct security impact, especially on tenant-linked identifiers

### 9. Business-logic integrity layer

Certain layers are security-sensitive even if they look like business logic:

- webhook-only Stripe fulfillment
- upfront AI credit reservation
- public-token sharing with revocation
- consent token validation
- backup outbound-host restrictions

These are part of the effective security model because they protect money, provider spend, personal data, and public exposure.

### 10. Internal service boundary

The application also has an internal-service protection layer:

- PDF/document rendering is delegated to a dedicated PDF server
- calls to that renderer are protected with an internal token
- trusted-internal-URL rules reduce SSRF-style misuse of the rendering surface

Security consequence:

- document rendering should be treated as a privileged internal capability, not a generic public utility

## Rate Limiting and Abuse Control

The repository security documentation describes multi-layer rate limiting, including auth-related and provider-cost-related limits. The important durable takeaway is:

- abuse control is layered, not singular
- authentication endpoints and expensive routes receive special protection
- rate limiting is part of the security posture, not just traffic shaping

## Logging, Audit, and Observability

### Security-relevant logging

The platform includes security logging and admin-visible operational diagnostics.

Relevant surfaces include:

- security logs
- metrics
- GDPR audit
- backup/admin history
- worker/job status

### Why it matters

In a platform like ResumeConverter, many incidents are operational-security incidents rather than classic exploit chains:

- cross-firm access bug
- provider credential failure
- token leakage through a share flow
- billing/webhook inconsistency
- admin surface overexposure

Observability is therefore part of security, not separate from it.

## Compliance and Privacy

ResumeConverter includes explicit GDPR-oriented features:

- consent lifecycle for resumes
- consent email delivery
- GDPR audit logs
- DPO-related settings
- controlled public consent responses

This means personal-data handling is part of the product model, not an afterthought.

## Known Risk Themes

Even after hardening, the main risk families remain:

1. cross-firm reference injection through linked business objects
2. admin/global routes drifting away from admin-only policy
3. provider misconfiguration causing degraded or misleading runtime behavior
4. stale Docker builds causing incorrect public security config on the frontend
5. weak operational secret management outside code
6. inconsistencies between frontend assumptions and backend authorization rules

## Practical Security Checklist For Future Changes

When changing ResumeConverter, verify:

1. does the route require firm ownership enforcement?
2. does it expose transverse/admin data?
3. does it accept UUIDs or references to related entities from other tables?
4. can it leak raw provider, infrastructure, or SQL errors?
5. does it create or consume public tokens?
6. does it spend AI credits or depend on billing integrity?
7. does it depend on Docker build-time env rather than runtime env?
8. does it need audit visibility or admin diagnostics?

## Related

- [[topics/Security and Compliance]]
- [[topics/Auth and Access Model]]
- [[topics/Turnstile]]
- [[topics/Docker Environment]]
- [[topics/AI Credits]]
- [[topics/Observability and Quality]]

## Sources

- [[raw/sources/2026-04-16-backend-audit-and-quality]]
- [[raw/sources/2026-04-16-domain-model-and-control-plane]]
- [[raw/sources/2026-04-16-cloudflare-turnstile-config]]
- [[raw/sources/2026-04-16-security-layers]]
- [[raw/sources/2026-04-17-security-and-user-docs]]
