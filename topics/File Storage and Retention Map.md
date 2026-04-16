# File Storage and Retention Map

## Summary

ResumeConverter mixes durable database truth with filesystem artifacts that are intentionally temporary. This note captures where important files live and which layer is expected to clean them up.

## Main Storage Root

- `UPLOAD_DIR` is the main managed filesystem root for uploaded and derived files.
- The backend explicitly rejects `UPLOAD_DIR` if it points to the filesystem root.

This is important because cleanup and sharing logic assume a bounded managed tree.

## Main File Families

### User uploads

- original uploaded resume files live under `UPLOAD_DIR`
- they are part of the ingestion pipeline, but not all uploaded files are meant to live forever as loose temp files

### Batch-job staging

- batch-job upload staging lives under `UPLOAD_DIR/batch-jobs`
- this area supports long-running import/improve/adapt/export flows

### Shared PDFs

- public shared PDFs live under `UPLOAD_DIR/shared`
- the share service treats this as a managed directory with path validation
- share records also live in the `resumes` table through token/path/expiry fields

### Temp exports

- batch export artifacts are created outside the main upload tree in a managed temp/export location
- these are explicitly treated as ephemeral outputs

### OCR temp artifacts

- OCR helpers create temporary artifacts with prefixes such as `resume-ocr-` and `resume-word-ocr-`
- they are not product truth; they are pipeline by-products

## Durable Truth vs File Artifacts

The durable truth usually lives in PostgreSQL:

- resume metadata and extracted fields
- share tokens and expiry fields
- batch job state and export references
- version/adaptation/submission history

The filesystem mostly stores:

- raw uploads
- staged processing inputs
- temporary OCR intermediates
- shared/generated documents
- bulk export artifacts

## Retention Model

The cleanup layer currently uses explicit TTL families:

- uploads: 1 hour
- server temp files: 1 hour
- batch-job uploads: 24 hours
- batch exports: 7 days
- shared PDFs: TTL aligned with share-link expiry
- OCR temp artifacts: daily cleanup with their own max-age policy

## Share-Specific Safety Model

- shared PDFs are only served if the resolved path stays inside the managed shared directory
- expired share artifacts are deleted and their DB references are nulled out
- path validation is part of the share security model, not just cleanup hygiene

## Practical Reading

- If a file is missing, first decide whether it was meant to be durable or temporary.
- If a share token exists but the file does not, inspect share-artifact cleanup and expiry handling.
- If a batch export disappears after some time, treat that as retention behavior unless evidence says otherwise.

## Related

- [[topics/Maintenance and Cleanup Jobs]]
- [[topics/Upload OCR and Parsing Pipeline]]
- [[topics/PDF and Document Generation Boundary]]
- [[topics/Data Persistence Map]]

## Sources

- [[raw/sources/2026-04-16-storage-dashboards-and-resume-model]]
