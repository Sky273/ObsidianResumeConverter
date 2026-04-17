# Settings and Governance Surfaces

## Summary

ResumeConverter has two distinct governance surfaces that deserve to be understood separately:

- the **settings** control plane
- the **admin workspace**

Together they define how the product is configured, governed, and operated.

## Settings Surface

The settings page is not a miscellaneous preferences page. It is a structured control plane with explicit tabs for:

- `llm`
- `prompts`
- `weights`
- `credits`
- `chatbot`
- `gdpr`
- `dpo`
- `swagger`

### LLM tab

Controls provider, model, parameter sets, and provider-specific capabilities such as Ollama discovery and test-connection behavior.
It indirectly controls runtime call routing because provider/model resolution starts from these settings.

### Prompts tab

Controls the prompt layer used by pre-analysis, analysis, improvement, matching, and adaptation.

### Weights tab

Controls scoring and ranking weights, including local matching weights that influence pre-ranking before LLM scoring.

### Credits tab

Controls AI credit cost and related per-action budget behavior. This makes pricing/control logic configurable rather than hard-coded.

### Chatbot tab

Controls chatbot-specific settings and behavior.

### GDPR and DPO tabs

Expose compliance-related controls and DPO contact information. This is important because GDPR handling is product-native in ResumeConverter.

### Swagger tab

Exposes API-doc visibility from the settings surface, which is another signal that settings are partly an operational console.

## Admin Workspace

The admin workspace is a separate governance area with tabs for:

- firms
- users
- templates
- email templates
- tags
- firm credits

### Firms

Super-admin-oriented tenant governance surface.

### Users

User administration and role/firms governance.

### Templates and email templates

Presentation and communication governance surfaces.

### Tags

Controlled tagging taxonomy/management surface.

### Firm credits

Operational governance for AI budget visibility and purchasing.

## Why This Matters

- Settings govern how the application behaves.
- Admin workspace governs who and what the application manages.
- Bugs in these areas are often high leverage because they change platform-wide behavior rather than one business object.
- The frontend settings contract needs nullish-safe normalization: several settings fields are semantically allowed to be `0`, `off`, or empty strings, so mapping API settings into form state must not use broad `||` fallbacks that silently rewrite explicit values.
- The backend settings contract now follows the same rule in `server/utils/mappers.js`: `mapSettingsToFrontend(...)` preserves explicit `0`, `off`, and empty-string values instead of masking them with default fallbacks.
- The frontend user/admin contract is converging on canonical cabinet fields (`firmId`, `firmName`) even when backend responses still include compatibility aliases such as `firm_id`, `firm_name`, `firm`, or `customer*`.
- Route-layer settings shaping is now less duplicated: `server/routes/settings.routes.js` delegates default payload construction, presentation/public-home responses, and mutation preparation to `server/routes/settings.routes.helpers.js` instead of carrying those response forms inline.
- The settings route now has a cleaner split between:
  - HTTP/auth/cache concerns in the route file
  - settings-shape normalization and governance decoration in the helper file
- The remaining LLM-admin route paths are also converging into that helper layer:
  - Ollama base-URL resolution now lives alongside the other settings-route normalization helpers
  - the `test-llm` path now prepares its normalized payload through a shared helper instead of rebuilding Ollama/model-parameter logic inline inside the route
- `GET /api/settings` and `GET /api/settings/defaults` now also reuse helper-owned response builders, so canonical LLM overlay and default settings decoration are no longer assembled inline in the route file.
- The admin LLM preparation path now has a clearer internal pipeline in `server/routes/settings.routes.helpers.js`:
  - normalize admin input
  - resolve optional Ollama discovery
  - sanitize model parameters with discovered capabilities
- The persistent admin settings path is also less duplicated:
  - `server/routes/settings.routes.js` now reuses a shared helper for prepare -> persist -> response
  - route-local code keeps only cache invalidation and security/audit logging concerns
- That persistent route path now has its own bounded helper surface:
  - `server/routes/settings.routes.persistence.helpers.js` owns the common load-current -> prepare -> persist -> response flow for the `PUT /api/settings/:id` and `POST /api/settings` admin endpoints
  - `server/routes/settings.routes.js` stays focused on HTTP, auth, cache invalidation, and security/audit logging

## Practical Reading

When a question is `how does the app decide this?`, start in **settings**.

When a question is `who can govern or administer this?`, start in **admin workspace**.

## Related

- [[topics/Admin and Operations]]
- [[topics/Settings Catalog]]
- [[topics/LLM Control Plane]]
- [[topics/LLM Call Resolution and Runtime Selection]]
- [[topics/Security and Compliance]]
- [[topics/AI Credits]]

## Sources

- [[raw/sources/2026-04-16-admin-ops-and-diagnostics]]
- [[raw/sources/2026-04-16-settings-maintenance-persistence]]
