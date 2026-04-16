# Market Intelligence and Reference Data

## Summary

Beyond candidate processing, ResumeConverter includes a market/reference-data layer with market radar facts, trends, reference catalogs, and ROME métier data. This appears to support market awareness, sourcing, and contextual analysis rather than only resume storage.

## Market Radar

- Market radar is modularized into collection, facts, search, reference, and trends routes.
- Facts endpoints expose:
  - filtered fact queries
  - latest facts by type
  - keyword trends
  - regional comparisons
  - filter options
  - summaries
  - cache refresh
- The existence of cache refresh and bounded “all facts” responses shows the module is meant to serve richer UI exploration, not only raw ingestion.

## Facts Page

- The frontend exposes a dedicated `/facts` route.
- This makes market radar user-facing rather than purely administrative.

## ROME Data

- The app integrates ROME 4.0 métier and competence data.
- It supports:
  - querying stored métiers
  - live API proxy access
  - métier statistics
  - métier search
  - competences by métier
  - IT métier collection into local storage
- Collection is treated as a background job, which aligns reference-data ingestion with the broader batch-job architecture.

## Metiers Page

- The frontend exposes `/metiers`, currently admin-guarded.
- This suggests ROME data is both an operational reference and a curated internal tool.

## Product Positioning Implication

- Market radar and ROME are real product modules, but they are secondary relative to the resume/matching/pipeline nucleus.
- They expand the platform toward market intelligence and structured labor taxonomy.
- They should stay modular so they do not overcomplicate the core recruiting workflows.

## Related

- [[topics/Application Surface]]
- [[topics/Product Scope and Priorities]]
- [[topics/Batch Jobs and Long-Running Workflows]]
- [[topics/Integrations]]

## Sources

- [[raw/sources/2026-04-16-codebase-structure]]
- [[raw/sources/2026-04-16-domain-model-and-control-plane]]
