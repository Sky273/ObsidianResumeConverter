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
- The resume-improvement runtime path is now also split:
  - `server/services/openai/resumeOperations.js` keeps the public `improveResume(...)` entrypoint
  - `server/services/openai/resumeImprovement.service.js` owns the improvement-specific provider call, JSON parse/retry path, and fallback handling

### Adaptation and matching

- Resume-to-mission matching and adaptation are separate but related workflows.
- Matching produces structured suitability data.
- Adaptation uses mission context plus matching analysis to generate an adapted resume output.
- Resume adaptations are persisted as dedicated records rather than transient responses only.
- The mission-matching runtime path is now less entangled:
  - `server/services/openai/missionOperations.js` keeps the public workflow entrypoints
  - `server/services/openai/missionMatching.service.js` owns the matching-specific provider call, compact-retry, JSON parse/validation, normalization, and metrics/logging path
- The mission-adaptation runtime path now mirrors that split:
  - `server/services/openai/missionOperations.js` keeps the public `adaptResumeToMission(...)` entrypoint
  - `server/services/openai/missionAdaptation.service.js` owns the adaptation-specific provider call, JSON parse/validation path, and plain-text fallback handling
- The resume-analysis runtime path now follows the same split:
  - `server/services/openai/resumeOperations.js` keeps public workflow entrypoints such as `analyzeResume(...)`, `preAnalyzeResumeText(...)`, and `improveResume(...)`
  - `server/services/openai/resumeAnalysis.service.js` owns the analysis-specific JSON request/retry/repair/salvage pipeline

### Export

- Resume export is a visible user-facing capability.
- PDF and DOCX generation depend on the dedicated PDF server and template system.

### Template extraction

- Templates can be extracted from uploaded CV files.
- There are both HTML-based and vision-based extraction paths.
- Template extraction is itself an AI-driven workflow.
- The template-extraction service is now less monolithic:
  - `server/services/templateExtraction.service.js` keeps the public HTML/vision orchestration entrypoints
  - `server/services/templateExtractionPrompt.service.js` owns prompt assembly for HTML and vision calls
  - `server/services/templateExtractionFallback.service.js` owns placeholder normalization, sanitization of returned fragments, and deterministic layout fallback construction
- The LLM text utility layer is less mixed between generic parsing and resume-specific salvage:
  - `server/services/openai/textUtils.js` now keeps generic text, HTML, and JSON parsing helpers
  - `server/services/openai/resumeAnalysisTextSalvage.service.js` owns the degraded non-JSON resume-analysis salvage path and its metadata construction
- The OpenAI normalization/contract layer is also less entangled:
  - `server/services/openai/contracts.js` keeps the public payload validators
  - `server/services/openai/contracts.keywordEvidence.js` owns keyword-evidence normalization, scoring, and categorization
  - `server/services/openai/resumeNormalization.js` keeps the resume/improvement orchestration entrypoints
  - `server/services/openai/resumeNormalizationCollections.js` owns tag-array and suggestion normalization helpers shared by analysis/improvement flows

## Important Facts

- Core resume workflows are a mix of synchronous requests and asynchronous jobs.
- The backend separates resume CRUD from specialized subflows such as AI modification, versions, uploads, and stats.
- `server/services/resumes.service.js` is now slightly less entangled internally:
  - executor resolution, string sanitation, and dynamic update-statement building have been moved into `server/services/resumesPersistence.service.js`
  - the main service still owns cache invalidation and higher-level workflow semantics
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
