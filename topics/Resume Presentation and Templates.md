# Resume Presentation and Templates

## Summary

ResumeConverter does not stop at content analysis. It also owns resume presentation: templates, export rendering, shareable PDFs, and extraction of reusable templates from source CVs.

## Template Management

- Templates have CRUD routes and dedicated admin pages.
- Admin workspace exposes template management as a first-class function.
- Templates are part of the product surface, not an implementation detail of PDF export.

## Template Extraction

- The app can extract a reusable template from uploaded CV files.
- DOCX-oriented extraction uses HTML plus embedded styles and images.
- PDF-oriented extraction uses vision analysis.
- The target is a normalized template structure containing:
  - `headerContent`
  - `templateContent`
  - `footerContent`
  - `stylesheet`
  - footer height
  - tags
  - extracted colors and fonts
- The extraction logic aims to preserve layout style while removing personal data and collapsing the body into reusable placeholders such as `-name-`, `-title-`, and `-content-`.

## Export and Rendering

- Resume export depends on a dedicated PDF server, not only on the main Express app.
- The PDF server is an internal service guarded by an internal token and timeout/concurrency limits.
- Export includes PDF generation from HTML and likely document-style rendering for improved/adapted resumes.

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
- [[topics/Header Size Budget]]
- [[topics/Integrations]]
- [[topics/Docker Environment]]
- [[topics/Security and Compliance]]

## Sources

- [[raw/sources/2026-04-16-functional-workflows]]
- [[raw/sources/2026-04-16-domain-model-and-control-plane]]
