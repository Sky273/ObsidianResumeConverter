# Docker Environment

## Summary

For ResumeConverter, Docker uses `/.env.docker` as the source of truth.

## Current State

- Docker compose runtime loads `/.env.docker`.
- Docker helper scripts were aligned to read `/.env.docker`.
- `/.env` remains the non-Docker local environment file.
- `.env.docker` is expected to exist before Docker image build.

## Important Facts

- Mixing `/.env` and `/.env.docker` caused confusion and stale behavior.
- The frontend build can drift from runtime env if the image is not rebuilt after public env changes.
- The repo now has a local `AGENTS.md` that points ResumeConverter sessions to this vault as external memory.
- The standard Docker workflow is centered on `docker-build.bat` and `docker-run.bat` on Windows.
- The documented stack persists PostgreSQL data, uploads, and logs in local directories.
- Docker bundles OCR and PDF-generation dependencies that non-Docker installs may need to provide manually.
- Docker startup is expected to work with the explicit migration runner rather than hidden schema initialization in the web process.
- Turnstile public-key changes require a rebuild because the Docker build injects the key into the frontend bundle.
- Cache backend selection in Docker is distinct from cache coherence: Redis can be selected as storage, but PostgreSQL-backed scope versioning and notifications still drive invalidation correctness.

## Operational Rule

When troubleshooting Docker behavior:

1. inspect `/.env.docker`
2. inspect the build helper scripts
3. verify whether the image was rebuilt
4. only then inspect container runtime env

## Related

- [[topics/Environment and Secret Matrix]]
- [[topics/Turnstile]]
- [[topics/AI Timeouts]]
- [[entities/ResumeConverter]]

## Sources

- [[raw/session-notes/2026-04-16-memory-bootstrap]]
- [[raw/sources/2026-04-16-installation-and-bootstrap-docs]]
- [[raw/sources/2026-04-16-cloudflare-turnstile-config]]
- [[raw/sources/2026-04-16-cache-architecture]]
