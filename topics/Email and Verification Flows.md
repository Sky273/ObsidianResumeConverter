# Email and Verification Flows

## Summary

ResumeConverter has several user-account email flows that are easy to conflate:

- email verification after self-service registration
- password reset
- invite / forced password change
- GDPR/operational mail delivery via the configured mail service

The important point is that these flows have distinct token models, expirations, and user-state consequences.

## Email Verification Flow

Main path:

1. self-service registration creates the user
2. verification email is sent
3. email contains a one-time tokenized link
4. `GET /api/auth/verify-email` consumes the token
5. user is redirected back to sign-in with a success or error code

Important properties:

- verification tokens are hashed before persistence
- token lifetime is 24 hours
- existing unused verification tokens are invalidated before a new one is created
- verification is blocked for inactive users
- successful verification marks `email_verified_at`

This flow is a gate for self-service users before normal sign-in is allowed.

## Verification Rate Limiting

Email verification mail sending is not open-ended.

Current remembered behavior:

- there is a per-user daily ceiling on verification token generation/sending
- the service logs rate-limit exceedance rather than exploding the user flow

This matters for both abuse control and mail-provider hygiene.

## Password Reset Flow

Routes:

- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

Typical sequence:

1. user requests password reset by email
2. backend looks up the user
3. non-existent or inactive accounts do not become user-enumeration leaks
4. existing active account gets previous reset tokens invalidated
5. a new hashed reset token is stored with expiry
6. email is sent with a frontend reset URL containing the plain token
7. reset route verifies the token and updates the password

Important properties:

- reset token lifetime is 1 hour
- rate limiting exists per user per hour
- token is one-time-use
- reset is refused for inactive users

## Invite and Forced Password Change

The same password-reset infrastructure also supports:

- invite emails
- forced password replacement

These are not just cosmetic variants; they are separate email-copy modes built on the same token/reset mechanism.

Operational consequence:

- invite and forced-change flows should be understood as part of the password-reset subsystem, not a separate auth stack

## Delivery Dependency

Both verification and password reset ultimately depend on the configured mail-delivery service.

Important remembered behavior:

- verification emails try to send after registration
- password reset treats email delivery failure as a real service error after token creation

This means mail-provider health can block account recovery or onboarding even when auth code itself is correct.

## User-State Consequences

These flows change real account state:

- verification sets `email_verified_at`
- password reset replaces the stored password hash
- forced-change flow clears `must_change_password` only after successful reset

So they are not merely messaging flows; they are account-lifecycle flows.

## Failure Patterns

### User says "I never got the email"

First suspects:

- rate limit already reached
- mail delivery provider issue
- bad frontend URL configuration

### Token link opens but fails

First suspects:

- token expired
- token already used
- user inactive
- frontend/backend URL mismatch

### Password reset requested for unknown account

Expected behavior:

- route should not expose account enumeration through different success/failure responses

## Design Rule For Future Changes

If a new account email flow is added, document:

1. where the plain token lives and where the hash is stored
2. expiry window
3. rate limit
4. one-time-use behavior
5. what account state changes on success

## Related

- [[topics/Session and Token Lifecycle]]
- [[topics/Security and Compliance]]
- [[topics/Integrations]]

## Sources

- [[raw/sources/2026-04-16-upload-limits-and-email-flows]]

