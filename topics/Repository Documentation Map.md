# Repository Documentation Map

## Summary

This page maps the main Markdown documentation files that live inside the `ResumeConverter` repository and records which ones matter most for future engineering, operations, and agent work.

## Current State

The repository contains a mix of:

- canonical operational docs
- product/user guides
- targeted technical design notes
- historical audits/reports
- agent workflow control files

Not all Markdown files are equally authoritative. The most useful ones are the install/deployment, security, OCR, Docker, and prompt-governance documents.

## Important Files

- `README.md`
  - best short product and capability overview
- `INSTALL.md`
  - primary install/bootstrap/runbook document
  - includes local setup, Docker setup, env examples, backups, and PRA
- `INSTALL_PG.md`
  - concise PostgreSQL/bootstrap companion
  - useful when the task is narrowly about DB setup or migrations
- `docker/README.md`
  - primary source for Docker env/build/runtime behavior
- `SECURITY.md`
  - primary security posture reference
- `ARCHITECTURE.md`
  - broad architecture snapshot
  - useful, but should be cross-checked against code and vault topics
- `server/OCR_PIPELINE.md`
  - focused source for OCR execution order and fallback strategy
- `server/DOCUMENT_PROCESSING_LIMITS.md`
  - processing constraints and limits
- `server/config/LLM_GOVERNANCE.md`
  - prompt/contract/versioning policy
- `USER_GUIDE.md`
  - French user-facing walkthrough
- `USER_GUIDE_EN.md`
  - English user-facing walkthrough
- `CHANGELOG.md`
  - release history

## Usage Guidance

- For install or bootstrap questions, start with:
  - `INSTALL.md`
  - `docker/README.md`
  - `INSTALL_PG.md`
- For security or access questions, start with:
  - `SECURITY.md`
- For OCR/import behavior, start with:
  - `server/OCR_PIPELINE.md`
  - `server/DOCUMENT_PROCESSING_LIMITS.md`
- For prompt/runtime governance, start with:
  - `server/config/LLM_GOVERNANCE.md`
- For product walkthroughs or UI explanation, use:
  - `README.md`
  - `USER_GUIDE.md`
  - `USER_GUIDE_EN.md`

## Important Facts

- `INSTALL.md` is currently the broadest operational doc in the repository.
- `docker/README.md` is a better source than older mental models for container topology because it reflects the current dedicated PostgreSQL and Redis layout.
- `INSTALL_PG.md` is useful but narrower and partially overlaps with `INSTALL.md`.
- `USER_GUIDE.md` and `USER_GUIDE_EN.md` are useful for understanding the intended functional surface from a user/operator point of view, especially for CRM, pipeline, matching, adaptations, radar, GDPR, and admin flows.
- `server/OCR_PIPELINE.md`, `server/DOCUMENT_PROCESSING_LIMITS.md`, and `server/config/LLM_GOVERNANCE.md` are the highest-signal technical markdown docs under `server/`.
- Several repo docs still contain mojibake/legacy-encoded French text; treat them as informative source material, not as formatting/encoding exemplars.
- Historical audit docs like `BACKEND_AUDIT_2026-04-04.md` and `security_best_practices_report.md` are evidence and guidance, not canonical runtime truth.

## Open Questions

- Whether the repository should eventually normalize the major Markdown docs to clean UTF-8 without BOM.
- Whether some overlapping install material should be consolidated to reduce drift between `README.md`, `INSTALL.md`, and `docker/README.md`.

## Related

- [[overview]]
- [[topics/Architecture]]
- [[topics/Docker Environment]]
- [[topics/Upload OCR and Parsing Pipeline]]
- [[topics/LLM Control Plane]]
- [[topics/Security and Compliance]]

## Sources

- [[raw/sources/2026-04-17-repository-markdown-docs]]
- [[raw/sources/2026-04-17-installation-deployment-docs]]
- [[raw/sources/2026-04-17-security-and-user-docs]]
- [[raw/sources/2026-04-17-ocr-and-llm-docs]]
