# Source Note: upload/OCR pipeline, operational limits, and email flows

## Purpose

Capture three operationally important areas that frequently cause confusion:

- upload and OCR/parsing behavior
- the cross-system limits matrix
- account email/verification/reset flows

## Files inspected

- `server/routes/resumes/upload.routes.js`
- `server/routes/resumes/upload/helpers.js`
- `server/routes/resumes/upload/handlers.js`
- `server/services/pdfTextExtraction.service.js`
- `server/services/wordTextExtraction.service.js`
- `server/DOCUMENT_PROCESSING_LIMITS.md`
- `server/services/emailVerification.service.js`
- `server/services/passwordReset.service.js`
- `server/routes/auth/passwordReset.routes.js`

## Durable facts

### Upload / OCR / parsing

- Resume extraction routes are:
  - `POST /api/resumes/extract-doc`
  - `POST /api/resumes/extract-pdf`
- Uploads are authenticated and upload-rate-limited.
- Extraction uploads are staged on disk, not handled as unbounded in-memory blobs.
- File signature validation happens before deep extraction.
- PDF extraction:
  - validates signature
  - uses per-user concurrency slots
  - extracts embedded text when possible
  - falls back to OCR for scanned/low-text pages
  - cleans extracted text before returning it
- Word extraction:
  - tries native extraction first
  - can fall back to `soffice` conversion to PDF
  - then reuses the PDF OCR pipeline
- OCR behavior is heuristic and page-aware, not blind full-document OCR by default.
- Upload/extraction flows emit metrics for upload success/failure, OCR usage, page count, timing, and OCR diagnostics.

### Limits

- The codebase already centralizes many effective limits in `DOCUMENT_PROCESSING_LIMITS.md`.
- Limits exist at several levels:
  - upload size
  - OCR page/pixel/time budgets
  - batch file count and total staging size
  - PDF-server HTML/CSS/fragment size
  - route-level timeouts
  - route-level rate limits
  - concurrency caps
- The right mental model is a matrix of subsystem-specific limits rather than one universal quota.

### Email / verification / reset

- Verification flow uses hashed one-time tokens stored in `email_verification_tokens`.
- Verification token lifetime is 24 hours.
- Existing unused verification tokens are invalidated before sending a new one.
- Password reset flow uses hashed one-time tokens stored in `password_reset_tokens`.
- Password reset token lifetime is 1 hour.
- Password reset has a per-user hourly rate limit.
- Password reset infrastructure also supports invite and forced-password-change email types.
- Password reset and verification flows both change real account state, not only messaging state.
- Password reset avoids obvious user-enumeration behavior for non-existent accounts.

## Interpretation

- ResumeConverter's ingestion path is a genuine pipeline with validation, temp staging, native extraction, OCR fallback, cleanup, and metrics.
- Operational limits are spread across multiple layers and should be remembered as a system.
- Account email flows are part of auth state management and should be treated as security-sensitive control flows.
