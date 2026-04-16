# Source Note: settings, maintenance, and persistence

## Scope

This note captures durable facts from the current codebase about:

- the canonical settings model
- recurring maintenance and cleanup behavior
- the main PostgreSQL persistence families

## Primary sources

- `server/services/settings.service.js`
- `server/services/scheduler.service.js`
- `server/utils/fileCleanup.js`
- `docker/schema.sql`

## Settings facts

- `settings.service.js` uses `CANONICAL_LLM_SETTINGS_KEY` to read the canonical `llm_settings` row.
- `getLLMSettings()` returns normalized settings and is the main entry point for the runtime control plane.
- Cache invalidation is explicit via `invalidateSettingsCache()` / shared-cache invalidation.
- Weighted global rating depends on settings, which confirms that scoring logic is partly data-driven.
- The settings layer covers provider/model selection, prompts, and related AI control-plane behavior.

## Scheduler facts

- `scheduler.service.js` includes recurring consent checks, reminder checks, purge checks, GDPR token refresh, and password-reset token cleanup.
- Timers are interval-based and there is an initial execution shortly after startup.
- `runAllChecks()` provides a manual execution path.

## Cleanup facts

- `fileCleanup.js` constrains cleanup to managed roots.
- Cleanup families include uploads, batch-job uploads, batch exports, temp files, and shared artifacts.
- OCR temp artifacts are cleaned separately using prefix-based matching such as `resume-ocr-` and `resume-word-ocr-`.
- Cleanup also coordinates expired shared artifacts, old batch jobs/export refs, and local backup retention.
- Cleanup keeps stats, emits metrics, prevents overlapping runs, and starts with an immediate pass before interval-based runs.

## Persistence facts

Key tables observed directly in `docker/schema.sql` include:

- `firms`
- `users`
- `resumes`
- `resume_versions`
- `resume_adaptations`
- `resume_comments`
- `resume_submissions`
- `templates`
- `batch_jobs`
- `batch_job_items`
- `clients`
- `client_contacts`
- `deals`
- `deal_resumes`
- `missions`
- `candidate_pipeline`
- `pipeline_history`
- `pipeline_interviews`
- `llm_settings`
- `firm_credit_transactions`
- `password_reset_tokens`
- `email_verification_tokens`
- `backup_settings`
- `backup_history`
- `gdpr_audit_log`
- `cache_scope_versions`

The durable architectural pattern is:

- tenant truth centered on `firms`
- user/auth truth in `users` and token tables
- candidate truth centered on `resumes`
- async truth in `batch_jobs` and `batch_job_items`
- business-development truth in clients/deals/missions/pipeline tables
- AI control-plane truth in `llm_settings` and credit ledger tables
- ops/compliance truth in backup, audit, and cache-version tables
