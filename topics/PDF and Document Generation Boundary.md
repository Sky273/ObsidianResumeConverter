# PDF and Document Generation Boundary

## Summary

ResumeConverter does not generate PDFs and DOCX files directly inside the main web server path. It delegates this work to a dedicated PDF server protected by an internal trust boundary.

This is both an architecture choice and a security/operability choice.

## Main Boundary

Main app responsibilities:

- authenticate user-facing routes
- authorize tenant access
- validate business payloads
- proxy document-generation requests
- manage sharing/export workflows

PDF server responsibilities:

- validate document-generation payloads
- enforce internal-service authentication
- enforce request-size and fragment-size limits
- generate PDF and DOCX outputs
- cap concurrency and request duration

## Internal Authentication

The proxy authenticates to the PDF server with:

- header `x-internal-service-token`
- shared secret `PDF_SERVER_INTERNAL_TOKEN`

Important rules:

- token must be at least 32 characters
- the PDF server refuses protected generation routes if the token is absent or invalid
- the main backend also refuses to proxy if the token is not configured correctly

This means the PDF server is not intended to be a generic public renderer.

## Network Boundary

The main backend validates the PDF server target through trusted-internal-URL checks before proxying.

Security consequence:

- PDF generation is protected not only by a secret header, but also by host-level trust restrictions
- this reduces SSRF-style misuse of the rendering surface

## Payload Validation Model

The PDF server applies request guards before generation:

- JSON body size guard
- HTML size limit
- stylesheet size limit
- fragment size limit for `headerContent` and `footerContent`
- dangerous HTML rejection
- dangerous CSS rejection
- rejection of external resources embedded in body/header/footer fragments
- footer-height normalization

Current important defaults:

- max HTML size: 5 MB
- max stylesheet size: 256 KB
- max fragment size: 512 KB
- max output size: 20 MB

These are operational ceilings, not ideal target sizes.

## Timeouts, Rate Limits, and Capacity

The PDF server also acts like a guarded execution service:

- request timeout
- per-IP rate limiting
- active-generation concurrency cap
- bounded output size

The proxy layer itself also has timeout handling and propagates request IDs for diagnostics.

## Request Debugging

Both proxy and PDF server track request debug context including:

- request ID
- filename
- HTML length
- stylesheet length
- header length
- footer length
- footer height

This is important because many rendering failures are payload-shape problems, not only infrastructure failures.

## Why This Boundary Matters

Without this separation, document rendering would blur together:

- user auth
- tenant authorization
- HTML/CSS sanitization
- headless browser or Pandoc execution
- output streaming

The current design keeps those concerns more isolated and easier to debug.

## Operational Failure Patterns

### 403 from the PDF server

First suspect:

- `PDF_SERVER_INTERNAL_TOKEN` mismatch between proxy and PDF server

### 503 before proxying

First suspect:

- PDF server URL rejected by internal network guard
- PDF auth token missing on the backend

### 400 from generation request

First suspect:

- oversized or unsafe `htmlContent`, `headerContent`, `footerContent`, or `stylesheet`

### 504 during generation

First suspect:

- rendering timeout
- payload too complex

## Practical Rule For Future Changes

If a feature touches export, sharing, or rendering, verify:

1. whether the payload still fits the PDF server guard model
2. whether internal authentication is preserved
3. whether tenant auth stays in the main backend rather than moving into the PDF server
4. whether request IDs and debug context remain available for support

## Related

- [[topics/Resume Presentation and Templates]]
- [[topics/Integrations]]
- [[topics/Security and Compliance]]
- [[SECURITY]]

## Sources

- [[raw/sources/2026-04-16-public-token-and-pdf-boundaries]]

