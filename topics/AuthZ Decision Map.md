# AuthZ Decision Map

## Summary

ResumeConverter uses a small set of roles, but their effect is spread across backend middleware, firm-scoped access checks, and frontend route guards.

The durable distinction is:

- `admin`: superadmin/platform-wide authority
- `localAdmin`: firm manager authority
- `user` and `viewer`: non-manager firm users

## Backend Role Rules

### `admin`

- passes `requireAdmin`
- can cross firm boundaries
- can access settings, metrics, backup, GDPR audit, market-radar collection, ROME collection, and firm management routes

### `localAdmin`

- does not pass `requireAdmin`
- does pass `requireUserManager`
- can manage firm-scoped management surfaces where routes use manager semantics instead of superadmin semantics
- remains constrained by firm ownership checks

### `user` / `viewer`

- do not pass admin or manager middleware
- can only act through normal authenticated business routes and their own firm-scoped data

## Backend Access Patterns

### Global/superadmin-only surfaces

Common examples:

- `/api/settings`
- `/api/metrics`
- `/api/backup`
- `/api/admin/*`
- firm CRUD and firm-credit top-up routes
- GDPR audit and mail-governance admin routes
- market-radar and ROME collection/admin refresh routes

These consistently use `authenticateToken + requireAdmin`.

### Manager surfaces

Manager semantics mean:

- `admin` and `localAdmin` are both allowed
- non-managers are denied

The backend exposes this through `requireUserManager()` and related helpers.

### Firm-scoped resource checks

Even after passing authentication, many routes still require:

- same-firm ownership
- same-firm cross-entity consistency

So role alone is not enough. Access is often `authenticated + role check + firm consistency`.

## Frontend Route Guard Model

The SPA uses two main elevated guards:

### `AdminRoute`

- only `user.role === 'admin'`
- used for settings, metrics, backup, jobs, security logs, and other superadmin pages

### `ManagerRoute`

- allows `admin` and `localAdmin`
- used for the admin workspace and template-management area

This means the frontend already reflects the same structural distinction as the backend: `localAdmin` is a manager, not a superadmin.

## Important Mental Model

Do not think of `localAdmin` as `almost admin everywhere`.

The closer model is:

- `admin` = platform/superadmin
- `localAdmin` = firm manager
- many sensitive operational surfaces remain superadmin-only

## Common Pitfalls

- Seeing an admin-like screen in the SPA does not imply the backend route is superadmin-only or vice versa; verify both sides.
- Firm-scoped helpers still matter for managers and normal users even after route-level role checks pass.
- Some bugs that look like missing permissions are actually firm-mismatch failures rather than role failures.

## Practical Reading

- If the question is `who can operate the platform?`, start with `requireAdmin`.
- If the question is `who can manage a firm surface?`, inspect `requireUserManager` plus firm checks.
- If the question is `why can this user see the page but still fail the API call?`, compare frontend route guard vs backend middleware vs firm ownership validation.

## Related

- [[topics/Auth and Access Model]]
- [[topics/Security and Compliance]]
- [[topics/Admin and Operations]]
- [[topics/Public Token Flows]]
- [[topics/Business Objects and Data Relationships]]

## Sources

- [[raw/sources/2026-04-16-provider-failure-runbooks-authz]]
