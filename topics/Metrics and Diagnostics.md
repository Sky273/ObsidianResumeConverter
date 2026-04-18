# Metrics and Diagnostics

## Summary

ResumeConverter has a substantial diagnostics surface. The metrics page is not only a server-health widget; it is an operational dashboard for traffic, AI usage, storage, OCR runtime, cache behavior, database state, and slow-request analysis.

## Metrics Endpoints

Admin-only metrics routes include:

- `/api/metrics`
- `/api/metrics/summary`
- `/api/metrics/performance`
- `/api/metrics/errors`
- `/api/metrics/cache`
- `/api/metrics/llm`
- `/api/metrics/operations`
- `/api/metrics/database`
- `/api/metrics/apm`
- `/api/metrics/apm/slow-requests`
- metrics reset and slow-request buffer clear operations

## Frontend Dashboard Shape

The metrics page composes several layers:

- overview stats
- server health cards
- cache backend diagnostics
- database metrics cards
- operations infrastructure cards
- batch import metrics
- AI modify metrics
- profile matching metrics
- improvement metrics
- adaptation metrics
- APM section
- HTTP traffic cards
- view-refresh debug card

It also supports JSON/CSV export.

## Operational Coverage

The diagnostics surface explicitly includes:

- request volume and response-time metrics
- error metrics
- cache hit/miss behavior
- LLM usage
- OCR runtime diagnostics
- word extraction fallback/runtime diagnostics
- storage statistics
- file cleanup statistics
- binary storage volume in database
- database size, connections, table stats
- slow-request capture via APM

## Cache Diagnostics

The dashboard distinguishes:

- configured cache backend
- effective cache backend
- connection state
- fallback reason

This is important because the application can degrade from requested Redis behavior to a memory fallback.
It also reflects that Redis is only the storage backend choice; cache coherence itself is handled by the application-layer invalidation model.

## Database Diagnostics

Database metrics are cached for 30 seconds to reduce load, which means diagnostics are intentionally operational but rate-conscious.

The dashboard surfaces:

- total database size
- per-table row/dead-row shape
- connection counts
- query timing for the diagnostics query itself

## APM and Slow Requests

The APM surface is a first-class operational tool:

- aggregate APM stats
- bounded slow-request list
- buffer clearing endpoint

This indicates that the team treats latency debugging as part of normal operations, not only ad hoc debugging.

## Why This Matters

- Metrics in ResumeConverter are productized operations tooling.
- The dashboard mirrors real subsystems: OCR, cache, database, AI, profile matching, imports, cleanup.
- Future changes should preserve both the APIs and the semantics of these metrics, because they are how the system explains itself in production.
- As of 2026-04-17, improvement fallback diagnostics are more readable in the client:
  - the improvement operations card already exposed `postAnalysisFallbackRuns`
  - recent entries now also render the embedded-analysis fallback source and the `post-analysis` stage with human-readable labels instead of raw internal identifiers
  - this makes the difference between generation fallback and persistence-analysis fallback easier to interpret during incident review
- As of 2026-04-17, improvement diagnostics distinguish a third post-analysis quality state:
  - `postAnalysisFallbackRuns` still means the persistence analysis failed with an invalid structured payload and the worker kept the embedded analysis wholesale
  - `postAnalysisMergeRuns` now means the persistence analysis technically succeeded but was sparse, so missing fields were backfilled from the embedded improvement analysis
  - recent entries expose this with `source: embedded-analysis-merge`, `stage: post-analysis`, and the merged field list
- As of 2026-04-17, adaptation diagnostics also expose which resume text source fed the operation:
  - recent entries can now indicate `resumeSource: improved_text` or `resumeSource: original_text`
  - this makes the admin-facing diagnostics more actionable when validating the end-to-end value of the improvement fallback chain
- As of 2026-04-17, the metrics card now surfaces degradation state explicitly:
  - improvement entries distinguish `generation fallback`, `post-analysis fallback`, and `post-analysis merge`
  - adaptation entries distinguish `adaptation fallback`
  - failed runs are rendered separately from nominal flows
- As of 2026-04-17, the metrics translations and tests were repaired in UTF-8 without BOM:
  - `client/src/i18n/locales/fr/metrics.json` was repaired from mojibake while preserving the full key set
  - `OperationLLMCard.test.tsx` now asserts degradation, source, stage, merged fields, and adaptation resume source labels explicitly


## Related

- [[topics/Admin and Operations]]
- [[topics/Operational Limits Matrix]]
- [[topics/Upload OCR and Parsing Pipeline]]
- [[topics/Application Cache Model]]
- [[topics/Observability and Quality]]
- [[topics/Batch Jobs and Long-Running Workflows]]
- [[topics/LLM Control Plane]]

## Sources

- [[raw/sources/2026-04-16-admin-ops-and-diagnostics]]
- [[raw/sources/2026-04-16-cache-architecture]]
