# AI Credits

## Summary

ResumeConverter moved from late credit checks to upfront reservation for important AI workflows.

## Current State

- insufficient-credit backend responses use a machine-readable code
- the frontend redirects users to a dedicated insufficient-credit page
- upload-related AI workflows now block early when credits are not available
- reservation is made upfront and settled afterward instead of relying on a late availability check

## Important Facts

- Late credit checks caused unstable UX because work could start before the credit failure surfaced.
- Upfront reservation is the safer model for concurrency and user feedback.
- This topic is cross-cutting and affects upload, improvement, adaptation, matching, and similar IA features.

## Current Reservation Shape

Observed batch reservation mapping includes:

- `import` -> `resume.analysis`, plus `resume.improvement` if improve mode is enabled
- `improve` -> `resume.improvement`
- `adapt` -> `resume.adaptation`
- `match` -> `resume.match`
- `profile-search` -> `profile.search`
- `profile-analysis` -> `profile.analysis`

Reservation metadata is attached to job options and later settled or refunded depending on real consumption and failure paths.

## Related

- [[topics/AI Timeouts]]
- [[topics/Batch Jobs and Long-Running Workflows]]
- [[topics/Settings and Governance Surfaces]]
- [[entities/ResumeConverter]]

## Sources

- [[raw/session-notes/2026-04-16-memory-bootstrap]]
- [[raw/sources/2026-04-16-admin-ops-and-diagnostics]]
