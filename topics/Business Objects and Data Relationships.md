# Business Objects and Data Relationships

## Purpose

ResumeConverter is easier to understand as a graph of business objects than as a list of routes. The core data model is tenant-scoped around the `firm`.

## Primary Objects

- `firm`: top-level tenant boundary. Credits, users, clients, resumes, missions, deals, templates, and most operational data are scoped to a firm.
- `user`: authenticated actor attached to a firm unless platform admin. Roles drive access to admin workspace, settings, metrics, backup, and billing.
- `resume`: central candidate asset. Stores extracted content, source file metadata, analysis results, consent state, and links to adaptations, deals, pipeline entries, and shares.
- `mission`: recruiting need or assignment owned by a firm and often linked to a client and optionally a deal.
- `resume_adaptation`: AI-generated adaptation of a resume for a mission, with matching context and downstream pipeline usage.
- `client`: company account held by a firm. Has contacts and may be linked to missions, submissions, and deals.
- `client_contact`: person associated with a client. Used in submissions and client-facing workflows.
- `deal`: commercial/opportunity object linking a firm to clients/prospects, missions, and associated resumes.
- `deal_resume`: many-to-many link between deals and resumes with a status and notes.
- `candidate_pipeline`: selection workflow entry for a resume, optionally tied to a mission, adaptation, and client.
- `pipeline_interview`: scheduled interview attached to a pipeline entry.
- `template`: presentation/export template used to render resumes and generate PDFs or derived documents.
- `batch_job`: async job envelope for imports, improvements, adaptations, matching, exports, and reference-data collection.
- `batch_job_item`: item-level processing records inside a batch job.

## Credit and Billing Objects

- `firm credits`: current AI budget available to a firm.
- `firm_credit_transactions`: ledger of reservations, consumption, refunds, and purchases.
- `firm_credit_purchases`: Stripe-backed credit purchase history.
- `job credit reservation`: upfront reservation stored on long-running AI jobs so worker execution does not re-check credits late.

## Compliance and Sharing Objects

- `consent`: candidate consent state attached to a resume and its retention window.
- `gdpr audit log`: admin-visible audit stream for consent and GDPR actions.
- `shared pdf` / `shared original file`: tokenized public-share artifacts derived from a resume.

## Relationship Patterns

- `firm -> users`: a firm owns many users.
- `firm -> resumes / clients / missions / deals / templates`: tenant ownership pattern across most business data.
- `client -> contacts`: one client can have many contacts.
- `client -> missions`: missions can be client-linked.
- `deal -> missions`: a deal can aggregate multiple missions.
- `deal <-> resumes`: many-to-many through `deal_resume`.
- `resume -> adaptations`: one resume can produce multiple mission-specific adaptations.
- `resume -> candidate_pipeline`: one resume can appear in selection workflows, typically per mission.
- `candidate_pipeline -> pipeline_interviews`: interviews belong to a pipeline entry.
- `resume -> share links`: a resume can expose a public PDF token and a public original-file token.

## Key Invariants

- Cross-entity workflows are expected to remain firm-consistent. The backend explicitly validates that resumes, missions, adaptations, clients, and deals used together belong to the same firm.
- Platform admin can cross tenant boundaries; non-admin users cannot.
- AI credits are a firm-level budget, not a user-level budget.
- Long-running AI workflows should reserve credits before work starts.
- Public sharing never bypasses internal ownership checks at generation time; only tokenized artifacts are public.

## Practical Reading

- If a bug touches ownership, start from `firm`.
- If a bug touches candidate progression, start from `resume -> adaptation -> pipeline`.
- If a bug touches business development, start from `client -> deal -> mission -> resume`.
- If a bug touches AI usage, start from `firm credits -> reservation -> batch job / workflow`.

## Related

- [[topics/Core Resume Workflows]]
- [[topics/Clients Deals Missions Pipeline]]
- [[topics/Batch Jobs and Long-Running Workflows]]
- [[topics/Auth and Access Model]]
- [[topics/Data Persistence Map]]
- [[topics/AI Credits]]
- [[topics/Security and Compliance]]

## Sources

- [[raw/sources/2026-04-16-functional-workflows]]
- [[raw/sources/2026-04-16-domain-model-and-control-plane]]
- [[raw/sources/2026-04-16-settings-maintenance-persistence]]
