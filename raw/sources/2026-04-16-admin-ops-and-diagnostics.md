# Source Note: admin control surfaces, backup, and diagnostics

## Purpose

Capture durable facts about the operational/admin surfaces that were still under-documented in the vault after the first architecture and product passes.

## Files inspected

- `client/src/pages/SettingsPage.tsx`
- `client/src/pages/AdminWorkspacePage.tsx`
- `client/src/pages/MetricsPage.tsx`
- `server/routes/backup.routes.js`
- `server/services/backup-scheduler.service.js`
- `server/routes/metrics.routes.js`
- `server/routes/batchJobs.routes.js`
- `server/routes/batchJobs/createHandlers.js`
- `server/services/batchJobCredits.service.js`

## Durable facts

- The settings page is a real control surface with explicit tabs for:
  - LLM
  - prompts
  - weights
  - credits
  - chatbot
  - GDPR
  - DPO
  - API docs
- The admin workspace is a separate governance surface with tabs for:
  - firms
  - users
  - templates
  - email templates
  - tags
  - firm credits
- The metrics page is broad and layered:
  - core server metrics
  - server health and cache backend diagnostics
  - database metrics
  - cache-admin stats
  - operations metrics
  - APM metrics
  - HTTP traffic cards
  - exportable JSON/CSV snapshots
- Operations metrics explicitly cover:
  - uploads
  - OCR runtime
  - cleanup
  - binary storage
  - batch imports
  - AI modify
  - improvement
  - adaptation
  - profile matching
- Backup is a first-class admin subsystem:
  - configuration CRUD
  - connection testing
  - manual run
  - history
  - remote listing
  - restore
  - scheduler status
- Backup scheduler behavior is explicit:
  - checks every 30 seconds
  - supports daily/weekly/monthly plans
  - uses Paris time helpers
  - avoids duplicate execution through execution keys
  - sends DPO notification on failure when configured
- Backup remote targets are guarded by outbound-host safety checks, not only by UI validation.
- Batch job creation is operationally richer than the current lightweight vault notes suggested:
  - there are dedicated creation paths for import, improve, adapt, match, profile-search, profile-analysis, and deal-export
  - upfront credit reservation is attached to job options
  - failed creation or staging paths trigger refund/settlement behavior
- Batch job credit reservation plans are job-type specific and currently map actions such as:
  - import -> analysis (+ improvement if enabled)
  - improve -> improvement
  - adapt -> adaptation
  - match -> match
  - profile-search -> profile search
  - profile-analysis -> profile analysis

## Interpretation

- The vault needed deeper documentation of operations and governance surfaces because these are major product capabilities, not secondary implementation details.
- Settings, admin workspace, metrics, backup, and batch-job credit settlement together form an operational control layer around the recruiting workflows.
