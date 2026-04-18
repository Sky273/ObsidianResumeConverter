# 2026-04-17 LLM Pricing and Profitability

## Purpose

Source note for the refreshed pricing and profitability projection grounded in:

- current ResumeConverter AI credit governance
- current Stripe credit-pack defaults
- official provider pricing or model pages consulted on 2026-04-17

## Repository Inputs

- `server/config/aiCredits.js`
- `server/config/stripe.js`
- [[topics/AI Credits]]
- [[topics/AI Operation Matrix]]
- [[topics/LLM Control Plane]]

## Current Product Economics Inputs

### Credit governance

Default `actionType` costs:

- `chatbot.message`: 1 credit
- `resume.ai_modify`: 5 credits
- `template.extract`: 15 credits
- `resume.analysis`: 25 credits
- `resume.improvement`: 75 credits
- `resume.adaptation`: 50 credits
- `resume.match`: 8 credits
- `profile.search`: 12 credits
- `profile.analysis`: 25 credits

Default initial firm balance:

- `firmInitialCredits`: 1000

### Current Stripe pack defaults

From `server/config/stripe.js`:

- `starter`: 250 credits for 2900 cents EUR
- `growth`: 750 credits for 7900 cents EUR
- `scale`: 2000 credits for 19900 cents EUR

Equivalent selling price per 1000 credits:

- starter: 116 EUR / 1000 credits
- growth: 105.33 EUR / 1000 credits
- scale: 99.50 EUR / 1000 credits

## Official Provider Snapshot Consulted

### OpenAI

- Pricing page: [OpenAI API pricing](https://openai.com/api/pricing)
- Model page: [GPT-5.4](https://developers.openai.com/api/docs/models/gpt-5.4/)
- Latest public family observed on 2026-04-17:
  - GPT-5.4 input: 2.50 USD / 1M tokens
  - GPT-5.4 output: 15.00 USD / 1M tokens
  - GPT-5.4 mini input: 0.75 USD / 1M tokens
  - GPT-5.4 mini output: 4.50 USD / 1M tokens
  - GPT-5.4 nano input: 0.20 USD / 1M tokens
  - GPT-5.4 nano output: 1.25 USD / 1M tokens

### Anthropic

- Pricing page: [Anthropic pricing](https://www.anthropic.com/pricing)
- Detailed docs: [Anthropic API pricing](https://docs.anthropic.com/en/docs/about-claude/pricing)
- Product pages:
  - [Claude Opus 4.7](https://www.anthropic.com/claude/opus)
  - [Claude Haiku 4.5](https://www.anthropic.com/claude/haiku)
- Latest public model information observed on 2026-04-17:
  - Claude Opus 4.7 was published on 2026-04-16
  - Opus 4.7 pricing starts at 5.00 USD / 1M input and 25.00 USD / 1M output
  - Claude Sonnet 4 remains the stable public mid-tier pricing baseline at 3.00 / 15.00 USD per 1M
  - Claude Haiku 4.5 pricing starts at 1.00 / 5.00 USD per 1M

### DeepSeek

- Pricing page: [DeepSeek Models & Pricing](https://api-docs.deepseek.com/quick_start/pricing/)
- Snapshot used for `deepseek-chat` / DeepSeek-V3.2:
  - input cache miss: 0.28 USD / 1M tokens
  - output: 0.42 USD / 1M tokens
  - cache hit: 0.028 USD / 1M tokens

### Z.AI / GLM

- Pricing page: [Z.AI pricing overview](https://docs.z.ai/guides/overview/pricing)
- Overview: [Z.AI models overview](https://docs.z.ai/guides/overview/overview)
- Release notes: [New Released](https://docs.z.ai/release-notes/new-released)
- Latest public model information observed on 2026-04-17:
  - GLM-5.1 appears in the public overview and release notes as of 2026-04-07
  - the public pricing page still exposes GLM-5 and GLM-5-Turbo, not a distinct GLM-5.1 row
  - official public price rows used:
    - GLM-5 input: 1.00 USD / 1M tokens
    - GLM-5 output: 3.20 USD / 1M tokens
    - GLM-5-Turbo input: 1.20 USD / 1M tokens
    - GLM-5-Turbo output: 4.00 USD / 1M tokens
    - GLM-4.7 input: 0.60 USD / 1M tokens
    - GLM-4.7 output: 2.20 USD / 1M tokens
- Projection rule used:
  - GLM-5 is the closest official public pricing proxy for GLM-5.1 until Z.AI publishes a separate public price row

### MiniMax

- Official compatibility page: [MiniMax compatible Anthropic API](https://platform.minimax.io/docs/api-reference/text-anthropic-api)
- Official token pricing page: [MiniMax Anthropic-compatible cache pricing](https://platform.minimax.io/docs/api-reference/anthropic-api-compatible-cache)
- Latest public model information observed on 2026-04-17:
  - MiniMax-M2.7 is the newest public flagship in this family
  - public token rates remain:
    - input: 0.30 USD / 1M tokens
    - output: 1.20 USD / 1M tokens

### Hugging Face routed inference

- Pricing page: [Hugging Face Inference Providers pricing](https://huggingface.co/docs/inference-providers/pricing)
- Important note:
  - Hugging Face states routed requests are billed with no markup.
  - This is a routing/billing layer, not a standalone token-price baseline.

## Modeling Assumptions Used For Projection

The repo exposes default max-token ceilings, but not a durable cross-feature “typical token telemetry” page yet. The profitability projection therefore uses an explicit operational estimate per priced action, inferred from product behavior and bundled substeps.

Indicative per-action token envelopes used in the projection:

| Action | Input tokens | Output tokens | Notes |
| --- | ---: | ---: | --- |
| `chatbot.message` | 2000 | 700 | Short contextual assistance turn |
| `resume.ai_modify` | 6000 | 2000 | Rewrite assistance on a selected segment |
| `template.extract` | 20000 | 4000 | Heavy extraction/normalization path |
| `resume.analysis` | 14000 | 5000 | Initial structured CV analysis |
| `resume.improvement` | 28000 | 12000 | Includes generation plus post-improvement analysis bundle |
| `resume.adaptation` | 16000 | 6000 | Includes adaptation plus matching-oriented work |
| `resume.match` | 8000 | 1500 | Standalone match analysis |
| `profile.search` | 12000 | 2500 | Keywords + batch scoring + explanations |
| `profile.analysis` | 8000 | 2500 | Detailed profile analysis |

These are not official provider numbers; they are product-level planning assumptions.

## Derived Cost Benchmarks

Indicative variable cost per action, refreshed around the newest public models:

| Action | GPT-5.4 | GPT-5.4 mini | Claude Opus 4.7 | GLM-5 proxy for 5.1 | MiniMax M2.7 |
| --- | ---: | ---: | ---: | ---: | ---: |
| `chatbot.message` | 0.0155 USD | 0.0046 USD | 0.0275 USD | 0.0042 USD | 0.0014 USD |
| `resume.analysis` | 0.1100 USD | 0.0330 USD | 0.1950 USD | 0.0300 USD | 0.0102 USD |
| `resume.improvement` | 0.2500 USD | 0.0750 USD | 0.4400 USD | 0.0664 USD | 0.0228 USD |
| `resume.adaptation` | 0.1300 USD | 0.0390 USD | 0.2300 USD | 0.0352 USD | 0.0120 USD |

Representative blended basket for 1000 credits:

- 4 improvements
- 6 analyses
- 4 adaptations
- 6 template extractions
- 10 matches
- 10 profile searches
- 6 AI modifications
- 30 chatbot messages

Resulting variable AI cost for that 1000-credit basket:

- DeepSeek V3.2: 0.2729 USD
- MiniMax M2.7: 0.4416 USD
- Z.AI GLM-4.7: 0.8434 USD
- Z.AI GLM-5 (proxy for 5.1): 1.3128 USD
- OpenAI GPT-5.4 mini: 1.4025 USD
- Anthropic Claude Haiku 4.5: 1.6710 USD
- OpenAI GPT-5.4: 4.6750 USD
- Anthropic Claude Sonnet 4: 5.0130 USD
- Anthropic Claude Opus 4.7: 8.3550 USD

## Local Model Option

Ollama / local hosting has no official token-price page comparable to hosted APIs.

The projection therefore treats local models as infrastructure-backed cost rather than token-priced cost.

Illustrative all-in local-hosting assumption:

- 250 EUR / month total
  - GPU/VPS or amortized on-prem hardware
  - electricity / hosting
  - admin/ops allocation

Equivalent cost per 1000-credit blended basket at different monthly volumes:

- 20 baskets / month: 12.50 EUR
- 50 baskets / month: 5.00 EUR
- 100 baskets / month: 2.50 EUR

## Commercial Interpretation

The current default Stripe packs are already in a very high-margin zone relative to the modeled variable AI cost, including when using GPT-5.4, Claude Sonnet 4, or Claude Opus 4.7 for a meaningful share of traffic.

That does not automatically mean they are wrong:

- they may intentionally absorb product support, infra, OCR, storage, onboarding, and margin
- they leave wide safety room for prompt growth and long outputs
- they are commercially conservative rather than merely “profitable”

## Related

- [[topics/AI Credits]]
- [[topics/AI Operation Matrix]]
- [[topics/LLM Cost Model and Pricing Strategy]]
