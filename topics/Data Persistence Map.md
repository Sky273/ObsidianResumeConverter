# Data Persistence Map

## Summary

ResumeConverter persists several different classes of state:

- tenant and identity truth
- candidate and delivery truth
- commercial truth
- AI control-plane truth
- operational/compliance truth
- temporary processing artifacts

Understanding which table family owns which truth is more useful than memorizing the whole schema.

## Tenant and Identity Truth

### Core tables

- `firms`
- `users`

### Role

- `firms` is the top-level tenant anchor.
- `users` carries authenticated actors, roles, and firm attachment.
- Many other tables derive ownership and authorization from these two anchors.

## Candidate and Resume Truth

### Core tables

- `resumes`
- `resume_versions`
- `resume_adaptations`
- `resume_comments`
- `resume_submissions`
- `templates`

### Role

- `resumes` is the durable candidate asset.
- Versions and adaptations capture history and mission-specific derivations.
- Templates persist presentation/rendering behavior rather than candidate content itself.
- Submissions connect resumes into downstream client and mission workflows.

## Async and Processing Truth

### Core tables

- `batch_jobs`
- `batch_job_items`

### Role

- These tables persist long-running workflow state.
- They are the durable source of truth for job/item status, retries, results, staged metadata, and cleanup eligibility.
- They are not just an execution queue; they are part of the audit trail of asynchronous work.

## Commercial and Delivery Truth

### Core tables

- `clients`
- `client_contacts`
- `deals`
- `deal_resumes`
- `missions`
- `candidate_pipeline`
- `pipeline_history`
- `pipeline_interviews`

### Role

- These tables represent the business-development side and the candidate-delivery side of the product.
- They connect firms, clients, opportunities, missions, and resume progression into one tenant-scoped graph.

## AI Control Plane and Credit Truth

### Core tables

- `llm_settings`
- `firm_credit_transactions`

### Role

- `llm_settings` is the durable source of truth for provider/model/prompt/weight behavior.
- `firm_credit_transactions` is the ledger for reservation, consumption, refund, and purchase effects.
- Firm-level available balance lives with the firm, while the ledger explains how that balance moved.

## Account Token and Mail Truth

### Core tables

- `password_reset_tokens`
- `email_verification_tokens`
- `user_mail_tokens`
- `user_calendar_tokens`
- `user_blacklist`
- `email_templates`

### Role

- These tables support account recovery, verification, mail integration, calendar integration, and outbound communication governance.
- They are operational/security state, not core candidate business objects.

## Compliance and Audit Truth

### Core tables

- `firm_gdpr_mail_tokens`
- `global_gdpr_mail_token`
- `gdpr_audit_log`

### Role

- These tables support GDPR mail flows, auditability, and long-tail compliance operations.
- They matter even when they are not visible in the primary product UI.

## Backup and Ops Truth

### Core tables

- `backup_settings`
- `backup_history`
- `cache_scope_versions`

### Role

- `backup_settings` and `backup_history` capture recovery configuration and execution history.
- `cache_scope_versions` is not cached data; it is a durable coherence primitive used to invalidate cache scopes safely across instances.

## Temporary or Derived Artifacts

These are not the main persistent truths even if they may be stored for a while:

- upload staging files
- OCR temp artifacts
- batch export files
- shared PDF/original-file artifacts
- in-memory or Redis cache entries

These artifacts are expected to be recreated, expired, or purged. The truth usually lives in PostgreSQL rows plus source files under managed storage.

## Practical Reading

- For authorization bugs, start with `firms` and `users`.
- For candidate-history bugs, start with `resumes`, versions, adaptations, and submissions.
- For async failures, start with `batch_jobs` and `batch_job_items`.
- For AI behavior changes, start with `llm_settings` and `firm_credit_transactions`.
- For cleanup/recovery issues, distinguish durable truth from purgeable artifacts.

## Related

- [[topics/Business Objects and Data Relationships]]
- [[topics/Batch Jobs and Long-Running Workflows]]
- [[topics/Batch Job State Machine]]
- [[topics/Settings Catalog]]
- [[topics/Backup and Disaster Recovery]]
- [[topics/Application Cache Model]]

## Sources

- [[raw/sources/2026-04-16-settings-maintenance-persistence]]
