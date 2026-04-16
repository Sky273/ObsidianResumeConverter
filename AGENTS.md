# ResumeConverter Vault Schema

This vault is an LLM-maintained external memory for the ResumeConverter project.

## Purpose

The vault stores synthesized, durable project knowledge in markdown so future sessions can reuse it instead of rebuilding context from scratch.

## Core Rules

1. Read `index.md` first before broad project questions.
2. Read `overview.md` second for high-level product and architecture context.
3. Read only the relevant topic and entity pages needed for the task.
4. Update the vault when new durable knowledge appears.
5. Append every meaningful maintenance action to `log.md`.
6. Keep raw material immutable under `raw/`.
7. Keep synthesized knowledge in normal wiki pages at the vault root or in typed folders.

## Directory Model

- `raw/`
  - immutable source material
  - session bootstrap notes
  - imported articles, docs, transcripts, exports
- `entities/`
  - stable project objects
  - products, services, environments, providers
- `topics/`
  - cross-cutting knowledge
  - Docker, Turnstile, AI credits, timeouts, deployment behavior
- `overview.md`
  - high-level project map
- `index.md`
  - navigational catalog
- `log.md`
  - append-only chronological maintenance log

## File Conventions

- Use markdown only.
- Prefer one topic per file.
- Use clear filenames in English.
- Prefer short sections:
  - `Summary`
  - `Current State`
  - `Important Facts`
  - `Open Questions`
  - `Related`
  - `Sources`
- Use Obsidian wikilinks for internal references.
- Keep statements factual and specific.
- Include exact paths, routes, env vars, and commands where useful.

## Operating Modes

### Query

1. Read `index.md`.
2. Read the smallest relevant set of pages.
3. Answer from the wiki first.
4. If the wiki is stale or incomplete, inspect the codebase or the web.
5. If new durable knowledge is found, write it back to the vault.

### Ingest

1. Put raw material under `raw/` if it should be preserved.
2. Update or create the relevant synthesized pages.
3. Update `index.md`.
4. Append a dated entry to `log.md`.

### Lint

Periodically check for:

- orphan pages
- duplicated facts across pages
- stale claims
- missing cross-links
- pages that should be split
- topics that deserve their own page

## Scope

This vault is for durable ResumeConverter knowledge, not temporary scratch notes.

Do not store:

- ephemeral debugging noise
- large copied logs unless needed as raw evidence
- duplicated source text when a short synthesis is enough
