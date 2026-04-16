# Operational Limits Matrix

## Summary

ResumeConverter has many limits, but they are spread across upload routes, OCR services, batch jobs, auth, and the PDF server.

This note is the durable memory of those limits as an operational system, not a replacement for code-level constants.

## Global HTTP and Rate Limits

- JSON body limit on the main backend is large enough for document workflows and is not the limiting factor for most app traffic.
- Global API rate limiting exists.
- Auth endpoints have a stricter limiter.
- Registration has its own limiter.
- Per-user and combined IP+user limits also exist.

The important architectural fact is that the app uses layered, route-specific limits instead of one universal gate.

## Resume Extraction Limits

Current remembered limits:

- one file per extraction request
- file-size ceiling for extraction uploads
- upload route rate limit
- PDF extraction concurrency cap per authenticated user

PDF-specific remembered ceilings:

- max page count
- max scanned pages sent to OCR
- max render pixel budget
- max OCR variants per page
- max OCR time budget per page

These limits exist to keep OCR-heavy inputs bounded.

## Word Extraction Limits

Word extraction inherits several limits from:

- upload size constraints
- native extraction success thresholds
- PDF OCR fallback availability when `soffice` is present

This means Word inputs are bounded partly by OCR/PDF limits as soon as fallback conversion is used.

## Template Extraction Limits

Template extraction has its own tighter profile than generic upload:

- dedicated upload size limit
- dedicated per-user rate limit
- dedicated per-user concurrency cap
- signature validation before deep processing

This is important because template extraction is expensive and AI-driven, not a cheap parser call.

## Batch Import and Export Limits

Batch job surfaces add their own resource ceilings:

- max file count per batch import request
- max total staged upload size for batch import
- bounded insert batching for large blobs
- max resume count for synchronous export requests
- bounded PDF/DOCX generation timeouts for export calls

This means the batch subsystem is constrained by both transport limits and downstream generation limits.

## PDF Server Limits

The PDF server has a different limit profile from the main backend:

- max HTML size
- max stylesheet size
- max fragment size for header/footer
- max output size
- request timeout
- concurrency cap
- rate limit

These limits should be understood as an execution-safety envelope around rendering, not as application-level UX limits.

## Retention and Cleanup Limits

Several operational limits are really retention policies:

- password reset tokens are cleaned up
- batch blobs are cleared after processing
- old finished jobs are deleted
- shared PDFs and share tokens expire
- consent-related retention drives resume deletion for GDPR cases

This matters because "limit" in ResumeConverter is not only about request size; it is also about how long operational artifacts live.

## Why This Note Matters

When incidents happen, they are often limit interactions rather than single hard failures:

- a file is valid but too large
- OCR is available but the page budget is exhausted
- a route works but concurrency is saturated
- a batch job is accepted but later constrained by export/generation ceilings

Remembering the whole matrix avoids debugging each subsystem in isolation.

## Design Rule For Future Changes

Whenever a new heavy route is added, document:

1. input size limits
2. concurrency limits
3. timeout behavior
4. rate limits
5. cleanup/retention rules

## Related

- [[topics/Upload OCR and Parsing Pipeline]]
- [[topics/Batch Job State Machine]]
- [[topics/PDF and Document Generation Boundary]]
- [[topics/Metrics and Diagnostics]]

## Sources

- [[raw/sources/2026-04-16-upload-limits-and-email-flows]]

