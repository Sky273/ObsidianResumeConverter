# Application Release History

## Summary

This page records durable release-level milestones that matter for future maintenance and operator context.

## Current State

- Current recorded application version: `v1.9.3`

## Important Facts

### v1.9.3 - 2026-04-30

- Bumped the application version from `v1.9.2` to `v1.9.3`.
- Updated the root changelog and application metadata.
- The release consolidates recent fixes around:
  - CV template save/reload freshness and immediate export use of the latest saved template.
  - PDF footer stylesheet application and footer-height/body-text boundary behavior.
  - Dark-mode readability across shared tabs, breadcrumbs, pagination, Tiptap editors, CV previews, CRM, admin, radar, jobs, security logs, GDPR journal, guide, CVtheque, and missions.

### v1.9.1 - 2026-04-16

- Bumped the application version from `v1.9.0` to `v1.9.1`.
- Updated the root changelog and version markers in the application metadata.
- The release is focused on frontend presentation consistency rather than backend behavior:
  - `CVthèque / Liste` now follows the visual structure of `CVthèque / Par affaire` without grouping by deal.
  - `Missions / Liste` now follows the visual structure of `Missions / Par affaire` without grouping by deal.
  - The CVthèque tags tooltip was hardened for overlay rendering with viewport-aware placement and an opaque background.

## Related

- [[overview]]
- [[raw/sources/2026-04-16-release-v1.9.1]]
- [[raw/sources/2026-04-30-release-v1.9.3]]

## Sources

- [[raw/sources/2026-04-16-release-v1.9.1]]
