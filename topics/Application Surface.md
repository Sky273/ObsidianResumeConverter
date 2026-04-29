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
- The `/resumes` CVtheque route keeps the global app shell and default `byDeal` view; its content surface now uses a compact CRM-style visual treatment driven by `client/src/styles/resumesEditorial.css`, with shared row cards for list and deal-grouped views.
- The authenticated shell now applies the compact CVtheque-derived visual system to all connected routes: warm gray light background, compact white cards, restored compact dark surfaces, zinc text, fine borders, reduced radii, tighter shared page headers/stats/tabs/search fields, and the `#6B4EFF` accent replace the previous light blue/indigo treatment.
- The compact visual system is now expected to cover public/auth/transient states too: login/register shells, password reset/change flows, 2FA verification, public sharing/consent/legal pages, batch jobs, processing overlays, improvement/adaptation loading states, and editor callouts should use warm gray or compact dark surfaces rather than blue page backgrounds or blue field focus treatments.
- The `/missions` route now has its own compact light variant based on the standalone Missions mockup, scoped via `missions-editorial-shell`: pale lavender-gray background, white compact stat cards, compact toolbar, and horizontal mission rows while preserving by-deal and list workflows.
- The `/clients` CRM route now uses `crm-compact-shell` on top of the migrated editorial tokens: compact warm-gray light background, white dense cards/toolbars/modals, reduced 13px/9px radii, purple accent, and matching compact dark surfaces across clients, deals, interviews, and deal detail.
- Page-level titles should follow the CVtheque header style: unframed `cv-page-heading`, 25px bold `cv-display` title, 13px muted subtitle, and no decorative vertical bar or card wrapper. `client/src/components/page/PageHeader.tsx` is the shared implementation for this pattern.
- The `/settings` route now uses `settings-compact-shell`: compact CVtheque-style heading, scoped warm-gray light surface, compact white/dark cards, 13px/9px radii, purple actions/focus, and harmonized controls across LLM, prompts, weights, credits, chatbot, GDPR, DPO, and API docs.
- The authenticated sidebar follows the compact dark navigation direction: 240px navy rail, purple active item, muted outline icons, uppercase section labels, compact brand block, and bottom profile block.

## Related

- [[topics/Architecture]]
- [[topics/Product Scope and Priorities]]
- [[entities/ResumeConverter]]

## Sources

- [[raw/sources/2026-04-16-codebase-structure]]
