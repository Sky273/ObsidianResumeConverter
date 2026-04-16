# Settings Field Reference

## Summary

This note keeps the high-signal settings fields that most often change runtime behavior. It is not a dump of every column; it is the subset worth remembering during debugging and product changes.

## Provider and Model Fields

- `llmProvider`
- `llmModel`
- `llmAvailability`
- `llmModelParameters`

### Runtime effect

- Select the nominal provider/model pair for AI flows.
- Influence runtime provider/model resolution before dispatch.
- Affect whether model-specific parameters and availability logic can apply.

### Operational notes

- Misconfiguration here can look like a feature bug everywhere AI is used.
- Provider/model changes do not require frontend rebuild, but they do require settings cache invalidation to propagate cleanly.

## Ollama-Specific Fields

- `ollamaBaseUrl`
- `ollamaVisionModel`
- `ollamaKeepAlive`
- `ollamaNumCtx`
- discovered-model/catalog capability fields

### Runtime effect

- Only relevant when `llmProvider = ollama`.
- Control where the backend is allowed to discover and validate models.
- Influence Ollama runtime behavior and context budgeting.

### Operational notes

- The backend deliberately restricts discovery to the configured Ollama URL.
- Empty Ollama fields are stripped from saved payloads when the provider is not Ollama.

## Prompt Fields

- `Pre Analysis Prompt`
- `Analysis Prompt`
- `Improvement Prompt`
- `Match Analysis Prompt`
- `Adaptation Prompt`
- `preAnalysisEnabled`

### Runtime effect

- Govern the durable prompt layer for main AI operations.
- `preAnalysisEnabled` toggles whether the pre-analysis step is part of the effective workflow.

### Operational notes

- Prompt edits are behavior changes, not cosmetic changes.
- Prompt issues can manifest as malformed JSON, weak outputs, or degraded match quality.

## Resume Analysis Weight Fields

- `Executive Summary Weight`
- `Skills Weight`
- `Experience Weight`
- `Education Weight`
- `ATS Weight`
- `Hobbies Languages Weight`

### Runtime effect

- Drive weighted global rating recomputation for resume analysis.
- The score is data-driven through `calculateWeightedGlobalRating()` rather than being fixed in feature code.

### Operational notes

- These weights should be thought of as a product scoring policy.
- Changes here alter ranking/perception of CV quality even if the raw analysis payload is unchanged.

## Local Matching Weight Fields

- `Profile Matching Local Skill Weight`
- `Profile Matching Local Tool Weight`
- `Profile Matching Local Industry Weight`
- `Profile Matching Local Soft Skill Weight`
- `Profile Matching Local Title Exact Weight`
- `Profile Matching Local Title Token Weight`
- `Profile Matching Local Coverage Multiplier`

### Runtime effect

- Control the local pre-ranking layer used before or alongside LLM-based matching.
- Affect candidate ordering and local relevance scoring prior to expensive AI work.

### Operational notes

- These are often more important to shortlist quality than people expect.
- A mismatch between local-ranking settings and AI match behavior can create confusing ranking outcomes.

## AI Credit Cost Fields

- `aiCreditChatbotMessage`
- `aiCreditResumeAiModify`
- `aiCreditTemplateExtract`
- `aiCreditResumeAnalysis`
- `aiCreditResumeImprovement`
- `aiCreditResumeAdaptation`
- `aiCreditResumeMatch`
- `aiCreditProfileSearch`
- `aiCreditProfileAnalysis`
- `firmInitialCredits`

### Runtime effect

- Control upfront reservation and billing budget for AI actions.
- Directly affect whether a workflow can start or is rejected for insufficient credits.

### Operational notes

- A cost increase can break workflows for firms that previously had enough credits.
- `firmInitialCredits` changes tenant bootstrap economics rather than existing-firm balances.

## AI Max Tokens Fields

- `aiMaxTokensChatbotMessage`
- `aiMaxTokensResumeAiModify`
- `aiMaxTokensTemplateExtract`
- `aiMaxTokensResumeAnalysis`
- `aiMaxTokensResumeImprovement`
- `aiMaxTokensResumeAdaptation`
- `aiMaxTokensResumeMatch`
- `aiMaxTokensProfileSearch`
- `aiMaxTokensProfileAnalysis`

### Runtime effect

- Shape request budgets for each AI operation family.
- Affect output completeness, provider cost, and timeout pressure.

### Operational notes

- These fields are easy to underestimate because a model can still succeed with smaller outputs while quality silently degrades.

## UX and Governance Fields

- `cvMode`
- `chatbotEnabled`
- `publicHomeEnabled`
- `webglEnabled`
- `allowUserRegistrationWithoutApproval`
- `DPO Name`
- `DPO Email`
- `DPO Phone`

### Runtime effect

- `cvMode` changes whether CV presentation is nominative or anonymous by policy.
- `chatbotEnabled` toggles chatbot behavior.
- `publicHomeEnabled` affects public landing/home behavior.
- `allowUserRegistrationWithoutApproval` changes registration governance semantics.
- DPO fields support compliance-visible metadata.

### Operational notes

- `publicHomeEnabled` is one of the settings that can visibly change unauthenticated routing behavior.
- Governance fields can alter onboarding and compliance behavior without changing business logic code.

## Practical Reading

- If AI behavior changed globally, inspect provider/model, prompts, max tokens, and credit settings first.
- If ranking changed, inspect weight fields before blaming extraction or AI quality.
- If onboarding behavior changed, inspect `publicHomeEnabled` and `allowUserRegistrationWithoutApproval`.

## Related

- [[topics/Settings Catalog]]
- [[topics/LLM Control Plane]]
- [[topics/Matching and Scoring Model]]
- [[topics/AI Credits]]

## Sources

- [[raw/sources/2026-04-16-settings-scoring-and-api-surface]]
