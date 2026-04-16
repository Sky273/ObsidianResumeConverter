# Maintenance and Cleanup Jobs

## Summary

ResumeConverter has two different maintenance layers:

- scheduler-driven business/compliance checks
- filesystem and artifact cleanup

They are related, but they do not do the same work.

## Scheduler-Driven Maintenance

`server/services/scheduler.service.js` runs recurring background checks focused on compliance and account hygiene.

### Main recurring tasks

- consent checks
- reminder checks
- retention/purge checks
- proactive GDPR token refresh
- password-reset token cleanup

### Cadence

- consent checks run hourly
- reminder checks run every 6 hours
- purge checks run daily
- GDPR token refresh runs every 7 days
- an initial pass is triggered shortly after startup rather than waiting a full interval

### Operational meaning

- GDPR behavior is not only route-driven; it also depends on background upkeep.
- Token hygiene for password-reset flows depends on background cleanup, not only on request-time validation.
- There is also a manual `runAllChecks()` path, so the scheduler logic can be invoked intentionally for diagnostics or recovery.

## Filesystem and Artifact Cleanup

`server/utils/fileCleanup.js` owns periodic cleanup of temporary files and derived artifacts.

### Managed cleanup roots

- upload directory
- batch-job upload staging
- temp batch exports
- server temp directory
- share-artifact directories within managed roots

Cleanup is intentionally restricted to managed roots so the process cannot recursively delete arbitrary paths.

### Default retention model

- uploads: 1 hour
- server temp files: 1 hour
- batch-job uploads: 24 hours
- batch exports: 7 days
- shared artifacts: TTL aligned with `SHARE_LINK_TTL_MS`

### OCR artifact cleanup

- OCR temp artifacts use recognizable prefixes such as `resume-ocr-` and `resume-word-ocr-`
- they are cleaned with a dedicated daily cleanup cycle
- they use their own max-age policy rather than piggybacking on the generic temp cleanup

## Database-Adjacent Cleanup Performed from File Cleanup

The cleanup layer also triggers a few database-backed maintenance tasks:

- expired shared artifact cleanup
- batch-job cleanup and stale export reference cleanup
- local backup cleanup based on configured retention

This means `fileCleanup` is not purely about files; it is also an operational reconciler for temporary outputs and their references.

## Safety and Operational Traits

- overlapping cleanup runs are prevented
- timers can be started, stopped, and inspected
- cleanup statistics are retained for diagnostics
- metrics are emitted so cleanup activity is observable
- cleanup runs immediately on startup, then periodically

## Why This Matters

- Temp files, exports, OCR artifacts, and shared PDFs are expected to be ephemeral, not permanent storage.
- Recovery/debugging questions often depend on knowing whether an artifact should still exist or should already have been purged.
- Some apparent data-loss reports are actually retention-policy behavior.

## Related

- [[topics/Backup and Disaster Recovery]]
- [[topics/Upload OCR and Parsing Pipeline]]
- [[topics/PDF and Document Generation Boundary]]
- [[topics/Operational Limits Matrix]]
- [[topics/Admin and Operations]]

## Sources

- [[raw/sources/2026-04-16-settings-maintenance-persistence]]
