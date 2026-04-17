# Source Note: OCR and LLM Technical Docs

## Scope

Repository documents inspected:

- `C:\Users\mail\CascadeProjects\ResumeConverter\server\OCR_PIPELINE.md`
- `C:\Users\mail\CascadeProjects\ResumeConverter\server\DOCUMENT_PROCESSING_LIMITS.md`
- `C:\Users\mail\CascadeProjects\ResumeConverter\server\config\LLM_GOVERNANCE.md`

## OCR Documentation Highlights

- `server/OCR_PIPELINE.md` documents the current OCR module split and is a high-signal technical source.
- The extraction order is explicitly:
  1. native PDF text
  2. scanned-page detection
  3. CLI OCR when available
  4. variant scoring
  5. embedded-image exploration
  6. advanced OCR backend only when needed
- `OCR_ADVANCED_BACKEND` defaults to `paddleocr`.
- The design rule in the doc is to keep OCR logic inside focused services rather than letting `pdfTextExtraction.service.js` grow back into a monolith.

## Document Limits Highlights

- `server/DOCUMENT_PROCESSING_LIMITS.md` is a precise technical source for current upload/extraction/export limits.
- Important limits documented there include:
  - JSON / URL-encoded body limit: `50mb`
  - extraction upload size: `50 MB`
  - template extraction upload size: `10 MB`
  - batch import max files: `200`
  - batch import total request size: `250 MB`
  - batch export synchronous max resumes: `100`
  - max PDF page count: `50`
  - max scanned pages sent to OCR: `10`
  - OCR page time budget: `20,000 ms`

## LLM Governance Highlights

- `server/config/LLM_GOVERNANCE.md` documents the prompt/contract governance model.
- Each prompt is expected to have:
  - `id`
  - `version`
  - `domain`
  - `operation`
  - `contractId`
- Each contract is expected to have:
  - `id`
  - `version`
  - `validatorModule`
  - `validatorExport`
- The current doc explicitly says semantic prompt changes should bump prompt version and JSON-structure changes should bump contract version.
- The doc also notes current limits:
  - no DB persistence of prompt versions
  - no guaranteed recording of actual prompt version used per execution across all flows
  - no automatic migration of user-customized prompts

## Related

- [[topics/Upload OCR and Parsing Pipeline]]
- [[topics/Operational Limits Matrix]]
- [[topics/LLM Control Plane]]
- [[topics/Observability and Quality]]

