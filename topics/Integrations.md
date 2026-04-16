# Integrations

## Summary

ResumeConverter relies on multiple external providers and platform integrations across AI, payments, documents, scheduling, and market data.

## Main Integration Families

### AI providers

- OpenAI
- Anthropic
- DeepSeek
- GLM
- MiniMax
- Hugging Face
- Ollama
- Gemma via Gemini-compatible path

These are abstracted behind configuration, provider routing, and capability-aware payload handling.

### Document generation and extraction

- dedicated PDF server
- Puppeteer
- Pandoc
- LibreOffice
- OCR stack for scanned documents

### Security and identity

- Google auth
- Turnstile
- 2FA / TOTP

### Commercial and finance

- Stripe credit pack purchases and webhook confirmation

### Scheduling and communication

- calendar integration
- mail and email template surfaces

### Data and market sources

- ROME
- market radar
- France Travail
- Adzuna

## Important Facts

- Integrations are not isolated from the core; many user-visible workflows depend directly on them.
- Provider configuration quality has direct product impact, especially for AI, PDF generation, and payments.
- The project includes both operational integrations and end-user feature integrations.
- OCR should be treated as a real integration layer:
  - preferred path uses system `pdftoppm` and `tesseract`
  - JavaScript OCR is a fallback, not the preferred quality path
- Stripe is coupled to the firm-credit ledger, not only to a standalone payment success page.

## Related

- [[topics/Core Resume Workflows]]
- [[topics/Email and Verification Flows]]
- [[topics/PDF and Document Generation Boundary]]
- [[topics/Admin and Operations]]
- [[topics/Architecture]]
- [[topics/Turnstile]]

## Sources

- [[raw/sources/2026-04-16-functional-workflows]]
- [[raw/sources/2026-04-16-codebase-structure]]
- [[raw/sources/2026-04-16-installation-and-bootstrap-docs]]
- [[raw/sources/2026-04-16-stripe-billing]]
