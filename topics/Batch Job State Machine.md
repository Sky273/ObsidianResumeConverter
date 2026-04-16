# Batch Job State Machine

## Summary

ResumeConverter batch jobs are persisted workflows with:

- a job-level state
- item-level states
- worker claiming semantics
- optional upfront AI credit reservation
- explicit settlement on completion, failure, or cancellation

This subsystem is the control plane for long-running resume and AI operations.

## Job-Level Statuses

Current job statuses:

- `pending`
- `processing`
- `completed`
- `failed`
- `cancelled`

Important behavior:

- jobs are created as `pending`
- workers claim `pending` and even already-`processing` jobs using `FOR UPDATE SKIP LOCKED`
- terminal statuses are `completed`, `failed`, and `cancelled`

## Item-Level Statuses

Current item statuses:

- `pending`
- `processing`
- `pending_name`
- `success`
- `error`
- `skipped`

Important nuance:

- `pending_name` means the worker hit a step that needs manual name input before the item can be resumed
- `skipped` is used when pending items are bypassed after job cancellation

## Job Creation Model

The subsystem supports several job types, including:

- `import`
- `improve`
- `adapt`
- `match`
- `profile-search`
- `profile-analysis`
- `deal-export`

Collection jobs also exist, but some are self-managed and not processed by the standard worker loop:

- `collect-trends`
- `collect-facts`
- `collect-metiers`

## Creation and Staging Sequence

Typical sequence:

1. create the `batch_jobs` row with status `pending`
2. persist job options
3. add item rows to `batch_job_items`
4. refresh `total_items`
5. let the background worker claim and process the items

For uploads, item staging can include file blobs copied into `batch_job_items.file_data` before the worker processes them.

## Worker Claiming Model

The worker runs on an interval and does not naively read all pending rows.

Key behavior:

- checks for pending jobs roughly every 5 seconds
- claims up to 5 jobs using `FOR UPDATE SKIP LOCKED`
- claims up to `BATCH_SIZE` items per job using `FOR UPDATE SKIP LOCKED`
- marks claimed items `processing` before actual execution
- processes item chunks in parallel up to `WORKER_EXECUTION_CONCURRENCY`

This avoids duplicate processing when multiple worker passes overlap.

## State Progression

Typical happy-path progression:

1. job created as `pending`
2. items inserted as `pending`
3. worker claims job and flips it to `processing`
4. worker claims items and flips them to `processing`
5. item handlers finish each item as `success` or `error`
6. job counters are recomputed
7. when all items are terminal, final outcome is derived:
   - `completed` if no item ended in `error`
   - `failed` if at least one item ended in `error`
8. export generation may happen before final completion when requested
9. credit reservation is settled if one exists

## Cancellation Model

Cancelling a job:

- sets the job status to `cancelled`
- marks still-`pending` items as `skipped`
- leaves already-running work to be reconciled by worker lifecycle logic

The worker explicitly checks whether the job remained cancelled after processing or after errors, and settles credits accordingly.

This means cancellation is not only a UI flag; it also triggers reconciliation logic.

## Failure Model

Two major failure classes exist:

### Item-level failure

- individual item ends as `error`
- job may still continue processing other items
- final job outcome becomes `failed` if any item errored

### Job-level failure or processing exception

- worker catches an exception while processing the job
- job is marked `failed` unless it was already cancelled
- credit settlement still runs if a reservation exists

## Pending Name Interruption

`pending_name` is a special interruption state:

- item cannot continue automatically
- pending analysis/text is stored in `pending_data`
- user can resume the item later by providing a candidate name
- resumed item is moved back to `pending` so the worker can pick it up again

This is an important product behavior because not every interruption is a hard failure.

## Credits and Settlement

Batch jobs can carry `options.creditReservation`.

Current model:

1. reservation is computed upfront from job type and planned item count
2. reservation is persisted in job options
3. item processing marks actual AI action consumption in `pending_data.creditUsage`
4. settlement compares reserved units vs consumed units
5. unused credits are refunded
6. reservation is marked with `settledAt`

The worker also scans for cancelled jobs that still need settlement.

This means the credit model is tied directly to the job state machine, not bolted on afterward.

## File Payload Lifecycle

For upload-heavy jobs:

- file blobs may be staged in `batch_job_items.file_data`
- worker can fetch file payloads on demand instead of loading everything eagerly
- processed file blobs can later be cleared
- bulk cleanup exists for processed items

This matters for DB size, worker memory behavior, and recovery after failures.

## Completion Semantics

A job is considered complete only when:

- it has items
- every item is in a terminal state: `success`, `error`, or `skipped`

If there are no items yet, the job is not complete.

This is important because item staging and job creation are separate steps.

## Operational Diagnostics Worth Remembering

The worker maintains runtime diagnostics such as:

- initialized vs not
- running vs stopped
- shutting down vs normal
- active processing count
- whether the polling interval is active

These values are useful when a job appears stuck but the issue is really in worker lifecycle state.

## Typical Failure Patterns

### Job stays `pending`

First suspects:

- worker not started
- batch schema missing
- item staging never completed

### Job stays `processing`

First suspects:

- worker crashed mid-flight
- some items never reached a terminal state
- export generation is still pending

### Credits reserved but not released

First suspects:

- settlement not yet run
- cancelled job still awaiting reconciliation
- reservation persisted but not marked `settledAt`

## Related

- [[topics/Batch Jobs and Long-Running Workflows]]
- [[topics/AI Credits]]
- [[topics/Core Resume Workflows]]
- [[topics/Metrics and Diagnostics]]

## Sources

- [[raw/sources/2026-04-16-env-session-batch-state]]

