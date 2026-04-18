# LLM Executive Decision Presentation

## Summary

This page records the management-facing synthesis derived from the repository pricing studies:

- `docs/LLM_COST_MODEL_AND_PRICING.md`
- `docs/COST_ANALYSIS.md`

Its goal is not to preserve every pricing detail, but to preserve the decision framing for leadership:

- provider strategy
- premium vs standard runtime separation
- local-model positioning
- recommended credit-pack tariff posture

## Decision Frame

ResumeConverter does not sell raw provider calls. It sells business actions converted into credits.  
The pricing decision therefore depends more on the variable cost per action basket than on any single model's nominal token price.

At the current public pricing snapshot:

- modern budget and mid-tier models remain extremely cheap relative to the current packs
- even premium models do not threaten the current pricing structure
- the main strategic choice is commercial positioning and runtime governance discipline

## Recommended Operating Model

### Standard runtime

Use low-to-mid variable-cost models as default:

- `GPT-5.4 mini`
- `GLM-5` / `GLM-5.1` when commercially acceptable
- `MiniMax M2.7`
- `DeepSeek V3.2`

### Premium runtime

Reserve stronger hosted models for high-value or sensitive flows:

- `GPT-5.4`
- `Claude Sonnet 4`

### Exceptional premium

Keep `Claude Opus 4.7` as an exception, not a default baseline.

### Local model

Position `Ollama` or a self-hosted local model as:

- a sovereignty option
- an enterprise option
- or a customer-hosted deployment profile

It should not be treated as the universal baseline economics for the standard SaaS offer.

## Recommended Tariff Posture

Three postures remain valid:

- budget/local-first: `12 / 35 / 89`
- hosted-universal: `19 / 55 / 139`
- premium-safe: `29 / 79 / 199`

The preferred recommendation is **hosted-universal** because it best balances:

- sales competitiveness
- healthy margin
- operational flexibility
- product quality narrative

## Leadership Ask

Leadership should validate:

1. whether the company wants premium positioning by default or a broader hosted-universal offer
2. whether premium models should be limited to premium operations or premium customers
3. whether a sovereignty/local-model offer should be productized separately

## Related

- [[topics/LLM Cost Model and Pricing Strategy]]
- [[topics/LLM Control Plane]]
- [[topics/AI Credits]]
- [[raw/sources/2026-04-17-llm-executive-presentation]]
