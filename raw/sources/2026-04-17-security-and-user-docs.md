# Source Note: Security and User Guide Docs

## Scope

Repository documents inspected:

- `C:\Users\mail\CascadeProjects\ResumeConverter\SECURITY.md`
- `C:\Users\mail\CascadeProjects\ResumeConverter\USER_GUIDE.md`
- `C:\Users\mail\CascadeProjects\ResumeConverter\USER_GUIDE_EN.md`

## Security Doc Highlights

- The repo `SECURITY.md` is a narrative security overview, not the canonical source of runtime truth.
- It still confirms several durable security intentions:
  - JWT auth with explicit algorithm control
  - separate access/refresh handling
  - token invalidation/blacklist behavior
  - CSRF protection
  - firm-based access control
  - TOTP-based 2FA
  - CSP / Helmet / CORS / validation / sanitization layers
- The role table in the repo security doc is simplified and should not be trusted alone for current authorization nuance.
- The security doc contains legacy/stale formatting and mojibake, so it should be treated as corroborating evidence rather than sole authority.

## User Guide Highlights

- `USER_GUIDE.md` and `USER_GUIDE_EN.md` are broad product walkthroughs, useful for understanding the functional surface exposed to end users.
- Their chapter structure confirms the product’s intended visible surface across:
  - CV management
  - missions
  - profile matching
  - pipeline
  - adaptations
  - CRM / deals
  - email sending
  - market radar
  - AI assistant
  - administration
  - backup
  - GDPR
- These guides are useful orientation material for user-facing flow understanding, but they are not sufficient for backend/runtime behavioral truth.

## Related

- [[SECURITY]]
- [[topics/Application Surface]]
- [[topics/Core Resume Workflows]]
- [[topics/Admin and Operations]]

