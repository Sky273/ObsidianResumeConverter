# Source Note: concrete security layers in the application

## Purpose

Capture the actual layered security mechanisms implemented across frontend and backend, beyond the higher-level security summary.

## Files inspected

- `server/config/security.js`
- `server/middleware/auth.middleware.js`
- `server/middleware/rateLimit.middleware.js`
- `server/utils/validation.js`
- `client/src/components/Register.tsx`
- `server/services/registrationProtection.service.js`

## Durable facts

- Security is implemented as layered controls rather than one single gate.
- CSP is strict by default and explicitly enumerates allowed sources for:
  - scripts
  - styles
  - fonts
  - images
  - connect targets
  - workers
  - frames
- CSP explicitly includes Turnstile, MapLibre, and Swagger-related exceptions instead of broad unsafe allowances.
- CORS is applied only to `/api` routes, with:
  - explicit origin allowlist
  - credential support
  - same-origin/no-Origin allowance
  - normalized origin comparison
- CSRF uses double-submit cookie protection with:
  - dedicated token endpoint
  - `x-csrf-token` cookie
  - request header token
  - session identifier binding
  - path/method exemptions for selected auth/public flows
  - explicit invalid-token handler that clears corrupted CSRF cookies
- Current CSRF-exempt paths/prefixes include:
  - `/api/auth/signin`
  - `/api/auth/refresh`
  - `/api/auth/logout`
  - `/api/auth/register`
  - `/api/consent/respond/*`
  - `/api/gdpr/mail/callback`
- Registration has multiple independent defenses:
  - frontend honeypot field (`website`)
  - frontend form render timestamp
  - optional Turnstile widget
  - backend honeypot rejection
  - backend minimum fill-time check
  - backend suspicious user-agent filtering
  - backend disposable-email filtering
  - backend captcha verification with timeout
- Frontend registration behavior also matters:
  - Turnstile is rendered only if a site key is available
  - the hidden honeypot field is present in the DOM but visually hidden
  - the form submits `captchaToken` and `captchaProvider`
  - Turnstile is reset if registration fails
- The backend registration layer currently uses:
  - default minimum fill time of 4000 ms
  - captcha verification timeout of 5000 ms
  - a built-in disposable-email list plus env-configurable extra blocked domains
- Authentication middleware adds more than JWT verification:
  - cookie-only access token
  - blacklist/invalidity check through JWT verification service
  - user existence lookup
  - short-lived authenticated user cache
  - active/inactive status enforcement
  - token-expiry headers for frontend behavior
- Authenticated requests read the access token from the `accessToken` httpOnly cookie.
- Authorization is layered after authentication:
  - admin check
  - manager/local-admin check
  - firm access check
  - resource-scoped firm-access middleware
- Rate limiting is multi-layered:
  - global
  - auth
  - registration
  - per-user
  - combined IP+user
  - upload
  - LLM
- The current registration limiter is 50 requests per hour.
- User and combined rate limits use in-memory stores with cleanup/pruning to avoid unbounded growth.
- Validation is also a security layer:
  - Zod body validation
  - route param validation
  - query validation
  - request-body alias normalization
  - UUID checks on route params
- Internal-service boundaries matter too:
  - the PDF/document renderer is behind an internal token
  - trusted-internal-URL checks reduce misuse of the rendering service
- Security depends on both browser-facing measures and backend-enforced business constraints.

## Interpretation

- The right mental model is `defense in depth`.
- For ResumeConverter, registration, authentication, authorization, mutations, and public-token flows each have several overlapping controls rather than a single point of trust.
- The most security-sensitive areas are the ones where transport security, tenant isolation, anti-abuse, and business integrity overlap:
  - registration
  - authenticated mutations
  - public token flows
  - billing and credits
  - internal document generation
