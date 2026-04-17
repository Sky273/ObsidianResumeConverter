# Upload OCR and Parsing Pipeline

## Summary

ResumeConverter has a real document-ingestion pipeline rather than a single naive "upload and parse" step.

The exact path depends on:

- file type
- file validity
- whether native extraction yields enough text
- whether OCR fallbacks are available in the runtime

## Main Entry Points

Resume text extraction routes:

- `POST /api/resumes/extract-doc`
- `POST /api/resumes/extract-pdf`

These routes are authenticated and rate-limited, and they operate on one uploaded file per request.

## Common Upload Gate

Before deep extraction, the upload layer enforces:

- file-size limits
- single-file constraint
- extension/MIME coherence
- temporary disk staging under the configured upload directory
- cleanup of temp files after success or failure

This means extraction does not operate directly on arbitrary in-memory browser payloads.

## PDF Extraction Path

Typical PDF flow:

1. upload PDF to temp storage
2. validate file signature
3. acquire a per-user extraction slot
4. load the PDF
5. inspect each page for text-vs-scanned characteristics
6. extract structured text directly when the page already contains usable text
7. fall back to OCR for scanned or low-text pages
8. normalize and clean extracted text
9. record metrics and release the extraction slot

Important properties:

- per-user concurrency is bounded
- OCR is page-aware rather than always-on
- extracted text is cleaned before returning to the caller

## OCR Decision Model

The pipeline does not OCR every PDF page blindly.

It uses a heuristic approach:

- pages with usable embedded text stay on the native extraction path
- pages that appear scanned go through OCR
- if the whole document still yields too little text, the service can force a broader OCR pass

This matters because OCR is expensive and noisier than native text extraction.

## OCR Runtime Model

The OCR stack is layered:

- preferred runtime uses native binaries such as `tesseract`, `pdftoppm`, and `pdfimages`
- OCR variants and scoring heuristics try multiple render/recognition strategies
- advanced OCR backend support is enabled by default through `OCR_ADVANCED_BACKEND=paddleocr`
- JavaScript OCR exists as part of the service stack, but the best-quality path is still the native-tool chain

The vault should remember that OCR quality and throughput are strongly environment-dependent.

Important runtime consequence:

- the advanced OCR layer is now opt-out rather than opt-in
- if Python or the advanced backend is unavailable, the extraction path degrades to CLI OCR and then to `tesseract.js`
- this default favors extraction quality over minimum runtime dependency footprint
- the repo’s focused OCR doc (`server/OCR_PIPELINE.md`) explicitly treats `pdfTextExtraction.service.js` as a document-level wrapper that should not grow back into a monolith

## Word Extraction Path

Typical DOC/DOCX flow:

1. upload Word file to temp storage
2. validate signature/archive integrity
3. attempt native text extraction first
4. if enough text is obtained, return it directly
5. if too little text is obtained and `soffice` is available:
   - convert Word to PDF
   - reuse the PDF OCR pipeline

Important consequence:

- Word extraction is not a wholly separate world; its fallback path converges into the PDF OCR pipeline

## Native Word Extraction

The current native extraction shape is:

- `mammoth` for DOCX raw text
- DOC handling via `word-extractor`, with fallback logic

This means good DOCX input can often avoid OCR entirely.

## Cleaning and Normalization

After extraction, the text is cleaned before response.

This is important because the output exposed to the rest of the app is not simply the raw OCR/native payload; it is a normalized text layer better suited for later AI analysis or persistence.

Important caveat from code inspection on 2026-04-16:

- the current extraction cleanup stack repairs mojibake and normalizes whitespace/newlines, but it does not explicitly strip `U+0000` / NUL characters
- the resume import path later persists extracted text and analysis JSON directly to PostgreSQL
- PostgreSQL text/json columns reject embedded NUL bytes with `invalid byte sequence for encoding "UTF8": 0x00`
- there is already a backend sanitizer utility that removes NUL characters, but the resume import/analyze persistence path is not wired through it

Operational consequence:

- malformed PDFs, OCR output, legacy DOC files, or even provider-returned strings that contain `\u0000` can fail late during persistence rather than earlier during extraction

Current mitigation from 2026-04-16:

- the persistence boundary now strips NUL characters on resume writes and batch-item pending payload writes
- this mitigation lives at the DB service layer rather than inside OCR extraction itself, so it also covers provider-returned strings such as resume names, titles, and pending manual-review payloads

## Metrics and Diagnostics

The upload/extraction flow records metrics for:

- upload activity
- OCR activity
- page count
- OCR usage
- average OCR confidence
- extraction time
- primary OCR engine/variant details when available

This makes extraction a diagnosable subsystem rather than a black box.

## Effective Limits

The dedicated processing-limits doc is the sharpest source for current enforced boundaries. High-signal limits include:

- extraction upload size: `50 MB`
- one uploaded file per direct extraction request
- max PDF page count: `50`
- max scanned pages sent to OCR: `10`
- max render pixel budget per page: `20,000,000`
- max OCR variants explored per page: `18`
- max OCR time budget per page: `20,000 ms`
- max embedded images explored per page: `4`
- template extraction upload size: `10 MB`
- batch import max files: `200`
- batch import total upload size: `250 MB`

## Failure Patterns

### PDF extraction refused immediately

First suspects:

- invalid signature
- file too large
- per-user extraction concurrency limit reached

### PDF returns too little text

First suspects:

- scanned content beyond OCR thresholds
- OCR runtime missing or degraded
- poor-quality scan

### Word extraction works locally but not elsewhere

First suspects:

- `soffice` unavailable in the target environment
- runtime differences in native Word extraction or OCR fallback availability

## Design Rule For Future Changes

If a change touches ingestion, document:

1. where validation happens
2. whether it changes native extraction vs OCR fallback behavior
3. whether it affects temp-file staging or cleanup
4. whether it changes metrics or diagnostic visibility

## Related

- [[topics/Core Resume Workflows]]
- [[topics/Operational Limits Matrix]]
- [[topics/Integrations]]
- [[topics/Metrics and Diagnostics]]

## Sources

- [[raw/sources/2026-04-16-upload-limits-and-email-flows]]
- [[raw/sources/2026-04-17-ocr-and-llm-docs]]
