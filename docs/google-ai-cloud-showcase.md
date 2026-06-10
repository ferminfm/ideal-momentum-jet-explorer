# Google AI / Cloud AI Showcase Notes

These notes explain why the Ideal Momentum Jet Explorer is a useful public
artifact for Google AI and Cloud AI conversations. The project should be
presented as a scientific-computing and developer-education showcase, not as
validated engineering software or production AI infrastructure.

## One-Line Positioning

Browser-based scientific-computing demo that makes a reduced-order physical
model inspectable through TypeScript, interactive visualization, reproducible
exports, multilingual controls, and explicit model-boundary documentation.

## Google AI / DeepMind Reviewer Lens

Relevant strengths:

- Scientific evaluation discipline: the app separates governing equations,
  numerical implementation, synthetic overlays, fitting aids, and validation
  caveats.
- Physical-system reasoning: users can inspect how geometry, density ratio, and
  prescribed spreading laws affect normalized state variables.
- Multimodal technical evidence: 2D plots, 3D geometry, CSV data, equations, and
  report output support reasoning across text, visual, and numerical contexts.
- Cross-cultural communication: English, Japanese, and Spanish controls make the
  demo suitable for APAC/Japan and Latin America teaching or review contexts.

Best truthful framing:

- Evidence of rigorous scientific-computing habits that are useful for
  evaluating AI behavior in technical and physical-system domains.
- Evidence of multilingual technical communication and research-product
  judgment.
- Adjacent support for AI evaluation roles that need careful task design,
  boundary setting, and error analysis.

Avoid overclaiming:

- Do not describe the app as an LLM, frontier-model, or production ML system.
- Do not claim validated physical predictions or solver-ready CFD output.
- Do not present synthetic overlays as experimental validation.

## Google Cloud Developer Advocate Reviewer Lens

Relevant strengths:

- Public live demo with source code, local setup instructions, tests, build,
  lint, asset analysis, and visual smoke checks.
- Developer-facing explanation of equations, assumptions, limitations, export
  workflows, and reproducible examples.
- Workshop-ready flow for Cloud AI education: introduce a scientific use case,
  export structured data, write notebook-style analysis, and discuss how AI
  tools should preserve domain caveats.
- Static deployment model that keeps the app easy to run, inspect, fork, and
  discuss without requiring cloud credentials or private data.

Best truthful framing:

- Strong public evidence for explaining complex scientific-computing workflows
  to developers and mixed technical audiences.
- Useful foundation for Cloud AI demos around structured data, scientific model
  evaluation, report generation, and responsible technical caveats.
- Good proof of teachable sample-building trajectory without claiming
  professional DevRel employment or production Google Cloud architecture.

Avoid overclaiming:

- Do not describe this as a deployed Google Cloud architecture.
- Do not imply measured validation datasets are bundled.
- Do not imply the app makes engineering certification or production design
  decisions.

## Suggested Demo Script

1. Open the live app and select the dimensional water-air example.
2. Show how geometry changes alter normalized area, velocity, and entrainment.
3. Use the 3D view to connect visual geometry to the plotted state variables.
4. Export CSV data or generate a report to show reproducible handoff.
5. Explain the caveats in the README and report generator as part of the
   scientific evaluation story.

## High-ROI Next Improvements

- Add a short notebook that reads exported CSV and produces one figure plus one
  model-boundary discussion.
- Add two or three focused screenshots to the README after verifying they do not
  expose private desktop content.
- Add a public tutorial issue or roadmap entry for an AI-assisted evaluation
  notebook using only synthetic or permissibly licensed data.
