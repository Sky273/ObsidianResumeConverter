# ResumeConverter

## Summary

ResumeConverter is a recruiting-focused application with a strong resume-centered core and a broad surrounding platform surface.

## Current State

- Core resume workflows:
  - upload
  - extraction
  - pre-analysis
  - analysis
  - improvement
  - adaptation
  - mission matching
- Business workflow chain:
  - clients and contacts
  - deals
  - missions
  - candidate pipeline
  - interviews
- Cross-cutting platform layers:
  - AI provider routing
  - AI credit accounting
  - settings-driven AI control plane
  - admin and metrics
  - backup and recovery operations
  - GDPR
  - email and templates
  - Docker deployment
  - market/reference data

## Important Facts

- The codebase already contains multiple long-running IA workflows and batch jobs.
- Docker behavior is operationally important for local and hosted environments.
- Product behavior around AI credits and provider failures has recently been hardened.
- Firm isolation is a first-order architectural invariant across business objects.
- The app owns both candidate-content processing and downstream business/delivery workflows.
- Template rendering/sharing and market intelligence are substantial modules, even if secondary to the product nucleus.
- The project benefits from an external memory because many failures come from cross-cutting interactions, not isolated files.

## Related

- [[overview]]
- [[topics/Core Resume Workflows]]
- [[topics/Business Objects and Data Relationships]]
- [[topics/Clients Deals Missions Pipeline]]
- [[topics/Batch Jobs and Long-Running Workflows]]
- [[topics/Auth and Access Model]]
- [[topics/Admin and Operations]]
- [[topics/Settings and Governance Surfaces]]
- [[topics/Backup and Disaster Recovery]]
- [[topics/Metrics and Diagnostics]]
- [[topics/LLM Control Plane]]
- [[topics/Resume Presentation and Templates]]
- [[topics/Market Intelligence and Reference Data]]
- [[topics/Security and Compliance]]
- [[topics/Integrations]]
- [[topics/Observability and Quality]]
- [[topics/Docker Environment]]
- [[topics/Turnstile]]
- [[topics/AI Credits]]
- [[topics/AI Timeouts]]

## Sources

- [[raw/session-notes/2026-04-16-memory-bootstrap]]
- [[raw/sources/2026-04-16-codebase-structure]]
- [[raw/sources/2026-04-16-domain-model-and-control-plane]]
