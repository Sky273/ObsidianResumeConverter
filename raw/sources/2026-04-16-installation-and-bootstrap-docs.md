# Source Note: installation, bootstrap, and operations docs

## Purpose

Capture durable facts from `README.md`, `INSTALL.md`, and `INSTALL_PG.md` that should live in the vault rather than only in setup guides.

## Files inspected

- `README.md`
- `INSTALL.md`
- `INSTALL_PG.md`

## Durable facts

- The project targets Node.js `>=18`, npm `>=9`, and PostgreSQL `18+`.
- The product is explicitly described as a resume-management and AI-analysis platform with profile matching and market radar, not a narrow conversion tool.
- OCR behavior is documented as:
  - preferred server/local chain: `pdftoppm` + `tesseract` CLI
  - `tesseract.js` as a fallback when system binaries are absent
- Docker images bundle OCR and PDF-generation dependencies, while non-Docker installs must provide OCR binaries explicitly if scanned PDFs are in scope.
- The canonical migration path is explicit:
  - schema is no longer applied automatically at web-server startup
  - `npm run migrate` is the supported bootstrap path
  - on an empty database, the runner applies `docker/schema.sql`
  - `docker/init-db.sql` is now a compatibility relay, not the primary schema definition
- Docker uses `.env.docker` before build/run and expects it to exist before image build.
- Turnstile is documented in install docs with:
  - `VITE_TURNSTILE_SITE_KEY` for frontend
  - `TURNSTILE_SECRET_KEY` for backend
  - test keys for local/validation
- Cache behavior is documented as backend/service-level with versioned scopes, local L1, optional Redis backend, and `refresh=1` bypass.
- The app exposes quickstart and multi-process local startup modes:
  - proxy server
  - PDF server
  - Vite frontend
- Backup/PRA are part of the documented operating model, including FTP/FTPS/SFTP backup configuration and explicit restore procedures.
- README documents E2E conventions:
  - authenticated Playwright flows reuse helper-based JWT cookie bootstrapping
  - reference flows include `upload -> analysis` and `analysis -> improve -> export`
- README and install docs contain some mojibake/encoding noise, so they are useful sources but not always good canonical prose.

## Interpretation

- Installation docs reinforce that ResumeConverter is an operational platform with explicit bootstrap, migration, backup, and disaster-recovery expectations.
- The vault should preserve these truths in topic pages rather than rely on setup docs alone.
