# Public Token Flows

## Summary

ResumeConverter intentionally exposes a small set of public, tokenized routes.

These flows are not anonymous access to the whole app. They are tightly scoped capabilities where:

- authentication is replaced by a purpose-specific token
- the exposed artifact or action is narrow
- expiry and revocation matter as much as route correctness

## Main Public Token Families

### GDPR consent response

Public routes:

- `GET /api/consent/respond/:token`
- `POST /api/consent/respond/:token`

Behavior:

- token is validated server-side
- invalid tokens return `INVALID_TOKEN`
- expired tokens return `TOKEN_EXPIRED`
- already-processed tokens return `ALREADY_PROCESSED`
- only limited data is returned for the public page:
  - candidate name
  - firm name
  - firm logo

The public route does not expose the authenticated consent-management surface.

### Public resume sharing

Public routes:

- `GET /api/share/pdf/:token`
- `GET /api/share/file/:token`

Behavior:

- token format is validated before lookup
- PDF access returns only the generated shared PDF artifact
- file access returns only the original uploaded resume file
- no authenticated session is required

Authenticated management routes remain separate:

- generate shared PDF
- inspect share status
- generate/reuse original-file token
- revoke share links

## Access Model

The public-token model should be understood as capability-based access.

The token itself grants a very specific right:

- answer one consent request
- fetch one shared PDF
- fetch one original file

It does not create a user session and does not grant broader tenant access.

## Security Properties

### Narrow artifact scope

Each token maps to one narrow operation or artifact rather than to broad read access.

### Expiry semantics

Both consent and share flows include expiration behavior.

This is important because token leakage risk is reduced when the lifetime is bounded.

### Revocation semantics

Share links can be revoked from authenticated routes.

This makes sharing an operational surface, not a permanent publication mechanism.

### Validation before response

The public endpoints reject malformed or unknown tokens before serving content.

### Public-route CSRF exemption is intentional

Consent response routes are publicly reachable and intentionally exempted from CSRF in the global middleware model.

That is not a security hole by itself; it is part of the design because these routes do not rely on an authenticated cookie session.

## Practical Risk Themes

The main risks in public-token flows are:

1. tokens that are too broad in scope
2. tokens without expiry or revocation
3. artifact lookup that is not tightly bound to the token
4. leaking too much metadata on invalid/expired/public endpoints
5. drifting from token-only access into implicit tenant data exposure

## Design Rule For Future Public Flows

If a new public route is ever added, document explicitly:

1. what exact capability the token grants
2. what the token can never do
3. whether it expires
4. whether it can be revoked
5. what user-facing states exist for invalid, expired, or already-used tokens

## Related

- [[topics/Security and Compliance]]
- [[SECURITY]]
- [[topics/Resume Presentation and Templates]]

## Sources

- [[raw/sources/2026-04-16-public-token-and-pdf-boundaries]]

