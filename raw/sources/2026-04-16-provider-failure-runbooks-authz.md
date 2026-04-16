# Source Note: provider failure, incident runbooks, and authorization map

## Scope

This note captures durable facts from the current codebase about:

- LLM/provider failure classification and fallback behavior
- recurring operational incidents worth remembering
- role and authorization structure

## Primary sources

- `server/services/llmGateway.service.js`
- `server/services/llmProvider.service.js`
- `server/services/openai/resumeOperations.js`
- `server/services/batchJobsWorker/processors/improvement.js`
- `server/middleware/auth.middleware.js`
- `server/utils/firmHelpers.js`
- `server/routes/admin.routes.js`
- `server/routes/settings.routes.js`
- `server/routes/metrics.routes.js`
- `server/routes/backup.routes.js`
- `client/src/app/routeGuards.tsx`
- `client/src/pages/SettingsPage.utils.ts`
- `server/config/security.js`
- `server/routes/auth/signin.routes.js`
- `server/routes/llmProxyHandlers.js`
- `pdf-server/server.cjs`

## Provider failure facts

- `llmGateway.service.js` classifies provider-auth style failures as non-retryable.
- Detection includes messages such as `token expired or incorrect` and incorrect API-key variants.
- These failures are normalized to a stable app error with code `LLM_PROVIDER_AUTH_ERROR` and `retryable = false`.
- `resumeOperations.js` retries malformed structured responses once, then can use fallback behavior such as plain-text fallback for improvement.
- Batch improvement processing explicitly avoids pointless extra retries for non-retryable provider-auth failures.

## Auth and role facts

- Backend `requireAdmin()` only allows the superadmin role (`admin`).
- Backend `requireUserManager()` allows `admin` and `localAdmin`.
- Firm access is still enforced separately through firm ownership helpers.
- Frontend `AdminRoute` only allows `admin`.
- Frontend `ManagerRoute` allows `admin` and `localAdmin`.

## Operational incident facts

- CSRF uses `/api/csrf-token`, `x-csrf-token` cookie/header, and clears the CSRF cookie on invalid token state.
- Turnstile relies on CSP allowances plus backend verification; widget absence can come from frontend build-time env mistakes.
- Proxy/provider routes expose stable failure messages for missing provider keys and use centralized long AI timeouts.
- PDF generation is behind an internal token and dedicated health endpoint, making PDF failures diagnosable as a separate boundary.
