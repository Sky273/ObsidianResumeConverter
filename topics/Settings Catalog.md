# Settings Catalog

## Summary

ResumeConverter does not use settings as a loose bag of preferences. The settings layer is a runtime control plane centered on one canonical `llm_settings` record and a few adjacent operational tables.

## Canonical Settings Record

- The primary source of truth is the canonical row in `llm_settings`, keyed by `CANONICAL_LLM_SETTINGS_KEY`.
- `server/services/settings.service.js` reads that row first and only falls back to legacy/default behavior when the canonical row is missing.
- `getLLMSettings()` returns a mapped, normalized object rather than raw SQL columns.
- The mapped object is cacheable and explicitly invalidated through `invalidateSettingsCache()` after updates.

## High-Value Setting Families

### Provider and model selection

- Active provider selection starts here.
- Effective model selection starts here.
- Provider-specific behavior such as Ollama discovery, runtime availability, and default model resolution depends on these settings.

### Model execution parameters

- Temperature-like sampling parameters, token limits, and related LLM knobs live in the settings layer.
- These values are merged with per-call overrides later in the call-resolution path rather than hard-coded inside each feature.

### Prompt governance

The settings layer owns the durable prompts for major AI features:

- `analysis`
- `preAnalysis`
- `improvement`
- `matchAnalysis`
- `adaptation`

This means prompt changes are operational behavior changes, not code changes.

### Availability and fallback hints

- The settings model stores provider/runtime availability state.
- Runtime call resolution adjusts configured preferences against real availability before dispatch.
- This is why a feature can be configured for one provider but still be routed differently at runtime if availability logic says so.

### Scoring and weighting

- Weighted global rating behavior depends on settings.
- Matching and ranking logic also depend on settings-driven weights.
- This makes some product behavior effectively data-driven rather than code-driven.

### Chatbot and AI feature flags

- Chatbot enablement and adjacent AI behavior flags are part of the same control plane.
- They affect whether certain AI paths are exposed at all, not just how they are parameterized.

### Credit economics

- Per-action AI credit costs are configurable from the settings/admin control surfaces rather than being frozen in code.
- This matters because credit reservation logic consumes these configured action costs when reserving budgets upfront.

### Compliance and governance fields

- GDPR and DPO-related settings live near the same governance surface even when they are not used in the LLM path itself.
- Swagger/API-doc exposure is also governed from settings, which reinforces that this surface is partly operational.
- The canonical `llm_settings` row now also stores application mail-delivery control-plane values for the GDPR/settings UI:
  - provider mode (`gmail`, `smtp`, `auto`)
  - SMTP connection and sender fields
  - encrypted stored SMTP password
  - GDPR Gmail callback URI override

This means application email routing is now partially data-driven from the same canonical settings record rather than env-only.

## Runtime Effect Model

The practical chain is:

1. Admin updates settings.
2. The canonical `llm_settings` row changes.
3. Settings cache is invalidated.
4. Subsequent AI calls read normalized settings.
5. Provider/model resolution and prompt selection use those settings.
6. Downstream services execute with the resulting effective config.

## Why This Matters

- Bugs in settings often look like feature bugs even when no feature code changed.
- Debugging an LLM behavior issue should usually start with the canonical settings row and cache invalidation state.
- Prompt, provider, weight, and credit behavior are all partially data-driven.

## Related

- [[topics/Settings and Governance Surfaces]]
- [[topics/LLM Control Plane]]
- [[topics/LLM Call Resolution and Runtime Selection]]
- [[topics/AI Credits]]
- [[topics/Business Objects and Data Relationships]]

## Sources

- [[raw/sources/2026-04-16-settings-maintenance-persistence]]
