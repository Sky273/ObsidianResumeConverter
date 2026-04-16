# Source Note: environment matrix, session lifecycle, and batch job state machine

## Purpose

Capture three operationally important areas that are easy to partially remember and repeatedly re-derive:

- environment/secrets behavior
- auth session and token lifecycle
- batch job state machine

## Files inspected

- `server/config/envValidation.js`
- `server/routes/auth/config.js`
- `server/routes/auth/signin.routes.js`
- `server/services/batchJobs/constants.js`
- `server/services/batchJobs/jobCrud.js`
- `server/services/batchJobs/itemCrud.js`
- `server/services/batchJobsWorker/workerLifecycle.js`
- `server/services/batchJobCredits.service.js`

## Durable facts

### Environment and secrets

- Required boot vars currently include:
  - `JWT_SECRET`
  - `POSTGRES_HOST`
  - `POSTGRES_DB`
  - `POSTGRES_USER`
  - `POSTGRES_PASSWORD`
  - `CSRF_SECRET`
- `DEFAULT_ADMIN_PASSWORD` must be strong and explicit in production.
- `PDF_SERVER_INTERNAL_TOKEN` is effectively required in production and otherwise degrades internal PDF routes.
- Recommended vars include:
  - `REFRESH_TOKEN_SECRET`
  - provider API keys
  - `CACHE_BACKEND`
  - `NODE_ENV`
- Placeholder-looking values are treated as configuration defects.
- The frontend Turnstile site key is a build-time concern, while the Turnstile secret is a backend runtime concern.

### Session and token lifecycle

- Sign-in route is `POST /api/auth/signin`.
- Registration route is `POST /api/auth/register`.
- Refresh route is `POST /api/auth/refresh`.
- Logout routes are `POST /api/auth/logout` and `POST /api/auth/signout`.
- Current-user route is `GET /api/auth/me`.
- Auth uses cookie-oriented session behavior:
  - `accessToken` cookie
  - `refreshToken` cookie
- Access-token cookie options:
  - path `/`
  - httpOnly
  - sameSite `lax`
  - max age 1 hour
- Refresh-token cookie options:
  - path `/api/auth`
  - httpOnly
  - sameSite `lax`
  - max age 7 days
- Refresh currently rotates both access and refresh tokens.
- Logout revokes both tokens when present and clears both cookies.
- Cookie `secure` emission depends on deployment mode plus request/proxy security signals.

### Batch jobs

- Current job statuses:
  - `pending`
  - `processing`
  - `completed`
  - `failed`
  - `cancelled`
- Current item statuses:
  - `pending`
  - `processing`
  - `pending_name`
  - `success`
  - `error`
  - `skipped`
- Worker-managed job types include:
  - `import`
  - `improve`
  - `adapt`
  - `match`
  - `profile-search`
  - `profile-analysis`
  - `deal-export`
- Collection job types `collect-trends`, `collect-facts`, and `collect-metiers` are treated separately.
- Worker claiming uses `FOR UPDATE SKIP LOCKED` for both jobs and items.
- Worker loop runs every 5 seconds.
- Default batch size is 100.
- Items are terminal only when `success`, `error`, or `skipped`.
- `pending_name` is an interruption state, not final failure.
- Job final outcome is:
  - `completed` if no item is `error`
  - `failed` if any item is `error`
- Job cancellation updates job status and marks still-pending items as `skipped`.
- Batch job credit reservation is planned upfront, stored in job options, and settled later based on actual `creditUsage`.
- Worker lifecycle also settles cancelled jobs that still have unsettled reservations.

## Interpretation

- ResumeConverter has several areas where "it boots" is not enough; correct operation depends on understanding which envs are fatal, which are degradations, and which require rebuilds.
- The auth model is cookie/session oriented with explicit token rotation and separate CSRF bootstrap.
- Batch jobs are not a simple queue of fire-and-forget tasks; they are a persisted state machine with reconciliation and credit settlement.
