# Backup and Disaster Recovery

## Summary

Backup is a built-in operational subsystem in ResumeConverter, not an external runbook only. The product includes backup configuration, remote target testing, scheduling, history, and restoration.

## Backup Capabilities

The backup routes expose:

- backup settings retrieval
- backup settings update
- connection testing
- manual backup run
- history listing
- history deletion
- remote backup listing
- restore
- scheduler status

All backup routes are authenticated and admin-only.

## Configuration Model

The backup settings model includes:

- target type
- protocol
- TLS mode
- host
- port
- username
- password
- remote path
- daily schedule
- weekly schedule
- monthly schedule
- retention settings

The backend avoids echoing the stored password back to the client and instead returns `hasPassword`.

## Network Safety

Remote backup targets are not trusted blindly. The backend applies outbound-host safety checks before:

- saving remote settings
- testing a backup connection

This makes backup configuration a security-sensitive surface, not just a convenience feature.

## Scheduler Model

The scheduler:

- runs on an interval
- checks backup conditions every 30 seconds
- supports daily, weekly, and monthly schedules
- uses Paris-time helpers
- prevents duplicate execution through execution keys

The scheduler can be reloaded after configuration changes, and its status is exposed through the API.

## Failure Handling

On scheduled backup failure:

- the failure is logged
- DPO notification can be sent if DPO email settings exist

This links backup health to the broader compliance/operations model.

## Restore Model

Restore is part of the admin API, not a purely manual shell-only workflow.

Operational consequence:

- restoration is treated as an application-managed operation
- restore activity is security-relevant and audited

The backup core is also less monolithic now:

- `server/services/backup/core.service.js` keeps the orchestration layer: history entries, settings lookup, FTP upload/download, retention cleanup, and top-level logging
- `server/services/backup/artifacts.service.js` owns the artifact lifecycle primitives:
  - PostgreSQL binary resolution
  - backup dump creation and gzip compression
  - restore decompression and legacy dump detection
  - best-effort temporary artifact cleanup

## Why This Matters

- Backup in ResumeConverter is part of the product's operational posture.
- It is deeply connected to admin permissions, network safety, compliance, and recovery planning.
- Any future infra change should preserve both the scheduler behavior and the host-safety model.

## Related

- [[topics/Admin and Operations]]
- [[topics/Security and Compliance]]
- [[topics/Docker Environment]]
- [[topics/Observability and Quality]]

## Sources

- [[raw/sources/2026-04-16-admin-ops-and-diagnostics]]
- [[raw/sources/2026-04-16-installation-and-bootstrap-docs]]
