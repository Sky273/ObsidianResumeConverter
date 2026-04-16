# Header Size Budget

## Summary

ResumeConverter should preserve a practical budget of less than 4 KB for request headers whenever possible.

This is an operational rule, not a universal code-enforced limit.

It matters because the app relies on:

- cookie-based auth
- CSRF headers
- request IDs
- proxy and internal-service headers
- deployment behind reverse proxies and hosting layers that may enforce their own header limits

## Why This Matters

Large headers are fragile.

Typical failure modes include:

- `431 Request Header Fields Too Large`
- dropped or truncated cookies
- inconsistent behavior across reverse proxies
- failures that appear only in production because local Node accepts what upstream infrastructure rejects

For ResumeConverter, the main contributors are usually not custom metadata fields. They are:

- `accessToken` cookie
- `refreshToken` cookie
- CSRF cookie/header
- request tracing headers
- any future tendency to stuff structured state into headers or cookies

## Practical Rule

Keep the total request-header footprint comfortably below 4 KB.

More specifically:

- do not add large custom headers
- do not move application state into cookies
- do not serialize business payloads into headers
- keep request IDs compact
- prefer request body or persisted server state over header growth

## Important Distinction

This note is about HTTP header size, not about the JSON request body.

ResumeConverter already supports request bodies much larger than 4 KB for legitimate document-generation and upload flows.

Examples:

- HTML body for PDF generation
- stylesheet/body/footer fragments
- uploaded files

Those belong in the request body or persisted storage, not in headers.

## Relationship With Current Architecture

The app is especially sensitive to header bloat because it combines:

- cookie auth
- refresh-token rotation
- CSRF double-submit
- proxying to internal services
- multiple deployment environments

That means header growth tends to compound across otherwise separate features.

## Practical Examples

Good:

- short `x-request-id`
- compact cookies
- `x-csrf-token` carrying only the CSRF token value

Bad:

- storing serialized user profile or feature flags in cookies
- embedding large template fragments or HTML in headers
- adding verbose tracing/debug blobs to every request header

## Interaction With Document Generation

Document-generation payloads already track:

- `htmlLength`
- `stylesheetLength`
- `headerLength`
- `footerLength`

Those values belong in the JSON body and debug logs, not in HTTP headers.

This is exactly why preserving a small header budget matters: document complexity should stay in the body layer, while the transport metadata remains small and reliable.

## Design Rule For Future Changes

When a change introduces a new header or enlarges cookies, ask:

1. can this be stored in the request body instead?
2. can this be derived server-side instead of sent on every request?
3. does it risk pushing authenticated requests beyond a safe proxy budget?

If the answer is yes, prefer a different design.

## Related

- [[topics/Session and Token Lifecycle]]
- [[topics/Security and Compliance]]
- [[topics/PDF and Document Generation Boundary]]

## Sources

- [[raw/sources/2026-04-16-public-token-and-pdf-boundaries]]

