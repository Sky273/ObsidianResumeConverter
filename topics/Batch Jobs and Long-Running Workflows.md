# Batch Jobs and Long-Running Workflows

## Summary

Batch processing is a major architectural and product subsystem used for import, improve, adapt, match, profile search, profile analysis, and deal export.

## Current State

Important job creation routes:

- `POST /api/batch-jobs`
- `POST /api/batch-jobs/improve`
- `POST /api/batch-jobs/adapt`
- `POST /api/batch-jobs/match`
- `POST /api/batch-jobs/profile-search`
- `POST /api/batch-jobs/profile-analysis`
- `POST /api/batch-jobs/deal-export`

Important management routes:

- list jobs
- get job details
- cancel job
- delete job
- download export
- provide missing names for items

## Workflow Model

- job records and item records are persisted in the database
- a worker lifecycle processes pending jobs
- some jobs stage uploaded files before asynchronous processing
- collection jobs and export jobs are handled through the same subsystem with job-type-specific behavior
- dedicated creation paths exist for import, improve, adapt, match, profile-search, profile-analysis, and deal-export
- job creation can include upfront credit reservation in job options before worker execution begins

## Important Facts

- The batch job subsystem is central to long-running product behavior.
- It is also where credit reservation and settlement matter operationally.
- Import jobs can create staged items after the API response, so job state management and failure settlement are important.
- Deal export uses the same broader job framework, not a separate ad hoc implementation.
- creation or staging failure is expected to trigger refund/settlement behavior rather than leaving credits orphaned

## Functional Role

Batch jobs reduce request/response coupling for:

- heavy AI operations
- many-file ingestion
- matching and analysis over many records
- export packaging and delivery

## Related

- [[topics/Core Resume Workflows]]
- [[topics/Batch Job State Machine]]
- [[topics/AI Credits]]
- [[topics/AI Timeouts]]
- [[topics/Metrics and Diagnostics]]
- [[topics/Observability and Quality]]

## Sources

- [[raw/sources/2026-04-16-functional-workflows]]
- [[raw/sources/2026-04-16-admin-ops-and-diagnostics]]
- [[raw/sources/2026-04-16-env-session-batch-state]]
