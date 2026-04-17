# Source Note: Repository Markdown Docs Inventory

## Summary

This note records the main Markdown documentation files present in the `ResumeConverter` repository as of 2026-04-17, with their purpose and durable relevance for future work.

Repository root:
`C:\Users\mail\CascadeProjects\ResumeConverter`

## Root Documentation

- `README.md`
  - product overview
  - current feature set
  - major runtime/provider surfaces
  - useful for high-level capability orientation
- `INSTALL.md`
  - main installation and launch guide
  - local non-Docker setup
  - Docker deployment bootstrap
  - env configuration examples
  - backup and PRA procedures
- `INSTALL_PG.md`
  - focused PostgreSQL client and migration setup
  - env examples for DB, LLM, cache, and Turnstile
  - concise bootstrap reference
- `ARCHITECTURE.md`
  - repository architecture and operational metrics sections
  - useful as a narrative architecture snapshot, but contains some stale/legacy wording
- `SECURITY.md`
  - consolidated security-oriented reference
  - should remain a primary source for security posture
- `USER_GUIDE.md`
  - French end-user guide
  - broad functional walkthrough of the product
- `USER_GUIDE_EN.md`
  - English end-user guide
  - same role as `USER_GUIDE.md` for English-speaking operators/users
- `CHANGELOG.md`
  - release and version history
- `BACKEND_AUDIT_2026-04-04.md`
  - point-in-time audit document
  - useful as historical evidence, not a canonical runtime source
- `security_best_practices_report.md`
  - security review/report artifact
  - useful as historical guidance, not runtime truth
- `MEMORY_AUDIT.md`
  - memory/vault maintenance artifact
  - relevant to agent workflow rather than application runtime
- `AGENTS.md`
  - agent operating instructions for this repository
  - not product documentation, but a workflow control file

## Docker / Infra Documentation

- `docker/README.md`
  - Docker deployment reference
  - `/.env.docker` contract
  - Docker build/runtime expectations
  - PostgreSQL and Redis container model
  - useful as the primary source for containerized deployment behavior

## Server-Side Technical Documentation

- `server/OCR_PIPELINE.md`
  - OCR module split
  - runtime backend policy
  - execution order and testing strategy
  - useful as a focused source for scanned-PDF behavior
- `server/DOCUMENT_PROCESSING_LIMITS.md`
  - document-processing size and behavior constraints
  - useful for operational and ingestion limits
- `server/config/LLM_GOVERNANCE.md`
  - prompt/contract governance model
  - links prompt IDs, versions, contracts, and validators
  - useful as a primary source for prompt versioning policy

## Frontend / Secondary Documentation

- `client/src/i18n/README.md`
  - i18n/localization reference
  - useful for translation structure and locale maintenance
- `client/public/CHANGELOG.md`
  - public-facing changelog artifact
  - secondary to root `CHANGELOG.md`

## Important Facts

- `INSTALL.md` remains the broadest operational bootstrap document and includes:
  - local install
  - Docker install
  - env configuration
  - backups
  - PRA/recovery
- `docker/README.md` is the clearest source for the current Docker contract:
  - dedicated PostgreSQL container
  - dedicated Redis container
  - `/.env.docker` as Docker source of truth
- `server/OCR_PIPELINE.md` and `server/config/LLM_GOVERNANCE.md` are high-signal technical docs that complement the broader install docs.
- Several repo docs still contain visible mojibake or legacy-encoded French text, so they are useful as source material but should not be treated as encoding-quality exemplars.

## Recommended Priority Order

When ingesting repo docs for future sessions, prioritize:

1. `README.md`
2. `INSTALL.md`
3. `docker/README.md`
4. `SECURITY.md`
5. `ARCHITECTURE.md`
6. `server/OCR_PIPELINE.md`
7. `server/config/LLM_GOVERNANCE.md`
8. `INSTALL_PG.md`
9. `USER_GUIDE.md`
10. `CHANGELOG.md`

## Related

- [[topics/Repository Documentation Map]]
- [[topics/Architecture]]
- [[topics/Docker Environment]]
- [[topics/Upload OCR and Parsing Pipeline]]
- [[topics/LLM Control Plane]]

