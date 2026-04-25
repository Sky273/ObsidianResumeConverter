# LLM Control Plane

## Summary

The AI layer is governed centrally through settings, provider availability, credits, prompts, weights, timeout policy, and model-specific validation. This is not an ad hoc helper layer; it is a product control plane.

## Control Surfaces

- Global settings API returns or persists the active LLM provider and model.
- Admin settings also control prompt templates used by:
  - pre-analysis
  - analysis
  - improvement
  - matching
  - adaptation
- Matching weights and local ranking parameters are configurable.
- Provider availability flags are merged into the settings response so the UI can reflect current capability.

## Provider Model

- The app supports several providers and provider-specific services.
- Provider selection is normalized through backend settings and an LLM gateway.
- Ollama is treated as an administrable provider with:
  - base URL normalization
  - configured URL enforcement
  - model discovery
  - selected-model validation
- There is an admin test endpoint for validating the configured provider/model before persisting settings.
- Runtime model availability can override a nominal configuration and redirect execution toward a fallback model.

## Prompt Governance

- Default prompts exist in backend config and are surfaced through settings defaults.
- As of 2026-04-21, the default resume-improvement prompt is sourced from a dedicated module: `server/config/prompts/resumeImprovement.prompt.js`, and governance metadata points `resume.improvement.default` to that module at version `1.9.0`.
- Prompt text is not buried inside every feature route; there is an explicit attempt to centralize prompt governance.
- This matters because several workflows share the same provider infrastructure but should remain behaviorally tunable without code edits.
- The dedicated governance doc defines the intended contract between prompts and validators:
  - each prompt should carry `id`, `version`, `domain`, `operation`, and `contractId`
  - each output contract should carry `id`, `version`, `validatorModule`, and `validatorExport`
  - semantic prompt changes should bump prompt version
  - JSON output structure changes should bump contract version
- The same doc also records current governance gaps:
  - prompt/contract versions are not yet universally persisted in DB state
  - execution metadata is not yet guaranteed to record the effective prompt version everywhere
  - user-customized prompt migration is not automated

## Credit Governance

- AI costs are represented as per-action credit settings.
- The settings layer exposes both credit cost and max-token parameters for actions such as:
  - chatbot message
  - resume AI modify
  - template extraction
  - resume analysis
  - resume improvement
  - resume adaptation
  - resume match
  - profile search
  - profile analysis
- Recent hardening introduced upfront reservation for both long-running jobs and synchronous workflows.
- Business tracing is carried separately through explicit `operationType` metadata sent into the shared LLM layer.
- The intended model is:
  - `actionType` = charging and reservation unit
  - `operationType` = business tracing label
- These are not always one-to-one. Some priced actions deliberately span several LLM sub-operations under one credit action.

## Timeout Governance

- AI operation timeout policy has been standardized to 15 minutes for backend AI operations.
- Key frontend IA flows were aligned to the same expectation.
- This should be treated as a product-level invariant unless there is a deliberate provider-specific exception.

## Operational Implications

- When AI appears `broken`, the root cause may be:
  - invalid provider credentials
  - provider/model unavailability
  - bad settings payload
  - insufficient firm credits
  - prompt or token configuration drift
  - timeout mismatch
- Debugging should start from the control plane, not only from the feature route that triggered the call.

## Agentic Model Readiness

As of 2026-04-25, ResumeConverter supports OpenAI `gpt-5.5` as a plain premium model string through the existing provider/model control plane. The provider/model control plane, gateway dispatch, availability fallback, per-operation token budgets, upfront credit reservation, async batch jobs, and prompt/contract governance kept the adoption to a controlled model-configuration upgrade.

ResumeConverter is only partially ready to exploit more advanced agentic capabilities. The current architecture is centered on governed LLM calls and product workflows, not on a first-class agent runtime. Before using model-native agentic tooling broadly, the app should add explicit support for tool definitions, tool-call execution loops, tool allowlists by operation, persisted agent state, step-level audit logs, per-tool authorization, and credit/timeout accounting for multi-step tool use.

Practical stance:

- adding documented OpenAI model IDs as plain premium models remains low-risk when they use the same Responses/chat-style surface and existing request parameters
- using the future model as an autonomous workflow planner should require a dedicated agent-runtime design, not just a model dropdown entry
- the first suitable candidates for agentic expansion are bounded workflows such as template extraction review, profile search explanation, resume adaptation planning, or admin diagnostics, because they already have explicit operation types and observable intermediate states

## Missing Mental Model To Avoid

It is incorrect to think in terms of:

- feature -> provider API directly

The closer model is:

- feature -> settings -> provider/model resolution -> availability/fallback -> effective parameters -> gateway -> provider adapter

## Related

- [[topics/AI Credits]]
- [[topics/AI Operation Matrix]]
- [[topics/AI Timeouts]]
- [[topics/LLM Call Resolution and Runtime Selection]]
- [[topics/Provider Failure and Fallback Model]]
- [[topics/Core Resume Workflows]]
- [[topics/Batch Jobs and Long-Running Workflows]]
- [[topics/Admin and Operations]]
- [[topics/Integrations]]

## Sources

- [[raw/session-notes/2026-04-16-memory-bootstrap]]
- [[raw/sources/2026-04-16-functional-workflows]]
- [[raw/sources/2026-04-16-domain-model-and-control-plane]]
- [[raw/sources/2026-04-16-llm-call-resolution]]
- [[raw/sources/2026-04-16-provider-failure-runbooks-authz]]
- [[raw/sources/2026-04-17-ocr-and-llm-docs]]
