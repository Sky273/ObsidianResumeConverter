# Resume Presentation and Templates

## Summary

ResumeConverter does not stop at content analysis. It also owns resume presentation: templates, export rendering, shareable PDFs, and extraction of reusable templates from source CVs.

## Template Management

- Templates have CRUD routes and dedicated admin pages.
- Admin workspace exposes template management as a first-class function.
- Templates are part of the product surface, not an implementation detail of PDF export.
- The admin template editor now exposes raw HTML fragment fields as plain `textarea` controls with ids `headerContent`, `templateContent`, and `footerContent`.
- Replacing those fragment fields with a rich-text editor is a regression: it breaks the raw HTML contract expected by template extraction handoff, post-save reload fidelity, and Playwright CRUD coverage.
- E2E automation for template CRUD must target those textareas directly instead of looking for `.ProseMirror` editors on `NewTemplatePage`.

## Template Extraction

- The app can extract a reusable template from uploaded CV files.
- The target is a normalized template structure containing:
  - `headerContent`
  - `templateContent`
  - `footerContent`
  - `stylesheet`
  - footer height
  - tags
  - extracted colors and fonts
- The extraction logic aims to preserve layout style while removing personal data and collapsing the body into reusable placeholders such as `-name-`, `-title-`, and `-content-`.
- The current extraction path is now PDF-centered even for Office inputs:
  - DOC/DOCX are converted to PDF through LibreOffice
  - the first PDF page is transformed into structured HTML/CSS fragments
  - fragments are sanitized and split into header/content/footer before LLM normalization
  - sparse-layout PDFs fall back to vision, then text-only extraction if needed
- The extraction response now includes review metadata:
  - `extractionConfidence` for a score and level signal
  - `extractionReview` for method, metrics, and intermediate fragments
- This makes the feature inspectable from the UI instead of being a pure black-box normalization step.
- The extraction modal now supports pre-save operator correction of:
  - header
  - body
  - footer
  - stylesheet
- The final template-editing page must preserve raw extracted HTML and CSS fidelity:
  - template header/body/footer fragments can carry structural `div` trees, extracted `class` names, and inline `data:image/...;base64,...` sources
  - a rich-text editor that reparses arbitrary HTML into paragraph-oriented content is not acceptable for this surface because it destroys the extracted layout contract
  - the template editor therefore needs raw HTML editing semantics for these three fragments, with preview handled separately
- When the operator turns an extracted result into a saved template, the new template is now pre-assigned to the current authenticated user's `firmId` instead of defaulting to the global template scope.
- The extraction-to-template handoff waits for auth restoration before consuming the extracted payload from `sessionStorage`, so a slow `/api/auth/me` bootstrap does not accidentally create a global template with an empty `firm_id`.
- The PDF-centered extraction path also recovers coarse visual structure from the source PDF, including large background blocks and approximate image regions, so the generated template is less text-only than before.

## Export and Rendering

- Resume export depends on a dedicated PDF server, not only on the main Express app.
- The PDF server is an internal service guarded by an internal token and timeout/concurrency limits.
- Export includes PDF generation from HTML and likely document-style rendering for improved/adapted resumes.
- Export template rendering now understands the template placeholder `-logo-`:
  - on batch HTTP export
  - on batch-job worker export
  - on single resume/adaptation export and share flows built in the frontend
- During export, `-logo-` is replaced with the exporting cabinet's logo when the source resume/adaptation is associated with a firm that has a stored logo.
- The replacement prefers embedded binary logo data from `firms.logo_data`, producing a data URL in the rendered HTML so the PDF/DOCX generator does not depend on cookie-authenticated asset fetches.
- The single-export/share path now resolves the logo from the source resume's `firm_id` on the client side, fetches `/api/firms/:id/logo/image`, converts it to a `data:` URL, and injects the resulting `<img>` markup before sending HTML to the PDF/DOCX generator.

## Sharing

- Share routes support generation of a shareable PDF for a resume.
- Public access is token-based.
- The product also supports tokenized access to the original uploaded file.
- Share status and revoke operations exist, which makes sharing an operationally managed feature rather than a static link.

## Why This Layer Matters

- Template extraction, rendering, export, and sharing form a separate value stream:
  - ingest a resume
  - analyze/improve/adapt it
  - present it in a reusable or branded format
  - share it safely
- Failures in this area often involve the PDF server, internal auth headers, rendering timeouts, or template integrity rather than LLM logic alone.

## Related

- [[topics/Core Resume Workflows]]
- [[topics/PDF and Document Generation Boundary]]
- [[topics/Template Extraction Pipeline]]
- [[topics/Header Size Budget]]
- [[topics/Integrations]]
- [[topics/Docker Environment]]
- [[topics/Security and Compliance]]

## Sources

- [[raw/sources/2026-04-16-functional-workflows]]
- [[raw/sources/2026-04-16-domain-model-and-control-plane]]
