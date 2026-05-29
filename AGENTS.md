# Project Instructions For Codex

## Project Purpose

Ideal Momentum Jet Explorer is a public, static React/TypeScript scientific
computing app for reduced-order atomizing-jet exploration. Preserve the
scientific caveats: the model is exploratory, reduced-order, and not validated
engineering design software.

## Standard Commands

- Install dependencies: `npm install`
- Development server: `npm run dev -- --host 127.0.0.1`
- Tests: `npm run test`
- Production build: `npm run build`
- Lint: `npm run lint`
- Visual smoke test: start the Vite dev server, then run `npm run smoke:visual`
- Asset report: build first, then run `npm run analyze:assets`

## Git Workflow

- Work on feature branches for nontrivial changes.
- Check `git status --short` before editing.
- Do not use destructive Git commands unless explicitly requested.
- Do not commit private data, unpublished PDFs, credentials, tokens, or private
  datasets.

## Scientific Wording

- Use cautious labels such as "research prototype", "reduced-order exploratory
  model", "heuristic screening", "setup aid", and "not solver-ready".
- Do not claim validated engineering design, automatic spray design, full
  transient spray simulation, CFD replacement, or solver-ready case generation.
- Do not change equations, units, assumptions, or model behavior silently.

## Roadmap Status

- Units 1-5 and 7-10 are implemented on feature branches.
- Unit 6 lossy model extensions are deferred until the governing equations,
  assumptions, and validation strategy are formally documented.
- Future public validation datasets must have documented provenance and
  permission before being committed.
