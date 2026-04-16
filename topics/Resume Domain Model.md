# Resume Domain Model

## Summary

In ResumeConverter, a resume is not just an uploaded file. It is a central domain object that accumulates extraction, analysis, version history, adaptations, comments, submissions, and consent state.

## Core Resume Record

The `resumes` table is the durable anchor for:

- extracted identity and metadata
- analysis payloads
- improved scoring fields
- current improved-text version pointer
- consent state and consent tokens
- share-token fields for public artifacts

This means the base resume record is both a business object and a workflow state carrier.

## Analysis Layer

Resume analysis populates structured fields such as:

- analysis details
- section scores
- summary/title-like derived values
- tags and cleaned structured signals

Improved analysis can be persisted again after improvement, which means analysis is not a one-shot immutable event.

## Version Layer

`resume_versions` stores historical improved-text versions with:

- sequential `version_number`
- change reason
- associated scores/tags/post-analysis state

The main resume points to `current_version`, so version history is an attached timeline rather than a separate detached document store.

## Adaptation Layer

`resume_adaptations` represents mission-specific CV adaptations.

It carries:

- mission linkage
- adaptation text/content
- status lifecycle
- match-analysis payload
- match score
- adaptation notes

This is not just another version of the CV. It is a mission-contextual derivative.

## Comment Layer

`resume_comments` stores collaborative or review-oriented notes attached to a resume.

This layer is important because a resume can accumulate internal interpretation and workflow context that is not part of the candidate document itself.

## Submission Layer

`resume_submissions` stores the history of sending a CV into client/prospect workflows.

It links resumes to:

- clients
- contacts
- missions
- sender/user context
- status progression such as sent/viewed/rejected/accepted/pending

## Consent Layer

The resume also carries consent workflow state:

- consent status
- request/response timestamps
- reminder counters
- expiry and token state

That makes a resume not only a recruiting artifact but also a compliance-tracked asset.

## Practical Reading

- If the issue is about the source candidate asset, start with `resumes`.
- If the issue is about improved text history, inspect `resume_versions`.
- If the issue is mission-specific, inspect `resume_adaptations`.
- If the issue is client delivery, inspect `resume_submissions`.
- If the issue is retention/compliance, inspect consent fields on the base resume.

## Related

- [[topics/Core Resume Workflows]]
- [[topics/Data Persistence Map]]
- [[topics/Business Objects and Data Relationships]]
- [[topics/Upload OCR and Parsing Pipeline]]

## Sources

- [[raw/sources/2026-04-16-storage-dashboards-and-resume-model]]
