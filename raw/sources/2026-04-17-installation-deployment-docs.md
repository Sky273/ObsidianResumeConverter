# Source Note: Installation and Deployment Docs

## Scope

Repository documents inspected:

- `C:\Users\mail\CascadeProjects\ResumeConverter\INSTALL.md`
- `C:\Users\mail\CascadeProjects\ResumeConverter\INSTALL_PG.md`
- `C:\Users\mail\CascadeProjects\ResumeConverter\docker\README.md`
- `C:\Users\mail\CascadeProjects\ResumeConverter\README.md`

## Main Durable Facts

- `INSTALL.md` is the broadest bootstrap/runbook document in the repository.
- Local non-Docker runtime expects:
  - Node.js 18+
  - npm 9+
  - PostgreSQL 18+
- Local OCR for scanned PDFs depends on system binaries in `PATH`:
  - `tesseract`
  - `pdftoppm`
- Docker installs OCR and PDF-generation dependencies inside the image/runtime stack, including Tesseract, Poppler, and the Python OCR chain.
- The project no longer expects schema initialization as a side effect of starting the web server.
- The canonical startup migration path is explicit:
  - `npm run migrate`
  - `migrate-server.bat`
  - `npm run docker-migrate`
  - `docker-migrate.bat`
- `docker/README.md` describes the current container topology as:
  - dedicated PostgreSQL 18 container
  - dedicated Redis container
  - app container
- Docker uses `/.env.docker` as the source of truth for build and runtime.
- Frontend public env changes in Docker require an image rebuild because they are embedded at build time.
- Windows helper scripts remain part of the normal operator workflow:
  - `docker-build.bat`
  - `docker-run.bat`
  - `docker-stop.bat`
  - `docker-logs.bat`
  - `docker-shell.bat`
- `docker-run.bat` is documented as requiring an Administrator terminal on Windows because it configures `netsh interface portproxy`.
- `INSTALL.md` includes PRA/backup guidance, making it more than a pure developer setup file.

## Important Caveat

- The installation docs still contain visible mojibake/legacy-encoded French text in places, so they are operationally useful but should not be used as encoding-quality references.

## Related

- [[topics/Docker Environment]]
- [[topics/Environment and Secret Matrix]]
- [[topics/Backup and Disaster Recovery]]
- [[topics/Upload OCR and Parsing Pipeline]]

