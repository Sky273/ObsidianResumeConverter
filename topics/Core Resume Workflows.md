# Core Resume Workflows

## Summary

The center of the product is the resume lifecycle: ingest, extraction, pre-analysis, analysis, improvement, adaptation, export, and mission-related evaluation.

## Main Resume Flows

### Upload and ingestion

- Users can upload resumes from the main upload flow.
- Batch import exists as a first-class workflow for many files.
- Extraction supports document and PDF paths, with OCR and text extraction services in the backend.

### Analysis

- Resumes can be analyzed to produce structured insights and scoring.
- Pre-analysis exists as a dedicated step to clean or structure extracted text before deeper analysis.
- Analysis and improved-analysis are treated as distinct AI operations.

### Improvement

- A resume can be improved asynchronously.
- Improvement produces a revised text plus derived analysis.
- Versioned improved content and resume version history are part of the resume subsystem.

### Adaptation and matching

- Resume-to-mission matching and adaptation are separate but related workflows.
- Matching produces structured suitability data.
- Adaptation uses mission context plus matching analysis to generate an adapted resume output.
- Resume adaptations are persisted as dedicated records rather than transient responses only.

### Export

- Resume export is a visible user-facing capability.
- PDF and DOCX generation depend on the dedicated PDF server and template system.

### Template extraction

- Templates can be extracted from uploaded CV files.
- There are both HTML-based and vision-based extraction paths.
- Template extraction is itself an AI-driven workflow.

## Important Facts

- Core resume workflows are a mix of synchronous requests and asynchronous jobs.
- The backend separates resume CRUD from specialized subflows such as AI modification, versions, uploads, and stats.
- The template system is tightly connected to resume export and presentation layers.

## Related

- [[topics/Batch Jobs and Long-Running Workflows]]
- [[topics/Upload OCR and Parsing Pipeline]]
- [[topics/Integrations]]
- [[topics/AI Credits]]
- [[topics/AI Timeouts]]
- [[topics/Product Scope and Priorities]]

## Sources

- [[raw/sources/2026-04-16-functional-workflows]]
- [[raw/sources/2026-04-16-product-scope-priorities]]
