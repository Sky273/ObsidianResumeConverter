# Source Note: public token flows, PDF boundary, and header budget

## Purpose

Capture three operational/design topics that matter for future changes:

- public tokenized routes
- the main-backend to PDF-server boundary
- why a small HTTP header budget should be preserved

## Files inspected

- `server/routes/share.routes.js`
- `server/routes/consent.routes.js`
- `server/utils/pdfServerAuth.js`
- `server/config/routeRegistry/proxyRoutes.js`
- `pdf-server/server.cjs`
- `pdf-server/lib/requestGuards.cjs`

## Durable facts

### Public token flows

- Public consent routes exist:
  - `GET /api/consent/respond/:token`
  - `POST /api/consent/respond/:token`
- Public share routes exist:
  - `GET /api/share/pdf/:token`
  - `GET /api/share/file/:token`
- Share tokens are format-validated before lookup.
- Public routes return only narrow artifacts or actions, not full authenticated access.
- Authenticated routes still own generation, status, resend, and revocation behavior.

### PDF/document generation boundary

- Main backend proxies `/generate-pdf` and `/generate-docx`.
- PDF server requires `x-internal-service-token`.
- Shared secret is `PDF_SERVER_INTERNAL_TOKEN`.
- Both backend and PDF server treat missing/weak internal token as a real configuration problem.
- Main backend validates PDF server URL against trusted-internal-service rules.
- PDF server guards requests with:
  - request body size limit
  - HTML size limit
  - stylesheet size limit
  - fragment size limit for `headerContent` and `footerContent`
  - dangerous HTML rejection
  - dangerous CSS rejection
  - external-resource rejection in content fragments
  - timeout, rate-limit, concurrency, and output-size checks
- Debug context includes:
  - request ID
  - html length
  - stylesheet length
  - header length
  - footer length

### Header-size budget

- The app uses cookie auth (`accessToken`, `refreshToken`) and CSRF tokens, which already consume part of the request-header budget.
- The app also uses request IDs and internal proxy headers.
- Large document payloads are intentionally carried in JSON request bodies, not headers.
- There is no single code-enforced global `4 KB` header limit in the app, but keeping request headers under roughly 4 KB is a sound operational budget because:
  - proxies/load balancers often have stricter header constraints than local dev
  - cookie-based auth makes header growth cumulative
  - large headers tend to fail as transport errors rather than business errors

## Interpretation

- Public token flows are best understood as capability-based access, not anonymous access.
- The PDF server is a guarded internal execution service, not a generic rendering helper.
- Header size discipline is a cross-cutting reliability rule that becomes more important in a cookie-authenticated, proxy-heavy architecture.

