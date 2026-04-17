# Template Extraction Pipeline

## Summary

Template extraction now follows a hybrid pipeline centered on deterministic PDF layout recovery before any LLM normalization.

## Current State

- Entry route: `POST /api/templates/extract-from-cv`
- Supported inputs:
  - PDF
  - DOCX
  - DOC
- Main implementation files:
  - `server/routes/templates/extraction/handlers.js`
  - `server/routes/templates/extraction/extractors.js`
  - `server/routes/templates/extraction/pdfLayoutTemplateBuilder.js`
  - `server/services/templateExtraction.service.js`

## Pipeline

1. File validation
   - PDF uses binary signature validation.
   - DOCX uses strict OOXML validation with `[Content_Types].xml`, `_rels/.rels`, and a declared main document part.
   - DOC uses legacy OLE signature validation.

2. Source normalization
   - PDF enters the layout pipeline directly.
   - DOCX and DOC are first converted to PDF through LibreOffice using `convertWordBufferToPdfBuffer(...)`.
   - This means non-PDF sources now share the same downstream layout recovery path as PDFs.

3. PDF to structured layout
   - The first PDF page is parsed with `pdfjs-dist`.
   - Text items are normalized into positioned lines.
   - Lines are split heuristically into:
     - header
     - content
     - footer
   - A CSS-backed intermediate HTML representation is generated:
     - `pageHtml`
     - `headerHtml`
     - `contentHtml`
     - `footerHtml`
     - `stylesheet`

4. Sanitization
   - Generated HTML fragments are sanitized with `sanitizeDocumentHtmlContent(...)`.
   - Generated CSS is sanitized with `sanitizeDocumentStylesheet(...)`.
   - LLM output is sanitized again before returning the extracted template.

5. LLM normalization
   - The LLM no longer starts from a raw binary or document view only.
   - It receives:
     - full intermediate HTML
     - pre-split header/content/footer fragments
     - extracted stylesheet
     - extracted image context
     - extracted style hints when available
   - The LLM's job is mainly to:
     - remove personal data
     - preserve style and layout intent
     - produce reusable placeholders
   - output the final template JSON
   - if this LLM normalization fails while a good PDF layout is already available, the server now falls back to a deterministic layout-based template instead of failing the extraction outright

6. Placeholder enforcement
   - Backend post-processing ensures the final body still contains:
     - `-name-`
     - `-title-`
     - `-content-`
   - If the model omits one, a bounded fallback block is inserted.
   - Backend post-processing now also strips candidate-specific text that the model may still leak into the template body:
     - first visible identity block is normalized to `-name-`
     - next visible role/title block is normalized to `-title-`
     - remaining visible CV text is removed so the reusable body collapses to the structural placeholder `-content-`
   - This means the extraction contract no longer relies only on prompt compliance; the server forcibly normalizes the returned HTML into a reusable template shape.

7. Review metadata
   - The extracted template now carries:
     - `extractionConfidence`
     - `extractionReview`
   - `extractionConfidence` contains:
     - numeric score
     - qualitative level (`low`, `medium`, `high`)
     - reasons
   - `extractionReview` contains:
     - extraction method
     - text length
     - image count
     - layout metrics
     - intermediate `headerHtml`, `contentHtml`, `footerHtml`, and layout stylesheet when available
   - These metadata are exposed to the frontend so weak extractions can be reviewed before template reuse.

8. Operator review and correction
   - The extraction modal no longer stops at a static preview.
   - Operators can now edit, before creation:
     - template name
     - description
     - final header HTML
     - final body HTML
     - final footer HTML
     - final stylesheet
   - The modal can also re-apply the detected structural fragments directly from `extractionReview`.
   - The edited result is what gets transferred into the template-creation page.

9. AI governance and crediting
   - Template extraction is an AI-governed action, not an unmetered side path.
   - The route reserves credits through the same AI credit framework used by other business operations, under action type `template.extract`.
   - The action cost and max-token budget are configurable through the canonical LLM settings surface:
     - `aiCreditTemplateExtract`
     - `aiMaxTokensTemplateExtract`
   - The underlying LLM calls are now tagged with explicit operation types so provider-gateway logs and runtime classification stay aligned with other AI actions.
   - The extraction path also benefits from the standard backend LLM timeout floor:
     - the extraction service still passes its own shorter HTML normalization timeout value for local intent and logging
     - but the shared LLM facade now clamps legacy `callLLM` / `callLLMWithVision` requests to at least the platform-wide `LLM_OPERATION_TIMEOUT_MS` baseline (15 minutes), matching other LLM business flows

10. Error contract
   - The extraction endpoint is expected to answer in JSON, including upload failures.
   - The frontend extraction client now sends `Accept: application/json` explicitly.
   - The frontend no longer assumes that every non-2xx response is JSON:
     - HTML error pages from proxy/auth/static fallbacks are converted into a readable error message
     - invalid non-JSON success payloads are rejected as an invalid extraction response instead of surfacing `Unexpected token <`
   - This hardens the extraction modal against infrastructure or middleware responses that bypass the normal API payload shape.

## Fallback Model

- Primary path:
  - `PDF -> layout HTML/CSS -> sanitized fragments -> LLM`
- Office path:
  - `DOC/DOCX -> LibreOffice PDF -> layout HTML/CSS -> sanitized fragments -> LLM`
- Layout failure handling:
  - if layout recovery succeeds but LLM normalization fails or times out, a deterministic fallback template is generated from the recovered layout fragments
  - this fallback preserves:
    - stylesheet hints
    - header/footer structure with text stripped
    - `-logo-` in the header when an image region is detected there
    - the reusable body placeholder contract `-name-`, `-title-`, `-content-`
- If structured PDF layout is too sparse:
  - fallback to vision extraction from a rendered first-page image
  - first-page image rendering is now done server-side with `pdfjs-dist` + `canvas`, not with `puppeteer`
- If vision also fails but plain text exists:
  - fallback to legacy text-only template extraction

## Important Facts

- Template extraction is now biased toward deterministic preprocessing rather than pure model inference.
- The first page is treated as the canonical style carrier for template extraction.
- DOCX-specific media and style hints are still harvested when possible, then merged into the PDF-centered path.
- The returned extraction method is now a meaningful runtime signal:
  - `office-pdf-layout-html`
  - `pdf-layout-html`
  - `pdf-vision-fallback`
  - `pdf-text-fallback`
- The frontend preview modal can now surface extraction confidence and the intermediate fragments used to build the template.
- The frontend preview modal now acts as a review workstation:
  - live preview of the corrected template
  - direct replacement of final fragments with detected ones
  - extraction diagnostics for text density, visual blocks, and image regions
- Confidence is now part of the extraction contract:
  - layout-based extraction trends higher when text density and section detection are strong
  - vision fallback is weaker than structural PDF recovery
  - text fallback is the least reliable path
- The extraction result now carries enough intermediate state to diagnose bad output without replaying the whole extraction job.
- PDF layout recovery now includes a lightweight pass over PDF drawing operators to recover:
  - large filled rectangles that likely represent section backgrounds or separators
  - image paint regions that approximate logo and illustration placement
- The vision fallback no longer depends on a browser runtime:
  - no `puppeteer` launch
  - no browser-side PDF rendering step
  - fewer environment-specific failures when only the PDF-to-HTML pipeline is needed
- A concrete observed failure mode is now documented:
  - some PDFs reach stable layout extraction in under a second
  - but the downstream provider-normalization step can still fail because of upstream provider instability or provider-side rate limiting
  - the deterministic layout fallback exists specifically to avoid turning that provider failure into a full extraction failure
- The frontend extraction flow is now resilient to non-JSON responses and should surface an actionable error instead of a raw JSON parse failure.
- The final extracted template body is now intentionally opinionated:
  - candidate identity collapses to `-name-`
  - candidate role collapses to `-title-`
  - the rest of the resume body collapses to `-content-`
- Header/footer branding can remain when it represents template chrome rather than candidate content.

## Improvement Ideas

- Recover vector shapes and block backgrounds from PDF operators, not only text positions.
- Persist layout metrics in diagnostics to compare extraction quality over time.
- Add a review UI that shows:
  - intermediate layout HTML
  - sanitized fragments
  - final normalized template
- Allow operator-side correction of detected `header/content/footer` boundaries before final template save.
- Replace approximate image-region recovery with image-content plus exact positioning where the PDF source makes it available.

## Related

- [[topics/Resume Presentation and Templates]]
- [[topics/PDF and Document Generation Boundary]]
- [[topics/Upload OCR and Parsing Pipeline]]
- [[topics/Observability and Quality]]

## Sources

- `server/routes/templates/extraction/handlers.js`
- `server/routes/templates/extraction/extractors.js`
- `server/routes/templates/extraction/pdfLayoutTemplateBuilder.js`
- `server/services/templateExtraction.service.js`
