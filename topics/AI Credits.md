# AI Credits

## Summary

ResumeConverter moved from late credit checks to upfront reservation for important AI workflows.

## Current State

- insufficient-credit backend responses use a machine-readable code
- the frontend redirects users to a dedicated insufficient-credit page
- upload-related AI workflows now block early when credits are not available
- reservation is made upfront and settled afterward instead of relying on a late availability check
- ledger primitives for firm-credit balance locking, transaction inserts, balance updates, and cache invalidation are now isolated in `server/services/aiCreditsLedger.service.js`
- `server/services/aiCredits.service.js` now focuses more narrowly on business policy such as reservation, workflow settlement, refunds, and configured action costs

## Important Facts

- Late credit checks caused unstable UX because work could start before the credit failure surfaced.
- Upfront reservation is the safer model for concurrency and user feedback.
- This topic is cross-cutting and affects upload, improvement, adaptation, matching, and similar IA features.
- Credit governance is keyed by business `actionType`, not by low-level provider call count.
- A single billed `actionType` can intentionally cover several traced LLM sub-operations when they belong to one priced user action.
- The main maintainability hotspot was a mix of policy and ledger concerns in one service; extracting the ledger layer reduced that coupling without changing credit semantics.
- Batch settlement for reserved jobs depends on `batch_job_items.pending_data.creditUsage` to know which reserved actions were actually consumed before deciding any refund.
- `server/services/batchJobs/itemCrud.js:updateJobItemStatus()` must preserve `pending_data.creditUsage` when it writes `result_data`; otherwise a successful action can later be refunded incorrectly at job settlement time.

## Current Reservation Shape

Observed batch reservation mapping includes:

- `import` -> `resume.analysis`, plus `resume.improvement` if improve mode is enabled
- `improve` -> `resume.improvement`
- `adapt` -> `resume.adaptation`
- `match` -> `resume.match`
- `profile-search` -> `profile.search`
- `profile-analysis` -> `profile.analysis`

Reservation metadata is attached to job options and later settled or refunded depending on real consumption and failure paths.

## Regression Note 2026-04-18

- A false-refund bug existed on some successful batch LLM operations, notably profile search / analysis / matching paths.
- Root cause: `markBatchJobActionCreditConsumed()` merged `pending_data.creditUsage`, but later successful `updateJobItemStatus(..., { result_data })` replaced `pending_data` entirely and dropped that marker.
- Consequence: `server/services/batchJobCredits.service.js:settleBatchJobCredits()` interpreted the reserved action as unused and refunded it even though the operation had succeeded.
- Fix: preserve existing `creditUsage` when persisting `result_data`, and lock it with a regression test in `server/tests/services/batchJobs.itemCrud.test.js`.

## ActionType Governance Rule

Every durable AI feature should define, together:

- a charged `actionType`
- a traced business `operationType`
- a configurable cost setting
- a configurable max-token setting

If one of these four pieces is missing, the feature is only partially governed.

Examples of intentional one-to-many mappings:

- `template.extract` covers both:
  - `Template Extraction`
  - `Template Extraction Vision Fallback`
- `profile.search` covers:
  - `Mission Keywords Extraction`
  - `Batch Profile Scoring`
  - `Profile Match Explanation`
- `resume.improvement` covers:
  - `Resume Improvement`
  - `Improved Resume Analysis`

## Related

- [[topics/AI Operation Matrix]]
- [[topics/AI Timeouts]]
- [[topics/Batch Jobs and Long-Running Workflows]]
- [[topics/Settings and Governance Surfaces]]
- [[entities/ResumeConverter]]

## Sources

- [[raw/session-notes/2026-04-16-memory-bootstrap]]
- [[raw/sources/2026-04-16-admin-ops-and-diagnostics]]
