# Architecture

## Summary

ResumeConverter uses a split architecture with a React SPA, a central Express proxy server, and a separate PDF generation server.

## Current State

- Frontend:
  - React
  - Vite
  - React Router
- Main backend:
  - Node.js
  - Express
  - centralized middleware and route registry
- Secondary backend:
  - dedicated PDF server
  - Puppeteer
  - Pandoc and LibreOffice for document conversion
- Persistence and infra:
  - PostgreSQL
  - Redis
- Standard local development outside Docker expects three active processes:
  - proxy/API server
  - PDF server
  - Vite frontend

## Important Facts

- `server/proxy-server.js` is the main operational entry point for the application backend.
- `server/config/routeRegistry/apiRoutes.js` is the clearest condensed map of backend API surface.
- `pdf-server/server.cjs` is a separate operational component, not just a helper module.
- The package scripts indicate a mature lifecycle:
  - `build`
  - `start:proxy`
  - `start:pdf`
  - validation scripts
  - tests for server, client, PDF, and e2e
  - DB backup and migration commands
- Database bootstrap is expected to go through the migration runner, not implicit schema setup at web-server boot.
- OCR for scanned PDFs is part of the architecture, with a preferred system-binary chain rather than only browser-side extraction.

## Architectural Implication

Many bugs in ResumeConverter are cross-cutting because they involve:

- frontend request behavior
- proxy route and middleware behavior
- AI provider integration
- PDF/document sidecar behavior
- Docker-specific environment and build interactions

## Related

- [[topics/Application Surface]]
- [[topics/Docker Environment]]
- [[entities/ResumeConverter]]

## Sources

- [[raw/sources/2026-04-16-codebase-structure]]
- [[raw/sources/2026-04-16-installation-and-bootstrap-docs]]
