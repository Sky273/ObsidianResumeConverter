# Auth and Access Model

## Summary

ResumeConverter uses authenticated business routes with a strong emphasis on admin policy and multi-firm isolation.

## Current State

- Auth is split into:
  - sign-in
  - user auth flows
  - Google auth
  - password reset
- Protected application routes sit behind frontend guards.
- Backend routes use authentication middleware and role-specific authorization middleware.

## Roles and Access Shape

Observed role distinctions include:

- authenticated user
- manager-level/admin workspace access
- local admin capabilities
- super admin / transverse admin capabilities

Examples:

- admin workspace is a manager-level frontend area
- Stripe credit purchase is limited to local admins
- backup and metrics are admin-only
- backend audit posture treats admin-only by default as the safer baseline for transverse/system routes

## Multi-firm Isolation

The backend audit indicates that firm isolation is a core invariant:

- non-admin users should only see or mutate business data for their firm
- cross-firm reference injection was treated as a critical class of defect
- resume-, mission-, deal-, client-, pipeline-, and template-linked resources were part of the reviewed enforcement surface

## Important Facts

- Access control in this application is not only about authentication; tenant isolation is equally important.
- Backend route behavior and frontend page guards should be understood together.
- Future feature work should assume ownership checks and firm scoping are mandatory unless a route is explicitly transverse and admin-only.
- The frontend auth/session contract is being tightened around canonical user fields:
  - `firmId`
  - `firmName`
  - `role`
  - `status`
- Backend auth routes still emit legacy aliases such as `firm_id`, `firm`, and `customer*` for compatibility, but client-side session restoration and sign-in normalization now collapse those shapes into the canonical fields before `AuthContext` consumers read them.
- Backend user-response shaping is now centralized in `server/utils/mappers.js`:
  - session-facing endpoints such as sign-in, refresh, `me`, and Google auth still include legacy aliases for compatibility
  - user-management endpoints now return the canonical fields by default and no longer rebuild legacy aliases ad hoc in each route

## Related

- [[topics/Session and Token Lifecycle]]
- [[topics/Admin and Operations]]
- [[topics/Product Scope and Priorities]]
- [[topics/Observability and Quality]]

## Sources

- [[raw/sources/2026-04-16-backend-audit-and-quality]]
- [[raw/sources/2026-04-16-functional-workflows]]
- [[raw/sources/2026-04-16-env-session-batch-state]]
