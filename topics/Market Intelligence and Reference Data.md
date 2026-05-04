# Market Intelligence and Reference Data

## Summary

Beyond candidate processing, ResumeConverter includes a market/reference-data layer with market radar facts, trends, reference catalogs, and ROME m√©tier data. This appears to support market awareness, sourcing, and contextual analysis rather than only resume storage.

## Market Radar

- Market radar is modularized into collection, facts, search, reference, and trends routes.
- The France map canvas uses MapLibre's CSP build plus an explicit Vite-emitted `maplibre-gl-csp-worker` URL. It should not use the default MapLibre runtime worker because the app CSP blocks inline worker bootstrapping.
- France Travail market trend ingestion normalizes French decimal strings before storage and summary computation. Recruitment tension and employment-dynamics metrics may arrive as values such as `12,75`, `1 234,56`, or `12,5 %`; these must be parsed as decimals rather than truncated with `parseFloat`.
- Market trend collection job progress is based on processed API attempts, including successful collections, skipped empty responses, and API failures. It must not depend only on stored trend rows, otherwise the UI can appear stuck at `0 / total` when the first endpoint fails or times out repeatedly.
- France Travail can return HTTP 200 trend payloads with indicator metadata but no numeric value. These responses are expected for some ROME/region pairs and must be counted as skipped `no_value` items, not stored as empty trends and not reported as collection errors.
- Recruitment tension values (`PERSP_2`) should be collected from Data Emploi national ROME data (`top/activite/demandeurs-offres-flux/PERSP_2/ROME/NAT/FR`), not from the older partner `stat-perspective-employeur` endpoint. The Data Emploi top feed exposes `statsDemandeurOffre.persp2.valPrincDec` for decimal tension scores, while the regional endpoint may return only indicator metadata for IT ROME codes.
- Facts endpoints expose:
  - filtered fact queries
  - latest facts by type
  - keyword trends
  - regional comparisons
  - filter options
  - summaries
  - cache refresh
- The existence of cache refresh and bounded ‚Äúall facts‚Äù responses shows the module is meant to serve richer UI exploration, not only raw ingestion.

## Facts Page

- The frontend exposes a dedicated `/facts` route.
- This makes market radar user-facing rather than purely administrative.

## ROME Data

- The app integrates ROME 4.0 m√©tier and competence data.
- It supports:
  - querying stored m√©tiers
  - live API proxy access
  - m√©tier statistics
  - m√©tier search
  - competences by m√©tier
  - IT m√©tier collection into local storage
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

## 2026-05-02 - Jobs de collecte et ÈlÈments ignorÈs

Les jobs de collecte affichent dÈsormais les ÈlÈments ignorÈs sÈparÈment des erreurs. Le compteur UI est dÈrivÈ de processed_items - success_count - error_count tant que le modËle de stockage agrÈgÈ ne persiste pas explicitement skipped_count.

## 2026-05-02 - PrÈcision dÈcimale et erreurs critiques France Travail

La table market_trends doit utiliser NUMERIC(18,6) pour value et previous_value afin de conserver les indicateurs dÈcimaux Data Emploi/France Travail. Les erreurs OAuth France Travail 400 invalid_client ou invalid_scope sont des erreurs critiques de configuration: la collecte doit s'arrÍter rapidement au lieu de produire une erreur par couple ROME/rÈgion.

## 2026-05-02 - Authentification France Travail et rate limiting token

Les appels au token partenaire France Travail sont mutualisÈs lorsqu'une demande est dÈj‡ en cours. Une erreur de rÈcupÈration du token est dÈsormais marquÈe comme critique via isFranceTravailTokenError, mÍme si la rÈponse HTTP 400 ne contient pas de corps JSON. La collecte s'arrÍte alors aprËs le premier Èchec d'authentification au lieu d'accumuler une erreur par couple ROME/rÈgion.
