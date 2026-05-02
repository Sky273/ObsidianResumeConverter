# Clients Deals Missions Pipeline

## Summary

ResumeConverter is not only a CV processing app. It also models the commercial and delivery chain around candidate placement: clients, contacts, deals, missions, candidate submissions, and interview pipeline.

## Clients

- Clients are firm-scoped accounts with pagination, search, filtering, and industry metadata.
- A client can have multiple contacts.
- Deletion is constrained by submission history.
- Admin can create or move clients across firms; non-admin users remain firm-scoped.
- The CRM clients page has three filter views: all accounts, clients, and prospects. Client/contact create, update, and delete operations must dirty all three local filter views, not only the active filter, so the next visit to each filter forces a fresh `getClients` read with the matching `type` filter.

## Deals

- Deals represent commercial opportunities or business cases.
- They have their own statuses, priorities, and aggregate statistics.
- A deal can be linked to clients, contacts, missions, and multiple resumes.
- Resume association is explicit through `deal_resume`, which carries status and notes.
- The app supports adding one resume to multiple deals in bulk.
- The deal detail view lets users attach an existing CV to the current deal from a CV picker and detach an associated CV from the CV card. The frontend uses `POST /api/deals/:id/resumes` for attachment and `DELETE /api/deals/:id/resumes/:resumeId` for detachment, then refreshes the deal resume list.
- CV cards in the deal detail view normalize SQL score fields (`global_rating`, `improved_global_rating`) as numeric API values before rendering the score gauge; otherwise associated CVs can display `0%` despite having stored scores.

## Missions

- Missions represent the recruiting need or assignment to fill.
- They sit at the junction between business demand and candidate evaluation.
- Missions are the main target object for profile matching and resume adaptation.
- They can also be surfaced from deal context.
- The deal detail view lets users attach an existing mission to the current deal from a mission picker, and detach an associated mission from the mission card. The frontend uses the existing mission update route with `dealId` or `dealId: null`, then refreshes the deal's mission list; backend association validation remains the source of truth for firm/client/deal consistency.
- A mission cannot be associated with both a client and a deal whose `client_id` points to another client; `server/services/missions.service.js` enforces this in `validateMissionAssociations`, and the mission form synchronizes/clears deal-client choices to prevent mismatches in the UI.
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
- Pipeline mutations must invalidate more than the `candidatePipeline` namespace: mission and deal derived views also surface `pipeline_count`, so adding, moving, editing, or removing a pipeline entry has to dirty mission/deal caches and grouped mission/deal views as well.
- The mission kanban drag-and-drop flow is timing-sensitive on the frontend:
  - relying only on React state for the active dragged card is not sufficient
  - the stable drag source must be tracked through `dataTransfer` plus a synchronous ref
  - otherwise a drop can acknowledge success while the wrong entry, or no current entry, is used during the move request

## Interviews

- Interviews are first-class records under the pipeline.
- Supported operations include scheduling, updating, completing, canceling, deleting, listing, and upcoming-interview views.
- The service keeps activity summaries and history, which indicates the pipeline layer is intended to be auditable and operationally visible.
- The mission pipeline interview modal and the CV analysis pipeline tab must force a fresh read when opening or refreshing interviews, and after scheduling, completing, or canceling an interview. `GET /api/pipeline/:id/interviews?refresh=1` bypasses the `interviews:${pipelineId}` cache, and the frontend should optimistically add the scheduled interview before the forced read so the open modal updates immediately.

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
