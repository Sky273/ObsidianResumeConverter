# Application Surface

## Summary

The product surface is broad. Resume workflows remain central, but the route map shows a much wider recruiting and operations platform.

## Frontend Surface

Important route groups visible in `client/src/app/appRoutes.tsx`:

- authentication and account:
  - `/signin`
  - `/register`
  - `/forgot-password`
  - `/reset-password`
- resume core:
  - `/resumes`
  - `/resumes/:id`
  - `/resumes/:id/analysis`
  - `/resumes/:id/improve`
  - `/resumes/:id/export`
  - `/resumes/:id/adapt`
  - `/upload`
- batch and admin resume operations:
  - `/batch-upload`
  - `/batch-jobs`
- missions and matching:
  - `/missions`
  - `/missions/:id`
  - `/adaptations`
  - `/adaptations/:id`
  - `/profile-matching`
- business/admin:
  - `/clients`
  - `/deals/:id`
  - `/admin`
  - `/settings`
  - metrics, security, GDPR audit, backup
- support pages:
  - `/credits-required`
  - `/guide`
  - `/share/:type/:token`
  - privacy and terms

## Backend Surface

Important API groups visible in `server/config/routeRegistry/apiRoutes.js`:

- auth
- settings
- missions
- resumes
- templates
- firms
- llm
- admin
- adaptations
- tags
- users
- chatbot
- market radar
- rome
- clients
- deals
- submissions
- mail
- email templates
- consent and GDPR mail
- 2FA
- share
- pipeline
- calendar
- backup
- batch export
- batch jobs
- billing when enabled

## Important Facts

- The application is already a platform, not a narrow single-feature tool.
- Complexity risk comes more from scope spread than missing features.
- The route map confirms that ResumeConverter carries both product and operational/admin layers in the same application.

## Related

- [[topics/Architecture]]
- [[topics/Product Scope and Priorities]]
- [[entities/ResumeConverter]]

## Sources

- [[raw/sources/2026-04-16-codebase-structure]]
