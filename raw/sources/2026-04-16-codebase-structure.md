# 2026-04-16 Codebase Structure

## Source Type

Direct codebase inspection.

## Files Inspected

- `C:\Users\mail\CascadeProjects\ResumeConverter\package.json`
- `C:\Users\mail\CascadeProjects\ResumeConverter\client\src\app\appRoutes.tsx`
- `C:\Users\mail\CascadeProjects\ResumeConverter\server\proxy-server.js`
- `C:\Users\mail\CascadeProjects\ResumeConverter\server\config\routeRegistry\apiRoutes.js`
- `C:\Users\mail\CascadeProjects\ResumeConverter\pdf-server\server.cjs`

## Durable Facts

- The app is a React + Vite SPA backed by a Node/Express proxy server.
- There is a separate PDF server responsible for PDF and DOCX generation concerns.
- The route surface is significantly broader than simple resume conversion.
- Local Docker runs Redis externally and PostgreSQL inside the application container.
- The project has a mature validation and test surface with dedicated scripts for core, e2e, client, server, PDF, migrations, and backups.
