# Operational Dashboards Map

## Summary

ResumeConverter exposes several operational views, but they answer different questions. This note captures where to look first depending on the incident type.

## Header Health Indicator

### Surface

- header/admin health indicator in the SPA
- powered by `/health` plus `/api/admin/cache-stats`

### Best for

- quick system health glance
- server/database/cache/OCR/provider family status
- confirming whether the issue is broad platform degradation

## Metrics Dashboard

### Surface

- `/dashboard/metrics`
- backed by `/api/metrics/*`

### Best for

- performance trends
- error summaries
- cache metrics
- LLM usage
- operational metrics such as OCR, cleanup, and storage activity

## Security Logs

### Surface

- `/dashboard/security-logs`
- backed by `/api/admin/security-logs`
- can also cross-reference `/health` and `/api/metrics/operations`

### Best for

- suspicious activity
- security/proxy events
- recent operational anomalies with an observability angle

## GDPR Audit

### Surface

- `/dashboard/gdpr-audit`
- backed by `/api/gdpr-audit/*`

### Best for

- consent/audit traceability
- GDPR actions and target-email history
- firm-scoped compliance investigations

## Backup Dashboard

### Surface

- `/dashboard/backup`
- backed by `/api/backup/*`

### Best for

- backup configuration state
- recent backup history
- scheduler status
- manual run / restore workflows

## Health Endpoint

### Surface

- `/health`

### Best for

- direct backend/platform health
- server, database, memory, OCR, cache, and provider-family snapshots
- confirming whether a user-facing issue is systemic

## Admin Cache Stats

### Surface

- `/api/admin/cache-stats`

### Best for

- cache backend mode
- namespace/cache usage summaries
- confirming Redis vs memory-fallback behavior

## Practical Reading by Incident

- `platform feels broken`: start with header health indicator or `/health`
- `performance or error-rate issue`: go to metrics
- `security/compliance suspicion`: go to security logs or GDPR audit
- `backup/recovery question`: go to backup dashboard
- `cache inconsistency suspicion`: inspect cache stats and health/cache sections

## Related

- [[topics/Metrics and Diagnostics]]
- [[topics/Runbooks Incident Ops]]
- [[topics/Backup and Disaster Recovery]]
- [[topics/Security and Compliance]]

## Sources

- [[raw/sources/2026-04-16-storage-dashboards-and-resume-model]]
