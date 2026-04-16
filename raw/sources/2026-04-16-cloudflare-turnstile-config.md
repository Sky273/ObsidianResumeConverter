# Source Note: Cloudflare and Turnstile configuration

## Purpose

Capture the durable Cloudflare Turnstile configuration model actually used by ResumeConverter, based on code inspection and recent operational fixes.

## Files inspected

- `client/src/components/Register.tsx`
- `server/services/registrationProtection.service.js`
- `docker/docker-build.ps1`
- `docker/docker-build.sh`
- `INSTALL.md`
- `INSTALL_PG.md`

## Durable facts

- Turnstile is only used on the registration form in the current product surface.
- The frontend reads the public site key from:
  - `CLOUDFLARE_TURNSTILE_SITE_KEY`
  - fallback `VITE_TURNSTILE_SITE_KEY`
- The backend verifies the captcha token with the secret key from:
  - `CLOUDFLARE_TURNSTILE_SECRET_KEY`
  - fallback `TURNSTILE_SECRET_KEY`
- Backend verification is performed against Cloudflare's official endpoint:
  - `https://challenges.cloudflare.com/turnstile/v0/siteverify`
- There is no webhook in the Turnstile flow. The model is frontend token issuance plus server-side verification.
- Docker build scripts explicitly pass the public site key as a build argument, because the Vite bundle must embed it at build time.
- Runtime-only container env is not sufficient for the Turnstile widget to render if the frontend was built without the right public key.
- If no Turnstile secret key is configured, backend registration protection does not require captcha verification.
- Registration protection also includes:
  - honeypot field
  - minimum form fill time
  - suspicious user-agent filtering
  - disposable email-domain filtering
- Cloudflare dashboard configuration should include the public domains actually used by the app, such as production domain and local/dev domains where needed.

## Practical configuration model

- Cloudflare side:
  - create a Turnstile widget
  - obtain `site key` and `secret key`
  - authorize the real application domains
- ResumeConverter side:
  - set frontend public key env
  - set backend secret key env
  - rebuild Docker image if the public key changes
  - restart the stack

## Common failure patterns

- Correct key in container env but no captcha widget:
  - likely stale frontend bundle built with an old or empty site key
- Captcha widget visible but registration fails:
  - likely bad backend secret, bad domain allowlist, or Cloudflare verification failure
- App boots but registration silently has no captcha:
  - likely no secret key configured, so backend protection does not enforce captcha

## Interpretation

- Turnstile configuration is partly Cloudflare dashboard work and partly application build/runtime configuration.
- For ResumeConverter, the highest-risk misunderstanding is forgetting that the public key is a build-time concern in Docker.
