# Feature Pass Report

## Start State

- Start time: 2026-05-29T03:55:18+09:00
- Branch: `main`
- Starting commit: `622a31d`
- Remote: `origin` -> `https://github.com/ferminfm/ideal-momentum-jet-explorer.git`
- Sync: `git pull --ff-only origin main` returned `Already up to date.`

## Planned Feature Scope

- Saved parameter URLs for reproducible figures.
- CSV export for sampled state variables.
- Velocity comparison overlay infrastructure with no undocumented real data claims.
- Citation panel with copyable references.
- 3D selected cross-section and axis-switching highlight.
- Slider-first nozzle dimension controls.
- Updated affiliation text.
- Tests, build, lint, smoke checks, commit, push, and Pages verification.

## Files Modified

- `README.md`
- `DEPLOYMENT.md`
- `PROJECT_REPORT.md`
- `FEATURE_PASS_REPORT.md`
- `index.html`
- `package.json`
- `src/App.tsx`
- `src/components/CitationPanel.tsx`
- `src/components/ControlPanel.tsx`
- `src/components/ExportPanel.tsx`
- `src/components/JetGeometry3D.tsx`
- `src/components/Layout.tsx`
- `src/components/Plots.tsx`
- `src/data/citations.ts`
- `src/data/velocityOverlays.ts`
- `src/model/jetModel.ts`
- `src/model/jetModel.test.ts`
- `src/styles.css`
- `src/types/appState.ts`
- `src/utils/clipboard.ts`
- `src/utils/csvExport.ts`
- `src/utils/csvExport.test.ts`
- `src/utils/urlState.ts`
- `src/utils/urlState.test.ts`

## Commands Run

- `git status -sb`
- `git log --oneline -5`
- `git branch --show-current`
- `git pull --ff-only origin main`
- `rg --files src public .github README.md DEPLOYMENT.md PROJECT_REPORT.md package.json index.html vite.config.ts scripts`
- Public wording and feature keyword scan over `src`, public docs, metadata, and scripts.
- `npm run test`
- `npm run build`
- `npm run lint`
- `npm run dev -- --host 127.0.0.1 --port 5173 --strictPort`
- `npm run smoke:visual`
- `pkill -f "vite --host 127.0.0.1 --port 5173 --strictPort"`

## Validation Results

- `npm run test`: passed, 3 test files and 14 tests.
- `npm run build`: passed. Vite reported the expected large JavaScript chunk warning from bundled Plotly and Three.js.
- `npm run lint`: passed.
- `npm run smoke:visual`: passed on desktop and mobile. Plotly line rendering and Three.js canvas pixel checks succeeded.
- Public wording scan: no stale repository-owner token, internal positioning phrase, or old affiliation matches in requested public/source/doc paths.
- Dev-server note: Vite logged a dependency warning from Three.js about `THREE.Clock` deprecation during smoke testing; this did not fail validation.

## Deployment Status

Latest completed deployment: `6eab8af61fbd17bdb4b538f0f1e8601c7346abe2` through GitHub Actions run `26599473219`.
The GitHub Pages app responded with HTTP 200 at `https://ferminfm.github.io/ideal-momentum-jet-explorer/`.

## 2026-05-29 Language Interface Pass

- Added English/Japanese/Spanish interface switching through a typed translation module.
- Added `lang` to the shareable URL state and tested encode/decode/sanitize behavior.
- Added translated labels for the main public UI: header, controls, plots, 3D viewer, interpretation, citations, footer, and share/export controls.
- Validation after the language pass: `npm run test`, `npm run build`, `npm run lint`, and `npm run smoke:visual` passed locally.

## 2026-05-29 Mathematical Label Pass

- Added in-app mathematical rendering for visible variables such as `rho*`, `Ahat`, `vhat`, `rhohat`, `mhat_g`, `K_A`, `theta`, `phi`, `zeta`, and `De`.
- Updated Plotly axis and hover labels to use Unicode mathematical plain text.
- Kept numerical model logic, URL parameters, CSV column names, and citations unchanged.
- Validation after the math-label pass: `npm run test`, `npm run build`, `npm run lint`, and `npm run smoke:visual` passed locally.

## 2026-05-29 Downstream Range Pass

- Updated the maximum normalized downstream-distance slider from 20-100 to 10-60.
- Updated URL sanitization and clamping tests to match the new 10-60 range.

## 2026-05-29 Localized Title Pass

- Localized the visible app title and author/affiliation line in Japanese and Spanish.
- Japanese author display uses `フランコ＝メドラノ・フェルミン`.

## 2026-05-29 Saved Model-Case Comparison Pass

- Starting commit: `8bfb8a0682b4ea323481d9bfc4a4307ddb4bb314`.
- Feature commit: `6eab8af61fbd17bdb4b538f0f1e8601c7346abe2`.
- Added frozen saved model-case snapshots with fixed parameters and regenerated sampled curves.
- Added comparison controls for add, show/hide, show all, hide all, clear all, remove, color swatches, and settings tooltips.
- Added model comparison traces to all Plotly variables while keeping measured velocity overlays separate.
- Added compact URL serialization for saved model cases and CSV export with `caseLabel` for current plus visible saved cases.
- Added tests for comparison case creation, immutable snapshots, toggle/remove/clear behavior, URL round-trip, plot traces, and comparison CSV export.
- Validation: `npm run test`, `npm run build`, `npm run lint`, local `npm run smoke:visual`, live `npm run smoke:visual`, and a targeted live interaction smoke all passed.
- Deployment: pushed to `origin/main`; GitHub Actions run `26599473219` completed successfully.

## 2026-05-29 Entrainment Coefficient Reference Pass

- Starting commit: `9eec6267647bd3eb12ca269a10d464161d2356f9`.
- Added current-case `K_A(0)` and `K_A(∞)` reference values computed from directional area-growth rates.
- Added dashed/dotted horizontal reference traces and a compact readout on the `K_A` plot.
- Added tests for near-field equality at `zeta=0`, symmetric far-field behavior, AR=2 directional rates, zero/one-direction growth, slider extrema, and reference trace preparation.
- Validation before commit: `npm run test`, `npm run build`, `npm run lint`, `npm run smoke:visual`, and a targeted local `K_A` interaction smoke passed.
- Feature commit: `15c934134903699201940537d9c40df3b74389c2`.
- Deployment: pushed to `origin/main`; GitHub Actions run `26600532972` completed successfully. The live Pages app returned HTTP 200 and passed visual plus `K_A` interaction smoke checks.

## 2026-05-29 Traveling Fluid-Element Animation Pass

- Starting commit: `630065385193fddd78f644eb55349f5f64f41ad1`.
- Added a cyclic moving LHF element to the 3D viewer with play/pause, reset, droplet visibility, animation speed, and element-zeta readout controls.
- The element cross-section follows the current rectangular or elliptical model geometry and expands downstream with the prescribed area-growth state.
- Implemented 24 deterministic conserved liquid markers inside the element. The markers keep fixed count and size while positions scale with the local element dimensions.
- Added helper tests for zeta wrapping, zeta advancement, finite element frames, and normalized droplet-coordinate bounds.
- Validation before commit: `npm run test`, `npm run build`, `npm run lint`, `npm run smoke:visual`, and a targeted local traveling-element interaction smoke passed.
- Feature commit: `642130111e519ddaa9d9032ca02684e551847af8`.
- Deployment: pushed to `origin/main`; GitHub Actions run `26601438813` completed successfully. The live Pages app returned HTTP 200 and passed visual plus traveling-element interaction smoke checks.

## 2026-05-29 Equation Rendering And Symbols Glossary Pass

- Start time: `2026-05-29T06:13:40+09:00`.
- Starting commit: `2cf86c814be794e519d5c357d460c7f1b32e2024`.
- Feature commit: `fdacbc3f7bbef1c3a19ed22cdd08e2ca6787bf3f`.
- Branch: `main`.
- Files changed: `README.md`, `package.json`, `package-lock.json`, `src/App.tsx`, `src/main.tsx`, `src/styles.css`, `src/i18n/translations.ts`, `src/components/ControlPanel.tsx`, `src/components/EquationPanel.tsx`, `src/components/MathFormula.tsx`, `src/components/MathText.tsx`, `src/components/Plots.tsx`, `src/components/SymbolsGlossary.tsx`, `src/components/EquationPanel.test.tsx`, and `src/components/SymbolsGlossary.test.tsx`.
- Added direct KaTeX rendering for static equation and symbol strings, replacing the previous CSS-positioned hat overlay used by `MathText`.
- Increased display-equation sizing and added overflow-safe KaTeX CSS for narrow screens.
- Added a compact multilingual symbols glossary below the equation panel.
- Added active plot-variable descriptions and concise parameter tooltip definitions.
- Validation: `npm run test` passed with 9 test files and 37 tests; `npm run build` passed with the expected large-bundle warning from Plotly/Three; `npm run lint` passed; local `npm run smoke:visual` passed on desktop and mobile.
- Live deployment: feature commit pushed to `origin/main`; GitHub Actions run `26602572873` completed successfully; `curl -I https://ferminfm.github.io/ideal-momentum-jet-explorer/` returned HTTP 200; live `SMOKE_URL=https://ferminfm.github.io/ideal-momentum-jet-explorer/ npm run smoke:visual` passed.
- Known warning: Vite/browser smoke still reports the existing `THREE.Clock` deprecation warning from the 3D stack; no MathJax/KaTeX hat-rendering warnings remained after switching to direct KaTeX rendering.
- Remaining TODO: consider future bundle splitting for Plotly, Three.js, and KaTeX assets if initial load size becomes a priority.

## 2026-05-29 3D Controls And Model Explanation Pass

- Start time: `2026-05-29T13:53:12+09:00`.
- Starting commit: `9e65324`.
- Feature commit: `32b8e74`.
- Branch: `main`.
- Files changed: `README.md`, `package.json`, `package-lock.json`, `src/components/EquationPanel.tsx`, `src/components/EquationPanel.test.tsx`, `src/components/InterpretationPanel.tsx`, `src/components/JetGeometry3D.tsx`, `src/components/JetGeometry3D.test.tsx`, `src/components/Layout.tsx`, `src/i18n/translations.ts`, `src/styles.css`, `src/utils/capture3d.ts`, and `src/utils/capture3d.test.ts`.
- Fixed traveling-element visibility by reducing outer control-volume opacity while animating, disabling depth writes on the translucent surface and wireframe, and assigning higher render order plus stronger outline/highlight materials to the moving LHF element and its conserved liquid markers.
- Added browser-side 3D canvas PNG capture with filenames of the form `ideal-momentum-jet-3d-view_<timestamp>.png`.
- Added camera preset buttons for x, y, z, oblique 3/4, and reset views.
- Added visible 3D axes and a small rectangular/elliptical nozzle model with show/hide toggles.
- Reworked the equation panel into conservation system, highlighted explicit state laws, and derived quantities. The explicit velocity and composite-density formulas are now prominent.
- Added visible research-prototype/no-warranty wording and MIT license notice in the app, README, and package metadata.
- Validation: `npm run test` passed with 11 test files and 39 tests; `npm run build` passed with the expected large-bundle warning from Plotly/Three/KaTeX; `npm run lint` passed; local `npm run smoke:visual` passed on desktop and mobile; targeted Playwright interaction smoke passed for play, camera presets, axes/nozzle toggles, and PNG capture with zero console errors.
- Deployment: pushed to `origin/main`; GitHub Actions run `26618729298` completed successfully; `curl -I https://ferminfm.github.io/ideal-momentum-jet-explorer/` returned HTTP 200; live `SMOKE_URL=https://ferminfm.github.io/ideal-momentum-jet-explorer/ npm run smoke:visual` passed.
- Known warning: Vite/browser smoke still reports the existing `THREE.Clock` deprecation warning from the 3D stack.
- Remaining TODO: consider updating the GitHub Actions workflow actions when Node.js 20 action-runtime deprecation becomes urgent.

## 2026-05-29 Jet Enclosure Visibility Toggle Pass

- Start time: `2026-05-29T14:12:56+09:00`.
- Starting commit: `116e86c`.
- Feature commit: `4e44ce6`.
- Branch: `main`.
- Files changed: `README.md`, `src/components/JetGeometry3D.tsx`, `src/components/JetGeometry3D.test.tsx`, and `src/i18n/translations.ts`.
- Added a local 3D-view checkbox labeled `Show jet enclosure` / `噴流外形を表示` / `Mostrar envolvente del chorro`.
- The toggle hides the outer translucent jet surface, its wireframe, and the global background droplet points. The animated traveling LHF element, its conserved marker droplets, selected cross-section, axis-switching section, axes, and nozzle remain independently visible.
- Validation: `npm run test` passed with 11 test files and 39 tests; `npm run build` passed with the expected large-bundle warning from Plotly/Three/KaTeX; `npm run lint` passed; local `npm run smoke:visual` passed after starting the required Vite dev server; targeted Playwright interaction smoke passed for play animation, enclosure toggle, axes toggle, nozzle toggle, and canvas rendering with zero console errors.
- Deployment: feature commit pushed to `origin/main`; GitHub Actions run `26619350360` completed successfully; `curl -I https://ferminfm.github.io/ideal-momentum-jet-explorer/` returned HTTP 200; live `SMOKE_URL=https://ferminfm.github.io/ideal-momentum-jet-explorer/ npm run smoke:visual` passed.
- Known warnings: GitHub Actions reported the upstream Node.js 20 action-runtime deprecation for current action versions; local Vite/browser logging still reports the existing `THREE.Clock` deprecation warning from the 3D stack.
- Remaining TODO: consider updating the GitHub Actions workflow actions/runtime settings before the Node.js 20 action-runtime removal window.

## 2026-05-29 UX Layout And Collapsible Sections Pass

- Start time: `2026-05-29T18:58:14+09:00`.
- Starting commit: `c51f74a`.
- Feature commit: `38af99d`.
- Branch: `main`.
- Files changed: `README.md`, `src/App.tsx`, `src/components/CollapsibleSection.tsx`, `src/components/CollapsibleSection.test.tsx`, `src/i18n/translations.ts`, and `src/styles.css`.
- Reordered the main rail so the terminal summary is followed by the 3D jet view, saved model cases, plots, model scope, and citations.
- Added an accessible reusable collapsible-section wrapper with `aria-expanded`, `aria-controls`, keyboard-friendly button headers, and English/Japanese/Spanish section labels.
- Wrapped major left-rail sections: model parameters, saved cases, reproducibility/export, reduced model equations, and symbols glossary.
- Wrapped major main-rail sections: 3D jet view, saved model cases, plots, model scope/disclaimer, and citations.
- Made the desktop left rail sticky and internally scrollable with `max-height: calc(100vh - 2rem)`; mobile/tablet layout falls back to normal stacked scrolling.
- Validation: `npm run test` passed with 12 test files and 40 tests; `npm run build` passed with the expected large-bundle warning from Plotly/Three/KaTeX; `npm run lint` passed; local `npm run smoke:visual` passed; targeted Playwright UX smoke confirmed 3D-before-plots ordering, sticky controls, collapsible toggles, live geometry switching, and canvas rendering with zero console errors.
- Deployment: feature commit pushed to `origin/main`; GitHub Actions run `26630791545` completed successfully; `curl -I https://ferminfm.github.io/ideal-momentum-jet-explorer/` returned HTTP 200; live `SMOKE_URL=https://ferminfm.github.io/ideal-momentum-jet-explorer/ npm run smoke:visual` passed.
- Known warnings: GitHub Actions reported the upstream Node.js 20 action-runtime deprecation for current action versions; local Vite/browser logging still reports the existing `THREE.Clock` deprecation warning from the 3D stack.
- Remaining TODO: consider future bundle splitting for Plotly/Three/KaTeX assets and updating GitHub Actions runtime settings before Node.js 20 action-runtime removal.

## 2026-05-29 Top Layout And Growth-Rate Notation Pass

- Start time: `2026-05-29T19:53:41+09:00`.
- Starting commit: `77ae1b1`.
- Feature commit: `88e340f`.
- Branch: `main`.
- Files changed: `src/App.tsx`, `src/components/Layout.tsx`, `src/components/Layout.test.tsx`, `src/components/Plots.tsx`, `src/components/SymbolsGlossary.tsx`, `src/components/SymbolsGlossary.test.tsx`, `src/i18n/translations.ts`, and `src/styles.css`.
- Removed the terminal summary cards from the top of the main rail so the 3D jet view is the first major main panel.
- Removed the collapsible wrapper around `CitationPanel`; citations remain visible/open in the main rail.
- Added the obfuscated header contact line `fermin.franco *at* uabc.edu.mx` without a `mailto:` link or machine-readable address.
- Clarified the `K_A` coefficient reference strip with directional growth-rate labels: rectangular `beta`/`eta` as width/height-direction rates and elliptical `alpha`/`gamma` as major/minor-axis rates.
- Added glossary entries for `lambda_1,lambda_2`, `beta`, `eta`, `alpha`, and `gamma` in English, Japanese, and Spanish.
- Validation: `npm run test` passed with 13 test files and 41 tests; `npm run build` passed with the expected large-bundle warning from Plotly/Three/KaTeX; `npm run lint` passed; local `npm run smoke:visual` passed; targeted Playwright smoke confirmed the summary cards were absent, email was visible, citations were open, 3D preceded plots, and `K_A` growth-rate labels changed correctly between rectangular and elliptical geometry.
- Deployment: feature commit pushed to `origin/main`; GitHub Actions run `26633143946` completed successfully; `curl -I https://ferminfm.github.io/ideal-momentum-jet-explorer/` returned HTTP 200; live `SMOKE_URL=https://ferminfm.github.io/ideal-momentum-jet-explorer/ npm run smoke:visual` passed.
- Known warnings: GitHub Actions reported the upstream Node.js 20 action-runtime deprecation for current action versions; local Vite/browser logging still reports the existing `THREE.Clock` deprecation warning from the 3D stack.
- Remaining TODO: consider future bundle splitting for Plotly/Three/KaTeX assets and updating GitHub Actions runtime settings before Node.js 20 action-runtime removal.

## 2026-05-29 Engineering Core Foundation Branch

- Start time: `2026-05-29T20:01:22+09:00`.
- Starting commit: `4ba550d`.
- Branch: `feature/engineering-core-foundation`.
- New files: `src/model/engineering.ts`, `src/model/engineering.test.ts`, `src/data/fluidPresets.ts`, and `ROADMAP_INDUSTRY.md`.
- Modified files: `README.md` and `FEATURE_PASS_REPORT.md`.
- Added a pure TypeScript SI-unit engineering layer for fluid properties, dimensional operating points, engineering scales, dimensionless groups, and dimensionalized jet states.
- Added representative exploratory fluid presets for water, diesel-like fuel, gasoline-like fuel, air, and a high-density chamber gas example.
- Implemented velocity-mode and pressure-drop-mode injection velocity, equivalent-diameter area, density ratio from fluids, dynamic pressure scale, liquid mass flow rate, liquid momentum flux, `Re_l`, `We_l`, `Oh_l`, approximate gas Mach number, and dimensionalized state/series utilities.
- The normalized model, UI, saved URLs, plots, 3D view, and CSV export were not changed.
- Validation before commit: `npm run test` passed with 14 test files and 48 tests; `npm run build` passed with the expected large-bundle warning from Plotly/Three/KaTeX; `npm run lint` passed; local `npm run smoke:visual` passed after starting the required Vite dev server.
- Limitations: engineering utilities are not yet exposed in the UI, fluid properties are representative values only, and regime/applicability logic is not implemented in this unit.
- Next recommended unit: dimensional-mode UI and material presets connected to this model-layer foundation.
