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

Pending commit, push, and GitHub Pages workflow verification.

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
