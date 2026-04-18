# Source Note - LLM Executive Presentation

Date: 2026-04-17

## Inputs used

- `docs/LLM_COST_MODEL_AND_PRICING.md`
- `docs/COST_ANALYSIS.md`
- current credit packs in `server/config/stripe.js`
- current AI credit actions in `server/config/aiCredits.js`

## Purpose

Produce a hierarchy-facing presentation that turns raw provider pricing and profitability modeling into a small decision set:

- which LLM families should be default
- which models should be premium-only
- whether a local-model option should be part of the commercial offer
- which credit-pack pricing posture should be retained

## Executive conclusions preserved

- Current packs `29/79/199` remain premium-safe even with premium hosted models.
- The real decision is commercial positioning, not baseline profitability.
- The most balanced recommendation is a hosted-universal operating model:
  - standard runtime on `GPT-5.4 mini`, `GLM-5/5.1`, `MiniMax M2.7`, `DeepSeek V3.2`
  - premium runtime on `GPT-5.4` and `Claude Sonnet 4`
  - `Claude Opus 4.7` kept exceptional
- Recommended candidate pricing grid for a more aggressive but still safe market posture:
  - `19 € / 55 € / 139 €`
- Local/Ollama should be positioned as a separate sovereignty or enterprise option, not as the standard baseline.
