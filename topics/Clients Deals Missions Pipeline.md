# Clients Deals Missions Pipeline

## Summary

ResumeConverter is not only a CV processing app. It also models the commercial and delivery chain around candidate placement: clients, contacts, deals, missions, candidate submissions, and interview pipeline.

## Clients

- Clients are firm-scoped accounts with pagination, search, filtering, and industry metadata.
- A client can have multiple contacts.
- Deletion is constrained by submission history.
- Admin can create or move clients across firms; non-admin users remain firm-scoped.

## Deals

- Deals represent commercial opportunities or business cases.
- They have their own statuses, priorities, and aggregate statistics.
- A deal can be linked to clients, contacts, missions, and multiple resumes.
- Resume association is explicit through `deal_resume`, which carries status and notes.
- The app supports adding one resume to multiple deals in bulk.

## Missions

- Missions represent the recruiting need or assignment to fill.
- They sit at the junction between business demand and candidate evaluation.
- Missions are the main target object for profile matching and resume adaptation.
- They can also be surfaced from deal context.
- The grouped mission-by-deal view is now isolated from the broader CRUD service: `server/services/missions.service.js` keeps cache and public service entrypoints, while `server/services/missionsGroupedView.service.js` owns the heavier deal/missions/count assembly path.
- Attachment-count enrichment for grouped mission views is now centralized instead of duplicated separately for assigned and unassigned mission collections.

## Candidate Pipeline

- The pipeline tracks a candidate through mission-specific stages.
- Canonical stages currently include:
  - `new`
  - `screening`
  - `submitted`
  - `interview`
  - `interview_done`
  - `selected`
  - `rejected`
  - `on_hold`
- Pipeline entries can reference:
  - a resume
  - an adaptation
  - a mission
  - a client
- The service validates that these linked entities belong to the same firm and are logically coherent.

## Interviews

- Interviews are first-class records under the pipeline.
- Supported operations include scheduling, updating, completing, canceling, deleting, listing, and upcoming-interview views.
- The service keeps activity summaries and history, which indicates the pipeline layer is intended to be auditable and operationally visible.

## Submission and Candidate Progression Shape

- Resume ingestion and analysis produce candidate assets.
- Matching and adaptation connect candidates to a mission.
- Deals and clients provide the business envelope.
- Candidate pipeline and interviews provide execution tracking after selection begins.
- The resume-submission service is now split between:
  - `server/services/resumeSubmissions.service.js` for service-level behavior and cache invalidation
  - `server/services/resumeSubmissionsPersistence.service.js` for SQL shape, listing/count queries, and CRUD persistence primitives

## Why This Matters

- A large part of the product is not “generate a better CV” but “move a candidate through a recruiting/commercial workflow”.
- Many route-level access checks and data-consistency checks exist specifically because this chain spans several business objects.
- Documentation or future refactors should treat deals, missions, pipeline, and resumes as one connected subsystem.

## Related

- [[topics/Business Objects and Data Relationships]]
- [[topics/Core Resume Workflows]]
- [[topics/Batch Jobs and Long-Running Workflows]]
- [[topics/Application Surface]]
- [[topics/Auth and Access Model]]

## Sources

- [[raw/sources/2026-04-16-functional-workflows]]
- [[raw/sources/2026-04-16-domain-model-and-control-plane]]
