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
   - Up to the first three PDF pages are now scanned with `pdfjs-dist` to choose the best candidate page for structured layout extraction.
   - Text items are normalized into positioned lines.
- Lines are split heuristically into:
  - header
  - content
  - footer
- Header/footer recovery is no longer based only on fixed top/bottom page ratios:
  - contiguous top or bottom text blocks can extend slightly beyond the default ratio cutoffs and still stay in the header/footer region
  - repeated top/bottom lines observed across the first pages are promoted into header/footer hints, which helps recover recurring cabinet branding and pagination
   - The page selected as the layout source is the densest candidate among the first pages, based on structured text and line metrics.
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
- The extraction post-processor now also preserves image and CSS fidelity explicitly:
  - detected `template-image-slot` blocks are hydrated with extracted document images when available
  - the final template stylesheet is merged with the structured-layout stylesheet recovered upstream, so layout CSS is not lost when the LLM returns a sparse or overly generic stylesheet
  - when structured layout fragments are available, the final extracted template is now re-based on those fragments so the returned HTML keeps the same `template-region-*` classes as the recovered stylesheet
  - this prevents a recurring mismatch where the stylesheet was present but the final HTML had drifted to unrelated LLM-generated classes

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
   - for the user-facing template-extraction workflow, layout-based extraction is now strict:
     - if LLM normalization fails on a structured layout extraction, the request fails instead of silently returning a deterministic fallback template
     - the API is expected to surface a clear error and diagnostics rather than a degraded template

6. Placeholder enforcement
   - Backend post-processing ensures the final body still contains:
     - `-name-`
     - `-title-`
     - `-content-`
   - If the model omits one, a bounded fallback block is inserted.
   - When structured layout fragments are available, placeholder enforcement is now layout-driven instead of LLM-body-driven:
     - the backend parses the recovered `template-region-(header|content|footer)-line-*` blocks
     - it scores the strongest identity lines from the recovered CSS metrics (`font-size`, `top`, `left`)
     - the most prominent line becomes `-name-`
     - the next strongest line becomes `-title-`
     - the next content-region line becomes the unique `-content-` anchor
   - Non-assigned recovered text lines are blanked while keeping the original positioned boxes and CSS classes.
   - This keeps the recovered `template-region-*` HTML/CSS alignment intact instead of letting LLM-generated markup drift away from the recovered stylesheet.

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
  - The extraction path now requests the same standard backend LLM timeout as the rest of the business IA stack on both HTML and vision branches:
    - `LLM_OPERATION_TIMEOUT_MS` (15 minutes by default)
    - no extraction-specific 120-second timeout remains in the service layer

10. Error contract
- The extraction endpoint is expected to answer in JSON, including upload failures.
- The frontend extraction client now sends `Accept: application/json` explicitly.
- The frontend no longer assumes that every non-2xx response is JSON:
  - HTML error pages from proxy/auth/static fallbacks are converted into a readable error message
  - invalid non-JSON success payloads are rejected as an invalid extraction response instead of surfacing `Unexpected token <`
- This hardens the extraction modal against infrastructure or middleware responses that bypass the normal API payload shape.
- A distinct frontend-only failure mode also exists after deployments:
  - extraction may complete successfully on the backend
  - the subsequent navigation to the template editor can fail if the browser still holds an older app shell and tries to lazy-load a now-missing hashed JS chunk
  - the lazy page loader now attempts a one-time full reload on recoverable dynamic-import chunk failures to recover from stale asset references without turning the extraction into a dead-end

## Failure Model

- Primary path:
  - `PDF -> layout HTML/CSS -> sanitized fragments -> LLM`
- Office path:
  - `DOC/DOCX -> LibreOffice PDF -> layout HTML/CSS -> sanitized fragments -> LLM`
- The template-extraction route no longer degrades silently to:
  - vision fallback
  - text-only fallback
  - deterministic layout fallback after LLM failure
- If the structured PDF layout is too sparse or the layout/LLM phase fails, the API now returns a clear `422` extraction error with a machine-readable code and diagnostic details.
- Example failure reasons now surfaced by the route:
  - `TEMPLATE_LAYOUT_TOO_SPARSE`
  - `TEMPLATE_LAYOUT_EXTRACTION_FAILED`

## Important Facts

- Template extraction is now biased toward deterministic preprocessing rather than pure model inference.
- The first page is treated as the canonical style carrier for template extraction.
- This heuristic has been softened:
  - the first pages are compared
  - the best candidate page becomes the source page for layout extraction
  - the selected page number is now returned in extraction metrics as `sourcePageNumber`
- DOCX-specific media and style hints are still harvested when possible, then merged into the PDF-centered path.
- DOCX style harvesting is now broader than `word/styles.xml` alone:
  - `word/theme/theme1.xml` is parsed for theme colors such as `accent1`, `accent2`, and related palette entries
  - `word/fontTable.xml` and `word/document.xml` are scanned for declared font families that do not always appear in the styles part
  - this richer DOCX style context is merged with the structured PDF layout styles before LLM normalization
- The text pre-extraction helper in `server/routes/templates/extraction/pdfExtractionHelpers.js` must support both old callable `pdf-parse` exports and the newer `pdf-parse@2.x` class-based API:
  - recent installed versions can expose `PDFParse` instead of a callable default export
  - the compatibility layer now instantiates `new PDFParse({ data: buffer })`, calls `getText()`, and destroys the parser
  - without this adapter, template extraction logs `pdf-parse module does not expose a callable parser` and falls back immediately to the `pdfjs-dist` path
- Extracted images are now intended to survive into the saved template itself, not only into diagnostics:
  - placeholder logos are no longer expected to survive in the final stored template when an extracted image is available
  - detected image slots can now be filled with extracted image data URLs in sequence
- A stricter asset-fidelity rule now applies to layout-based extraction:
  - if a structured PDF layout is available, the final template HTML is re-based on that layout fragment structure
  - `template-region-*` classes from the detected layout are preserved in the final returned header/body/footer
  - extracted logo/image content is embedded directly as `data:image/...;base64,...` in the stored HTML rather than left as `-logo-`
- The deterministic fallback path has also been upgraded:
  - it now starts from recovered `headerHtml`, `contentHtml`, and `footerHtml` instead of immediately collapsing them to generic blocks
  - if the recovered fragments are too simple or lack structured line classes, the fallback still strips raw text and re-injects the required placeholders conservatively
  - header image regions still promote a logo slot that is then hydrated with the first extracted image when available
- The final template CSS is no longer treated as LLM-only truth:
  - source layout CSS from the structured extractor is merged back into the final stylesheet
  - shared asset rules are appended so embedded extracted images render correctly inside hydrated image slots
- The structured PDF builder now derives more of the visual baseline directly from the source page instead of forcing generic defaults:
  - per-line text color is preserved when available from the PDF text items
  - the page-level `font-family` is derived from the dominant extracted font instead of hardcoded `Arial`
  - the page background color is inferred from the largest recovered visual block when it plausibly represents the page chrome
  - the extracted color palette now blends text colors and visual-block fills instead of reporting only rectangle fills
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
- The handoff from extraction preview to template creation now also marks the `templates` / `administration` view-refresh scopes dirty on the frontend:
  - successful extraction marks the template list as stale
  - creating a draft-from-extraction marks it again before navigating to `/admin/templates/new?fromExtraction=true`
  - this ensures the templates dashboard refreshes when the user returns
- Confidence is still part of successful extraction responses, but degraded fallback methods are no longer considered acceptable output for this workflow.
- The extraction result now carries enough intermediate state to diagnose bad output without replaying the whole extraction job.
- PDF layout recovery now includes a lightweight pass over PDF drawing operators to recover:
  - large filled rectangles that likely represent section backgrounds or separators
  - image paint regions that approximate logo and illustration placement
- The layout builder now also uses limited multi-page repetition to improve header/footer detection:
  - up to the first three pages are scanned for repeated top-region and bottom-region lines
  - those repeated lines feed region hints for the first-page structured template
- The vision fallback no longer depends on a browser runtime:
  - no `puppeteer` launch
  - no browser-side PDF rendering step
  - fewer environment-specific failures when only the PDF-to-HTML pipeline is needed
- A concrete observed failure mode is now documented:
  - some PDFs reach stable layout extraction in under a second
  - but the downstream provider-normalization step can still fail because of upstream provider instability or provider-side rate limiting
  - for this extraction workflow, that provider failure is now surfaced directly to the operator instead of being hidden behind a degraded fallback result
- Another concrete failure mode is now documented:
  - global PDF text extraction can succeed while structured layout extraction remains sparse
  - this typically means `pdfjs` sees enough raw text somewhere in the document, but not enough positioned text on the selected layout page
  - extraction errors now surface both values:
    - global extracted PDF text length
    - structured layout text length
  - this helps distinguish “document really poor” from “layout extractor under-detected the document”
- A separate runtime failure mode also exists at the `pdfjs-dist` boundary:
  - if the server-side API bundle and the resolved worker bundle are on mismatched versions, layout extraction fails before any document analysis
  - the dependency tree is now forced to a single `pdfjs-dist` version (`5.5.207`), including the copy transitively requested by `pdf-parse`
  - the server helper now pins `GlobalWorkerOptions.workerSrc` to the exact `pdf.worker.mjs` resolved from that same installed package, so API code and worker come from one canonical source
- The frontend extraction flow is now resilient to non-JSON responses and should surface an actionable error instead of a raw JSON parse failure.
- The final extracted template body is now intentionally opinionated:
  - candidate identity collapses to `-name-`
  - candidate role collapses to `-title-`
  - the rest of the resume body collapses to `-content-`
- This placeholder collapse is now applied without discarding the recovered positional wrappers when the upstream PDF layout extractor produced structured fragments.
- Header/footer branding can remain when it represents template chrome rather than candidate content.
- The admin template editor must keep extracted HTML/CSS as raw markup:
  - `client/src/pages/NewTemplatePage.tsx` now edits header/body/footer with plain `textarea` fields
  - the extracted HTML is no longer reparsed through Tiptap, which previously flattened or rewrote layout structure
- Frontend preview sanitization now explicitly allows `data:image/...;base64,...` URIs so extracted inline logos remain visible in preview frames.
- A previous source of poor visual fidelity was the structured PDF builder itself:
  - it used to set `.template-page` defaults such as white background, black text, and Arial even when the source PDF suggested otherwise
  - it now biases toward recovered page and line styles first, and only falls back when no source signal exists
- Another previous source of poor visual fidelity on some PDFs was the text-color boundary inside `pdfjs`:
  - `getTextContent()` can expose positioned text items with no item-level `color`
  - the source `operatorList` can still contain the real text paint changes immediately before `showText`
  - the structured builder now reconstructs missing text colors from that operator stream before grouping items into lines
  - this lets the recovered stylesheet preserve cases such as:
    - white text over colored header blocks
    - colored section titles
    - black body text
- The preferred PDF extraction engine is no longer conceptually tied to `pdfjs`:
  - the pipeline now prefers MuPDF via `mutool` when available
  - MuPDF is used to generate higher-fidelity page HTML and structured JSON from the source PDF page
  - this HTML/CSS payload now feeds the downstream LLM template-normalization path before the legacy `pdfjs` builder is considered
  - the current MuPDF integration is intentionally narrow:
    - extract HTML
    - extract stylesheet
    - extract colors and fonts
    - compute basic text-density metrics
  - if `mutool` is unavailable at runtime, the extractor still falls back to the existing `pdfjs` layout path instead of failing immediately
- Operationally, MuPDF now adds an explicit runtime dependency:
  - Docker installs `mupdf-tools`
  - the backend resolves the command from `MUPDF_COMMAND` (default `mutool`)
- The current MuPDF path improves source fidelity, but region semantics are still transitional:
  - `header/content/footer` splitting remains stronger on the legacy `pdfjs` heuristics
  - MuPDF is currently used first as a higher-fidelity HTML/CSS producer, not yet as the full semantic region engine
- Semantic palette derivation is now less naive:
  - background is derived separately from the largest credible page visual block
  - accent selection excludes the page background
  - secondary text color can still come from real text colors even when it matches a light page background in isolation
- A previous source of poor structural fidelity on multi-page CV PDFs was the candidate-page selector:
  - it used to choose the densest page among the first pages
  - this could pick a narrative continuation page (for example a `PARCOURS PROFESSIONNEL` page) instead of the first-page visual template carrier
  - the selector now computes a `templateScore` per candidate page and biases toward template-like first pages:
    - strong bonus for page 1
    - reward for short identity-like header lines and top-of-page template signals
    - penalty for oversized headers, date/project-style narrative header lines, bullet-heavy content, and continuation-page style narrative density
  - candidate-page diagnostics now expose `templateScore` and `templateSignals` for each scanned page
- A previous source of poor DOCX fidelity was the DOCX asset parser:
  - it used to scan only `word/styles.xml` with shallow regexes
  - it now resolves theme palette references and a broader font set from the DOCX package parts before the Word-to-PDF normalization step

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
