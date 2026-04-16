# Matching and Scoring Model

## Summary

ResumeConverter uses more than one scoring layer. The important distinction is:

- resume-analysis scoring
- local profile/mission pre-ranking
- LLM-based mission match analysis

These layers are related, but they do not produce the same signal.

## Resume Analysis Scoring

Resume analysis quality uses weighted scoring across sections such as:

- executive summary
- skills
- experience
- education
- ATS
- hobbies/languages

The final global rating is recomputed through `calculateWeightedGlobalRating()` using configured weights rather than a hard-coded formula.

### Practical meaning

- A CV can receive the same underlying analysis but a different global rating after weight changes.
- This score is about CV quality/readiness, not mission fit.

## Local Matching Pre-Ranking

Local matching uses configurable weights for:

- skills
- tools
- industry
- soft skills
- exact title match
- title token match
- coverage multiplier

This layer lives in the profile-matching/local-ranking logic and acts as a cheap relevance signal before or alongside heavier AI scoring.

### Practical meaning

- It helps narrow or order candidates before expensive LLM calls.
- It is deterministic/config-driven relative to extracted structured signals.
- Bad local weights can distort shortlist quality even if LLM matching is correct.

## LLM-Based Match Analysis

Mission matching uses a dedicated `Match Analysis Prompt` and validates the resulting payload through the mission/match contracts.

This layer produces a richer semantic fit signal, typically including:

- a match score
- match reasoning
- structured mission-fit details

### Practical meaning

- This is the expensive semantic layer.
- It is not a replacement for local ranking; it complements it.

## Adaptation Coupling

Resume adaptation workflows use match analysis as an input to generate a mission-specific adapted CV.

So the chain is often:

1. local relevance signal
2. LLM match analysis
3. adaptation generation
4. persisted adaptation + match score

## Why Layers Matter

Confusion happens when people mix these questions:

- `Is this CV good?`
- `Is this profile locally similar to the mission?`
- `Is this candidate semantically a strong fit for the mission?`

ResumeConverter answers them with different mechanisms.

## Common Failure Modes

- weight changes alter outcomes without any AI regression
- prompt changes alter match-analysis shape/quality without changing local ranking
- extraction issues degrade both local ranking and LLM fit because upstream structured facts become weaker

## Practical Reading

- For CV-quality changes, inspect resume-analysis weights.
- For shortlist ordering issues, inspect local matching weights.
- For semantic fit/adaptation issues, inspect match prompt and LLM outputs.

## Related

- [[topics/Settings Catalog]]
- [[topics/Settings Field Reference]]
- [[topics/Core Resume Workflows]]
- [[topics/Clients Deals Missions Pipeline]]
- [[topics/LLM Control Plane]]

## Sources

- [[raw/sources/2026-04-16-settings-scoring-and-api-surface]]
