# Turnstile

## Summary

Turnstile uses a public site key on the frontend and a secret key on the backend. In Docker, the public key must be present at frontend build time.

## Current State

Expected variables:

- frontend public key:
  - `VITE_TURNSTILE_SITE_KEY`
  - `CLOUDFLARE_TURNSTILE_SITE_KEY`
- backend secret key:
  - `TURNSTILE_SECRET_KEY`
  - `CLOUDFLARE_TURNSTILE_SECRET_KEY`

Current product behavior:

- Turnstile is used on the registration form.
- The frontend widget is rendered in `Register.tsx`.
- The backend verifies the token through `registrationProtection.service.js`.
- If no backend secret key is configured, captcha enforcement is effectively disabled.

## Cloudflare Configuration Model

On the Cloudflare side, ResumeConverter expects:

- one Turnstile widget
- a `site key`
- a `secret key`
- the real application domains authorized in the widget configuration

Typical domain set should include:

- production domain
- local/dev domains when registration is tested outside production

There is no webhook in the Turnstile flow. The model is:

1. Cloudflare issues a client token in the browser
2. the frontend submits the token during registration
3. the backend calls Cloudflare siteverify

## Important Facts

- Runtime env alone is not enough for the widget to render.
- If the container has the right key but the built asset still embeds an old key, the captcha still fails to appear.
- Backend verification uses `https://challenges.cloudflare.com/turnstile/v0/siteverify`.
- Docker build scripts explicitly inject the public key as a build argument.
- The registration protection layer also applies honeypot, timing, suspicious-user-agent, and disposable-email checks.
- The reliable fix is:
  - update `/.env.docker`
  - rebuild the image
  - restart the stack
  - hard refresh the browser

## Failure Pattern

Typical symptom:

- Turnstile is correctly configured in env
- app starts correctly
- captcha still does not appear on `/register`

Likely cause:

- stale frontend bundle built with an older site key

Other common causes:

- wrong backend secret key
- missing domain allowlist in Cloudflare
- Cloudflare verification failure or timeout
- secret key absent, which disables captcha enforcement even if a widget can render

## Related

- [[topics/Docker Environment]]
- [[topics/Security and Compliance]]
- [[entities/ResumeConverter]]

## Sources

- [[raw/session-notes/2026-04-16-memory-bootstrap]]
- [[raw/sources/2026-04-16-cloudflare-turnstile-config]]
- [[raw/sources/2026-04-16-security-layers]]
