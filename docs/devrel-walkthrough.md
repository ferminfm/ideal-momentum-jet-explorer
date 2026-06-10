# Developer Education Walkthrough

This walkthrough frames the app as a compact workshop or technical-writing
artifact. It is suitable for scientific and industrial AI audiences that need to
understand how a domain model becomes an inspectable interactive demo.

## Learning Goals

- Read a domain equation and find the corresponding TypeScript implementation.
- Change model parameters and observe the effect on plots and 3D geometry.
- Export structured data for notebook-style analysis or downstream examples.
- Discuss why model caveats, data provenance, and validation status must remain
  visible in AI-assisted scientific workflows.

## 30-Minute Workshop Outline

### 1. Run The Demo

Open the live app:

```text
https://ferminfm.github.io/ideal-momentum-jet-explorer/
```

Use a quick-start example, then change one parameter at a time. Good first
parameters are density ratio, aspect ratio, and the two prescribed spreading
half-angles.

### 2. Inspect The Model Surface

Connect the README equations to the app output:

- `Ahat`: normalized area growth.
- `vhat`: normalized bulk velocity.
- `rhohat`: normalized composite density.
- `phat`: normalized dynamic pressure.
- `mhat_g`: normalized gas entrainment rate.
- `K_A`: generalized entrainment coefficient.

The discussion point is not whether the model is a complete spray simulation.
The discussion point is how assumptions, state variables, and outputs are made
auditable for a technical audience.

### 3. Export Data

Use the CSV export or report generator to create a reproducible handoff. A
notebook exercise can then read the exported CSV, plot one variable, and attach
the model-boundary caveat from the README.

### 4. Explain The AI Connection

For Cloud AI or developer-education contexts, this app can support examples
around:

- structured scientific data generation,
- notebook-based follow-up analysis,
- prompt or agent evaluation against physical constraints,
- responsible explanations that keep uncertainty and validation limits visible,
- multilingual technical education for English, Japanese, and Spanish users.

## Sample-Style Code Path

The codebase is organized so a reviewer can start from the UI and find the
technical implementation:

```text
src/
scripts/
public/examples/
docs/
```

Use the local validation loop before presenting changes:

```bash
npm install
npm run test
npm run build
npm run lint
npm run analyze:assets
```

Run the visual smoke check with a local dev server:

```bash
npm run dev -- --host 127.0.0.1
npm run smoke:visual
```

## Presenter Notes

Emphasize that the app is a public, static, inspectable demo. It does not need
private data, cloud credentials, or a backend. Its showcase value is the
combination of scientific reasoning, reproducible UI, practical QA, and clear
developer-facing explanation.
