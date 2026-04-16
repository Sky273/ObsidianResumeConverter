# 2026-04-16 Memory Bootstrap

## Source Type

Bootstrap source note built from direct codebase inspection, local Docker work, and recent implementation/fix sessions on ResumeConverter.

## Durable Facts Captured

- Docker source of truth is `/.env.docker`, not `/.env`, for both image build helpers and runtime stack.
- Turnstile can appear broken if the frontend bundle was built with an old site key, even when the running container has the correct env vars.
- The proper Docker fix for Turnstile is to rebuild the image after changing `VITE_TURNSTILE_SITE_KEY` or `CLOUDFLARE_TURNSTILE_SITE_KEY`.
- Insufficient AI credits are handled through dedicated backend codes and a frontend redirect page.
- Upload and other AI workflows moved toward upfront credit reservation instead of late availability checks.
- AI provider failures such as expired or invalid upstream tokens were normalized into cleaner product-facing errors.
- AI timeout handling was standardized to a 15-minute baseline across the main IA server stack, with aligned frontend timeouts on key user-facing IA flows.

## Important Code Anchors

- Docker build helpers:
  - `C:\Users\mail\CascadeProjects\ResumeConverter\docker\docker-build.ps1`
  - `C:\Users\mail\CascadeProjects\ResumeConverter\docker\docker-build.sh`
  - `C:\Users\mail\CascadeProjects\ResumeConverter\docker-run.bat`
  - `C:\Users\mail\CascadeProjects\ResumeConverter\docker-compose.redis.yml`
- Docker docs:
  - `C:\Users\mail\CascadeProjects\ResumeConverter\docker\README.md`
- AI timeout standardization:
  - `C:\Users\mail\CascadeProjects\ResumeConverter\server\config\constants.js`
  - `C:\Users\mail\CascadeProjects\ResumeConverter\server\services\llmGateway.service.js`
  - `C:\Users\mail\CascadeProjects\ResumeConverter\server\services\llmProvider.service.js`
  - `C:\Users\mail\CascadeProjects\ResumeConverter\client\src\constants\llmTimeouts.ts`

## Related

- [[overview]]
- [[topics/Docker Environment]]
- [[topics/Turnstile]]
- [[topics/AI Credits]]
- [[topics/AI Timeouts]]
