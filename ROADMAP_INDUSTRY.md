# Industry-Oriented Roadmap

This roadmap tracks the incremental path from the current normalized research app to an
engineering-oriented workflow. The app remains a research prototype; engineering use
requires independent validation.

## 1. Engineering Mode Foundation

- Goal: add typed SI-unit conversions, fluid properties, dimensional scales, and
  nondimensional groups without changing the normalized UI.
- Expected files/components: `src/model/engineering.ts`,
  `src/data/fluidPresets.ts`, model tests.
- Dependencies: existing `JetSeries` and `JetState` normalized outputs.
- Risk level: low. Pure model-layer utilities with tests.
- Status: implemented on `feature/engineering-core-foundation`.

## 2. Dimensional UI And Material Presets

- Goal: expose dimensional inputs for liquid/gas selection, physical nozzle
  dimensions, injection velocity, pressure drop, and discharge coefficient.
- Expected files/components: `ControlPanel`, `EngineeringSummaryPanel`,
  `src/model/dimensionalMapping.ts`, URL state, CSV export extensions.
- Dependencies: Unit 1 engineering model foundation.
- Risk level: medium. Requires UI state migration without breaking saved URLs.
- Status: implemented on `feature/dimensional-mode-ui`.
- Deferred: dimensional plot-unit toggles remain a Unit 2b/Unit 3-adjacent item.

## 3. Regime And Applicability Checker

- Goal: report basic regime flags from `Re_l`, `We_l`, `We_g`, `Oh_l`, Mach
  estimate, density ratio, aspect ratio, and prescribed spreading angles.
- Expected files/components: `src/model/regimeChecker.ts`,
  `RegimeApplicabilityPanel`, interpretation/status panel.
- Dependencies: dimensional operating point and nondimensional groups.
- Risk level: medium. Must avoid overclaiming validation.
- Status: implemented on `feature/regime-applicability-checker`.

## 4. Public Validation Overlays And CSV Data Import

- Goal: load documented public comparison datasets or user CSV curves for velocity
  and related quantities.
- Expected files/components: `src/data/`, overlay import utilities, plotting controls.
- Dependencies: current overlay architecture and citation metadata.
- Risk level: high. Data provenance and licensing must be explicit.
- Status: implemented on `feature/data-overlay-foundation`.
- Notes: no measured public validation dataset is bundled yet. User-imported CSV
  overlays remain local in the browser and are not encoded in shareable URLs.

## 5. Calibration And Fitting Of Spreading Angles

- Goal: fit prescribed half-angles to selected measured/model curves.
- Expected files/components: fitting utilities, objective-function tests, calibration UI.
- Dependencies: public/user data import and robust dimensional state outputs.
- Risk level: high. Optimization results need uncertainty and validation caveats.
- Status: next recommended unit after review of the data-overlay foundation.

## 6. Lossy Model Extensions

- Goal: introduce optional pressure/momentum-loss factors or empirical corrections.
- Expected files/components: model extension module, toggles, tests, documentation.
- Dependencies: calibration and validation datasets.
- Risk level: high. Changes model assumptions and must remain opt-in.

## 7. Quasi-Steady Tip Penetration

- Goal: estimate transient penetration from quasi-steady dimensional outputs.
- Expected files/components: time/penetration model utilities, plots, CSV export.
- Dependencies: dimensional scales, regime checks, and validation references.
- Risk level: high. Adds a new physical model branch.

## 8. CFD / Configuration Export

- Goal: export nozzle, fluid, and operating-point settings to reusable JSON/YAML
  snippets for simulation setup.
- Expected files/components: export utilities and schema tests.
- Dependencies: dimensional UI and validated parameter naming.
- Risk level: medium. Must avoid implying solver-ready CFD completeness.

## 9. Report Generator

- Goal: generate a compact research/engineering summary with inputs, figures,
  nondimensional groups, caveats, and citations.
- Expected files/components: browser-side report builder, print CSS, citation helpers.
- Dependencies: dimensional UI, plot export, and regime checks.
- Risk level: medium. Wording must remain conservative.

## 10. Performance / Tutorial / Showcase Polish

- Goal: reduce bundle size, add guided examples, and improve public onboarding.
- Expected files/components: route-level code splitting, examples, documentation.
- Dependencies: stable feature set and performance measurements.
- Risk level: low to medium. Main risk is UI clutter.
