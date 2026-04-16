# Product Scope and Priorities

## Summary

ResumeConverter should be managed as a resume-and-matching product first, with several secondary modules treated as extensions instead of core roadmap drivers.

## Core Product Nucleus

- CV management and parsing
- CV analysis, improvement, and adaptation
- profile / mission matching
- mission management
- candidate submission pipeline
- minimal client and firm management needed for matching

## Support Capabilities To Maintain

- authentication and session security
- 2FA
- OCR and document extraction
- document templates
- PDF and DOCX export
- observability, health, metrics, APM
- backup and restore

## Secondary Scope

These modules add value but should remain secondary:

- market radar
- trend collection
- advanced ROME references
- deals
- generic comments
- public sharing
- advanced GDPR audit and consent workflows
- broader mail integrations

## Decision Rule

Before prioritizing a new feature, ask:

1. does it improve the CV -> analysis -> matching -> submission loop?
2. does it reduce operational or regulatory risk on that loop?
3. does it reduce meaningful support cost?

If not, it is secondary or should be deferred.

## Technical Consequences

- isolate secondary modules behind dedicated services and routes
- avoid expanding core validation and workflow layers for peripheral concerns
- keep stronger automated coverage on the core nucleus than on extensions

## Related

- [[topics/Application Surface]]
- [[topics/Architecture]]
- [[entities/ResumeConverter]]

## Sources

- [[raw/sources/2026-04-16-product-scope-priorities]]
