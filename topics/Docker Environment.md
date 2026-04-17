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
- The repository install and Docker docs make `INSTALL.md` and `docker/README.md` the primary operator references for bootstrap, deployment, and recovery.
- The documented stack persists PostgreSQL data, uploads, and logs in local directories.
- Docker bundles OCR and PDF-generation dependencies that non-Docker installs may need to provide manually.
- Docker startup is expected to work with the explicit migration runner rather than hidden schema initialization in the web process.
- Docker helper scripts no longer re-run `docker-migrate` after container startup. The app entrypoint is now the single owner of Docker schema bootstrap.
- The Docker stack no longer embeds PostgreSQL or Redis inside the application image. The standard local topology is now:
  - `resumeconverter-app`
  - `resumeconverter-postgres`
  - `resumeconverter-redis`
- The application image still keeps `postgresql-client-18` because Docker bootstrap, health checks, and backup tooling rely on `pg_isready`, `psql`, and `pg_dump`, but the PostgreSQL server itself now lives in the dedicated Compose service.
- The Dockerfile now uses a multi-stage build:
  - builder stage installs JavaScript dependencies, builds the frontend bundle, then prunes devDependencies
  - runtime stage receives only the pruned `node_modules`, server code, PDF server code, scripts, and built `client/dist`
- This change materially reduces the final image size because the image no longer carries the full `npm ci` layer with frontend/test/lint tooling.
- Turnstile public-key changes require a rebuild because the Docker build injects the key into the frontend bundle.
- Cache backend selection in Docker is distinct from cache coherence: Redis can be selected as storage, but PostgreSQL-backed scope versioning and notifications still drive invalidation correctness.
- In some Docker/network environments, plain HTTP access to Ubuntu or PGDG APT mirrors is blocked and the base `ubuntu:22.04` image can also lack usable CA roots for the very first HTTPS `apt-get update`.
- The Dockerfile now bootstraps APT in two phases:
  - force Ubuntu and PGDG repositories to HTTPS
  - temporarily disable HTTPS peer/host verification only until `ca-certificates` is installed, then remove that bootstrap override before the rest of the package installation continues
- Existing PostgreSQL volumes created by the previous all-in-one container layout can keep an older password hash for the `resumeconverter` role. The Docker helper scripts now resynchronize that role password inside `resumeconverter-postgres` before treating the stack as ready.
- On Windows, `POSTGRES_PASSWORD` can legitimately contain `!`. The standard startup path therefore must not rely on raw batch `docker exec ... ALTER ROLE ... '!password!'` interpolation, because `cmd.exe` delayed expansion can corrupt the value before it reaches PostgreSQL.

## Build Failure Pattern

- Symptom: Docker build fails early on `apt-get update` or the first `apt-get install` with exit code `100`.
- Typical causes in this repo:
  - HTTP mirror access refused
  - HTTPS mirror handshake rejected because the base image does not yet have a usable certificate chain
- Current mitigation lives directly in `Dockerfile`, so this failure should now be treated as infra drift only if it reappears after a fresh rebuild.

## Build Model

- The Docker build is now intentionally split between a `builder` stage and a `runtime` stage.
- `builder` responsibilities:
  - install full JavaScript dependency graph with `npm ci --legacy-peer-deps`
  - build the frontend bundle
  - prune devDependencies with `npm prune --omit=dev --legacy-peer-deps`
- `runtime` responsibilities:
  - install only system runtime packages
  - copy the pruned `node_modules`
  - copy `server`, `pdf-server`, `scripts`, markdown guides, and built `client/dist`
- Operational consequence:
  - frontend/test/lint/build tooling no longer ships in the final app image
  - runtime behavior stays the same from the operator point of view
- Measured effect during the 2026-04-16 Docker refactor:
  - app image dropped from about `1.78 GB` to about `1.46 GB`
- Remaining heavy runtime contributors are still:
  - PaddleOCR / PaddlePaddle
  - LibreOffice / Pandoc
  - Google Chrome

## Startup Behavior

- The Docker helper scripts no longer force a full `docker compose down` before every start.
- The standard startup order is now:
  1. stop and remove any existing `app` container
  2. start `postgres` and `redis`
  3. wait for PostgreSQL health
  4. resynchronize the `resumeconverter` role password from `/.env.docker` when needed
  5. start `app`
  6. wait for app health
- This sequencing avoids a common failure mode on reused PostgreSQL volumes where the application starts before the role password has been repaired, then loops on `password authentication failed`.
- Stopping and removing the previous `app` container before the PostgreSQL sync is important because `restart: unless-stopped` can otherwise let the old app container auto-restart too early, race the password repair, and keep the new startup stuck in repeated `docker-migrate` auth failures while the health check stays `starting`.
- Password repair is now delegated to `docker/sync-postgres-role-password.ps1` on Windows so the critical secret never passes through fragile batch interpolation. The helper does two things before returning success:
  - `ALTER ROLE ... PASSWORD ...`
  - a real TCP login check against `127.0.0.1:5432` inside `resumeconverter-postgres`
- This extra verification matters because a successful `ALTER ROLE` alone is not enough if the supplied value was mangled before reaching PostgreSQL; startup should only continue once authenticated TCP login with the target password actually works.
- The app entrypoint is now the single owner of Docker schema bootstrap:
  - it retries `docker-migrate` for a bounded period
  - it verifies bootstrap state before starting Supervisor
- Docker helper scripts must not re-run `docker-migrate` after startup anymore; they should only wait for the app container to become `healthy`.
- `docker-run.bat` is documented as requiring an Administrator terminal on Windows because it configures `netsh interface portproxy` for external access.

## Practical Performance Note

- PostgreSQL still uses a Windows bind mount at `./data/postgresql` in the standard local Compose topology.
- This is acceptable for persistence and operator transparency, but it is slower than a Docker-managed named volume on Docker Desktop.
- If startup latency or I/O performance remains a problem, the next infrastructure optimization should be migrating PostgreSQL data storage from the bind mount to a named Docker volume.

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
- [[raw/sources/2026-04-17-installation-deployment-docs]]
