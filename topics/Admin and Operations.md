# Admin and Operations

## Summary

ResumeConverter contains a substantial admin and operational surface beyond the end-user resume flows.

## Admin Workspace

The admin workspace groups:

- firms
- users
- templates
- email templates
- tags
- firm credits

It is not just a settings page; it is a consolidated admin area for business configuration and governance.

## Settings Surface

Settings expose:

- LLM provider configuration
- prompts
- scoring weights
- AI credit settings
- chatbot settings
- GDPR
- DPO fields
- API docs panel

This makes settings a central control plane for AI behavior and some compliance behavior.

## Operational Features

### Backup

- backup configuration
- connection testing
- manual backup runs
- backup history
- scheduler reload and scheduler status

### Sharing

- shareable PDF generation for resumes
- token-based public file and PDF access
- PDF generation via internal PDF server call

### Billing

- Stripe credit packs
- Stripe Checkout session creation
- webhook-driven credit attribution
- firm-credit purchase state persisted before checkout redirect

### Metrics

- global metrics
- summaries
- performance
- errors
- cache
- LLM usage
- operational metrics including OCR, storage, and cleanup

## Underlying Governance Split

Two internal surfaces are worth tracking separately:

- settings as behavior/control plane
- admin workspace as governance surface for firms, users, templates, email templates, tags, and firm credits

## Important Facts

- Operations are part of the product, not an external ops-only layer.
- Backup, sharing, billing, and metrics all have dedicated route/service implementations.
- Admin and operations surfaces are deeply connected to security, credits, exports, and deployment behavior.

## Related

- [[topics/Auth and Access Model]]
- [[topics/Integrations]]
- [[topics/Observability and Quality]]
- [[topics/Docker Environment]]
- [[topics/Settings and Governance Surfaces]]
- [[topics/Settings Catalog]]
- [[topics/Backup and Disaster Recovery]]
- [[topics/Maintenance and Cleanup Jobs]]
- [[topics/Metrics and Diagnostics]]
- [[topics/Stripe Billing and Firm Credit Purchase]]

## Sources

- [[raw/sources/2026-04-16-functional-workflows]]
- [[raw/sources/2026-04-16-admin-ops-and-diagnostics]]
- [[raw/sources/2026-04-16-stripe-billing]]
- [[raw/sources/2026-04-16-settings-maintenance-persistence]]
