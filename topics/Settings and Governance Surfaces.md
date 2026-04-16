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
