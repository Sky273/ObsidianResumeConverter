# LLM Cost Model and Pricing Strategy

## Summary

ResumeConverter’s AI economics are governed by business credits, not by raw provider calls. The current credit model remains economically safe after updating the analysis to the latest public model families visible on 2026-04-17, including `GPT-5.4`, `Claude Opus 4.7`, and the public Z.AI `GLM-5.1` availability update. A local Ollama option can still be cheaper at scale, but only once infrastructure is amortized over enough monthly usage.

## Current State

- Pricing inside the product is structurally credit-based, not token-based.
- Credits are charged by business `actionType`, not by low-level provider request count.
- The app already exposes Stripe credit packs rather than a broad subscription billing platform.
- Current default Stripe packs in `server/config/stripe.js` are:
  - 250 credits for 29 EUR
  - 750 credits for 79 EUR
  - 2000 credits for 199 EUR
- The current default initial balance is 1000 credits per firm.

## Important Facts

- `resume.improvement` intentionally bundles both generation and post-improvement analysis under one priced action.
- `profile.search` intentionally bundles keyword extraction, batch scoring, and explanation work under one priced action.
- Hugging Face routed inference is not a standalone pricing baseline because Hugging Face documents that routed requests carry no markup; the real economics come from the underlying provider.
- A local Ollama deployment has no official token pricing comparable to API vendors; it must be modeled as infra cost plus ops burden.
- `GLM-5.1` is visible in public Z.AI overview and release notes as of 2026-04-07, but the public pricing page still does not expose a distinct `GLM-5.1` tariff row.

## Official Provider Pricing Snapshot

Prices below are the official public rates or model-page claims consulted on 2026-04-17.

| Provider / model | Input USD / 1M | Output USD / 1M | Notes |
| --- | ---: | ---: | --- |
| OpenAI GPT-5.4 | 2.50 | 15.00 | Latest public OpenAI flagship visible on 2026-04-17 |
| OpenAI GPT-5.4 mini | 0.75 | 4.50 | Latest public OpenAI mini baseline |
| OpenAI GPT-5.4 nano | 0.20 | 1.25 | Cheapest public GPT-5.4-class option |
| Anthropic Claude Opus 4.7 | 5.00 | 25.00 | Latest public Anthropic premium model, published 2026-04-16 |
| Anthropic Claude Sonnet 4 | 3.00 | 15.00 | Stable public mid-tier baseline |
| Anthropic Claude Haiku 4.5 | 1.00 | 5.00 | Fast and cheaper recent option |
| DeepSeek V3.2 (`deepseek-chat`) | 0.28 | 0.42 | Cache-hit input can be much lower |
| Z.AI GLM-5 | 1.00 | 3.20 | Official public pricing proxy for GLM-5.1 |
| Z.AI GLM-5-Turbo | 1.20 | 4.00 | Official public high-end visible row |
| Z.AI GLM-4.7 | 0.60 | 2.20 | Still publicly priced |
| MiniMax M2.7 | 0.30 | 1.20 | Latest public MiniMax flagship family row |
| Hugging Face routed inference | provider-dependent | provider-dependent | No markup according to HF docs |
| Ollama / local | n/a | n/a | Modeled via infra amortization, not official token rates |

Important note:

- `GLM-5.1` is visible in the public Z.AI overview and release notes, but the public pricing page does not yet expose a distinct `GLM-5.1` row.
- The calculations below therefore use `GLM-5` as the nearest official public pricing proxy for `GLM-5.1`.
- This is an inference from the sources, not a distinct public `GLM-5.1` tariff.

## Projection Assumptions

The repo defines max-token ceilings, but not a durable cross-feature “typical real token usage” page yet. The cost projection therefore uses explicit operational estimates per priced action.

| Action | Credits | Input tokens | Output tokens |
| --- | ---: | ---: | ---: |
| `chatbot.message` | 1 | 2000 | 700 |
| `resume.ai_modify` | 5 | 6000 | 2000 |
| `template.extract` | 15 | 20000 | 4000 |
| `resume.analysis` | 25 | 14000 | 5000 |
| `resume.improvement` | 75 | 28000 | 12000 |
| `resume.adaptation` | 50 | 16000 | 6000 |
| `resume.match` | 8 | 8000 | 1500 |
| `profile.search` | 12 | 12000 | 2500 |
| `profile.analysis` | 25 | 8000 | 2500 |

This is an inference from the product’s action model and bundled workflows, not an official provider claim.

## Indicative Variable Cost Per Action

| Action | GPT-5.4 | GPT-5.4 mini | Claude Opus 4.7 | GLM-5 proxy for 5.1 | MiniMax M2.7 |
| --- | ---: | ---: | ---: | ---: | ---: |
| `chatbot.message` | 0.0155 USD | 0.0046 USD | 0.0275 USD | 0.0042 USD | 0.0014 USD |
| `resume.analysis` | 0.1100 USD | 0.0330 USD | 0.1950 USD | 0.0300 USD | 0.0102 USD |
| `resume.improvement` | 0.2500 USD | 0.0750 USD | 0.4400 USD | 0.0664 USD | 0.0228 USD |
| `resume.adaptation` | 0.1300 USD | 0.0390 USD | 0.2300 USD | 0.0352 USD | 0.0120 USD |
| `template.extract` | 0.1100 USD | 0.0330 USD | 0.2000 USD | 0.0328 USD | 0.0108 USD |

Interpretation:

- DeepSeek and MiniMax remain in the very-cheap hosted band.
- GLM-5 as a proxy for GLM-5.1 and GPT-5.4 mini stay comfortable for a credit-based commercial model.
- GPT-5.4 and Claude Opus 4.7 materially raise variable cost, but still remain far below the current selling price implied by the existing credit packs.

## 1000-Credit Basket Economics

To compare providers at the product level, a representative 1000-credit basket was modeled as:

- 4 resume improvements
- 6 resume analyses
- 4 resume adaptations
- 6 template extractions
- 10 resume matches
- 10 profile searches
- 6 AI modifications
- 30 chatbot messages

| Default LLM policy | Variable AI cost for 1000 credits |
| --- | ---: |
| DeepSeek V3.2 | 0.27 USD |
| MiniMax M2.7 | 0.44 USD |
| Z.AI GLM-4.7 | 0.84 USD |
| Z.AI GLM-5 (proxy GLM-5.1) | 1.31 USD |
| OpenAI GPT-5.4 mini | 1.40 USD |
| Anthropic Claude Haiku 4.5 | 1.67 USD |
| OpenAI GPT-5.4 | 4.68 USD |
| Anthropic Claude Sonnet 4 | 5.01 USD |
| Anthropic Claude Opus 4.7 | 8.36 USD |

This is the key commercial takeaway:

- even the premium hosted basket stays in a single-digit USD range
- the current Stripe packs price 1000 credits at roughly 99.50 EUR to 116 EUR equivalent
- therefore the existing pack family is not just profitable; it is highly conservative

## Local Model Option

For Ollama / local hosting, the relevant question is not token price but utilization.

Illustrative local cost model:

- 250 EUR / month all-in
  - GPU/VPS or amortized hardware
  - power/hosting
  - admin overhead

Equivalent cost per representative 1000-credit basket:

| Monthly basket volume | Local infra cost per 1000-credit basket |
| --- | ---: |
| 20 | 12.50 EUR |
| 50 | 5.00 EUR |
| 100 | 2.50 EUR |

Interpretation:

- local mode is not automatically the cheapest option at low volume
- local mode becomes commercially very attractive once monthly usage is steady and the infra is well amortized
- if the customer hosts the local stack on their own side, the software vendor can price the application more like software + support than like AI resale

## Recommended Tariff Table

### Option A: Budget / local-first pricing

Use this only if the dominant defaults remain in the modern low-cost band:

- DeepSeek
- MiniMax
- GLM
- local Ollama
- GPT-5.4 mini or nano

| Pack | Credits | Recommended price |
| --- | ---: | ---: |
| Starter | 250 | 12 EUR |
| Growth | 750 | 35 EUR |
| Scale | 2000 | 89 EUR |

### Option B: Universal hosted pricing

Use this when the dominant defaults remain in the modern “efficient hosted” band:

- GPT-5.4 mini
- GLM-5 / GLM-5.1
- Claude Haiku 4.5
- DeepSeek
- MiniMax

| Pack | Credits | Recommended price |
| --- | ---: | ---: |
| Starter | 250 | 19 EUR |
| Growth | 750 | 55 EUR |
| Scale | 2000 | 139 EUR |

### Option C: Premium-safe pricing

Use this when one wants a single tariff family that remains comfortable even if premium models such as GPT-5.4, Claude Sonnet 4, or Claude Opus 4.7 become common defaults on valuable workflows.

| Pack | Credits | Recommended price |
| --- | ---: | ---: |
| Starter | 250 | 29 EUR |
| Growth | 750 | 79 EUR |
| Scale | 2000 | 199 EUR |

This exactly matches the current default Stripe pack configuration.

## Recommended Commercial Position

The safest reading is:

- if ResumeConverter is sold as a premium B2B workflow tool, the current packs are economically safe and operationally low-risk even after updating the model set to GPT-5.4 / Opus 4.7-era providers
- if growth and lower entry friction matter more, the current packs can likely be reduced toward the “universal hosted” range without threatening profitability as long as the mix is still dominated by efficient hosted or local models
- if the product is positioned around local/self-hosted AI, the monetization should rely more on platform/support pricing and less on large credit markup

## Open Questions

- The repo currently lacks a durable telemetry page for real median token usage per `actionType`.
- A future pricing revision should be informed by real production token medians, not only by budget estimates.
- Z.AI may later publish a distinct public tariff for `GLM-5.1`; when that happens, the current `GLM-5` proxy should be removed.

## Related

- [[topics/AI Credits]]
- [[topics/AI Operation Matrix]]
- [[topics/LLM Control Plane]]
- [[topics/Stripe Billing and Firm Credit Purchase]]

## Sources

- [[raw/sources/2026-04-17-llm-pricing-and-profitability]]
