# Source Note: storage, dashboards, and resume domain model

## Scope

This note captures durable facts from the current codebase about:

- filesystem artifact placement and retention
- where operational diagnostics live
- the layered resume domain model

## Primary sources

- `server/config/constants.js`
- `server/utils/fileCleanup.js`
- `server/services/shareResume.constants.js`
- `server/services/shareResume.service.js`
- `server/routes/share.routes.js`
- `client/src/components/HealthIndicator.tsx`
- `client/src/app/appRoutes.tsx`
- `server/routes/admin.routes.js`
- `server/routes/backup.routes.js`
- `server/routes/gdprAudit.routes.js`
- `server/routes/health.routes.js`
- `docker/schema.sql`
- `server/routes/resumes/crud/handlers.js`
- `server/routes/resumes/crud/improvementHelpers.js`

## Storage and retention facts

- `UPLOAD_DIR` is a managed root and must not be the filesystem root.
- Shared PDFs live under `UPLOAD_DIR/shared` with path-safety checks.
- Batch-job staging and temp export artifacts are separate ephemeral artifact families.
- Cleanup policy treats uploads, OCR temp outputs, shared artifacts, and export files as managed temporary storage with explicit TTL behavior.

## Dashboard facts

- The header health indicator combines `/health` with admin cache stats.
- Metrics, security logs, GDPR audit, and backup are separate admin dashboards with different diagnostic value.
- `/health` is the quickest broad platform snapshot; metrics and admin/security surfaces are deeper follow-up tools.

## Resume model facts

- `resumes` carries extracted data, analysis payloads, version pointer, consent state, and share fields.
- `resume_versions` stores historical improved versions and associated scoring history.
- `resume_adaptations` stores mission-specific derivatives and match-analysis context.
- `resume_comments` and `resume_submissions` extend the resume into collaboration and client-delivery workflows.
