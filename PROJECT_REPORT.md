# Project Report

## Local Repository

Use the project root on the local workstation or clone from the public
repository URL below.

## Public URLs

- GitHub repository: `https://github.com/ferminfm/ideal-momentum-jet-explorer`
- GitHub Pages app: `https://ferminfm.github.io/ideal-momentum-jet-explorer/`
- Maintainer affiliation: Fermín Franco-Medrano — Ensenada Campus, Autonomous University of Baja California / Institute of Mathematics for Industry, Kyushu University

## Local Commands

- Local dev: `npm run dev -- --host 127.0.0.1`
- Test: `npm run test`
- Build: `npm run build`
- Lint: `npm run lint`
- Visual smoke test: `npm run smoke:visual`
- Production preview: `npm run preview -- --host 127.0.0.1`

## Current Deployment Status Before Unit 11 Release PR

- Branch: `main`
- Remote: `origin` -> `https://github.com/ferminfm/ideal-momentum-jet-explorer.git`
- GitHub Pages workflow: `.github/workflows/deploy.yml`
- Vite project base: `/ideal-momentum-jet-explorer/`
- Latest deployed main before Unit 11 integration branch: `0adad3c`.
- Latest verified deployment run: GitHub Actions run `26618729298`, completed successfully.
- Live Pages check: `curl -I https://ferminfm.github.io/ideal-momentum-jet-explorer/` returned HTTP 200.

## Validation Status

- `npm run test`: passed, 11 test files and 39 tests after adding comparison-case, plot-trace, URL, CSV, language-state, math formatter, entrainment-coefficient reference, traveling-element helper, equation-panel, symbols-glossary, 3D-control, and capture-helper coverage.
- `npm run build`: passed with no TypeScript errors. Vite reported the expected large-bundle warning because Plotly and Three.js are bundled client-side.
- `npm run lint`: passed.
- `npm run smoke:visual`: passed on desktop and mobile; Plotly line output and Three.js canvas pixel checks both rendered.
- Live `npm run smoke:visual` with `SMOKE_URL=https://ferminfm.github.io/ideal-momentum-jet-explorer/`: passed on desktop and mobile.
- Local targeted 3D interaction smoke: passed for play, camera presets, axes/nozzle toggles, and PNG capture.
- Live interaction smoke: passed for add saved case, change geometry, hide/show saved case, settings tooltip, and remove saved case.
- Local `K_A` reference interaction smoke: passed for reference lines, slider update to zero growth, and saved comparison overlay coexistence.
- Live `K_A` reference interaction smoke: passed for reference lines, slider update to zero growth, and saved comparison overlay coexistence.
- Local traveling-element interaction smoke: passed for play/pause, zeta advancement, reset, droplet toggle, rectangular-to-elliptical switching, and 3D canvas rendering.
- Live traveling-element interaction smoke: passed for play/pause, zeta advancement, reset, droplet toggle, rectangular-to-elliptical switching, and 3D canvas rendering.
- Public wording scan: no matches for stale repository owner tokens or internal positioning phrases in the requested public/source/doc paths.

## Feature Pass Summary

- Added saved parameter URLs using query-string encoding for model, plot, overlay, and 3D cross-section state.
- Added CSV export for sampled state variables.
- Added velocity overlay infrastructure with a clearly labeled synthetic example and no measured-data validation claim.
- Added a citation panel with copy buttons for plain text, BibTeX, LaTeX, and Word/APA-style references.
- Added selected cross-section controls and computed axis-switching highlighting in the 3D viewer.
- Replaced initial dimension text boxes with slider-first controls.
- Updated affiliation text in the UI and metadata.

## Language UI Pass Summary

- Added an interface language switcher for English, Japanese, and Spanish.
- Added translated UI copy for the header, controls, export panel, equations, plots, 3D viewer, interpretation panel, citation panel, and footer.
- Added the selected language to shareable URLs through the `lang` query parameter.
- Kept model equations, numerical logic, citation records, and CSV schema unchanged.

## Mathematical Label Pass Summary

- Replaced code-style variable labels in the public UI with mathematical rendering for hats, Greek symbols, subscripts, and equation labels.
- Added a lightweight local math-label component and plain-text formatter for Plotly axis and hover labels.
- Kept the app dependency set unchanged; no CDN or server-side math rendering is required.

## Equation Rendering And Symbols Glossary Summary

- Starting commit for this pass: `2cf86c814be794e519d5c357d460c7f1b32e2024`.
- Feature commit for this pass: `fdacbc3f7bbef1c3a19ed22cdd08e2ca6787bf3f`.
- Added direct KaTeX rendering for static equations and symbols.
- Removed the fragile CSS-positioned hat and dot overlay from the visible math-token renderer.
- Increased display-equation font sizing and added overflow-safe KaTeX styling for narrow screens.
- Added a compact multilingual symbols glossary covering `zeta`, `De`, `rho*`, normalized state variables, nozzle dimensions, spreading angles, `A0`, and `A(z)`.
- Added active plot-variable descriptions and concise parameter tooltip definitions.
- Added component tests for the equation panel and symbols glossary.

## 3D Controls And Model Explanation Summary

- Starting commit for this pass: `9e65324`.
- Feature commit for this pass: `32b8e74`.
- The traveling LHF element now remains visible inside the translucent jet after axis switching by using non-depth-writing outer surfaces, lower outer opacity while animating, and higher render order for the highlighted moving element, outline, and marker droplets.
- Added a browser-side `Capture 3D view` PNG export for the current WebGL canvas.
- Added 3D camera preset buttons for x, y, z, oblique 3/4, and reset views.
- Added visible 3D axes and a small geometry-aware nozzle model with toggles.
- Reworked the equation panel so the explicit `Delta`, `vhat`, `rho_tilde`, and `rhohat` solved formulas are highlighted separately from the conservation system.
- Added visible research-prototype/no-warranty wording and MIT license notices in the app and README.
- Added package metadata for MIT license, repository, homepage, bugs URL, and keywords.

## Control Range Updates

- Set the maximum normalized downstream-distance control range to 10-60.
- Updated URL sanitization so old or out-of-range shared links clamp to the same 10-60 range.

## Localization Updates

- Localized the main app title and author/affiliation line for Japanese and Spanish interface modes.
- Japanese author display uses `フランコ＝メドラノ・フェルミン`.

## Saved Model-Case Comparison Summary

- Added saved model-case comparison overlays for all model-generated plot variables.
- Saved cases are frozen parameter snapshots with regenerated sampled curves; they do not change when sliders move.
- Added comparison controls for show/hide, show all, hide all, clear all, remove, color swatches, and settings tooltips.
- Added compact URL serialization for saved comparison cases so shareable URLs restore current state and saved model cases.
- CSV export now includes `caseLabel` and exports the current curve plus all visible saved comparison cases.

## Entrainment Coefficient Reference Summary

- Starting commit for this pass: `9eec6267647bd3eb12ca269a10d464161d2356f9`.
- Added model helpers for directional area-growth rates and entrainment-coefficient reference values.
- The `K_A` plot now shows current-case horizontal reference lines for the exact near-field value `K_A(0)` and the far-field asymptote `K_A(∞)`.
- Added a compact `K_A` readout for `K_A(0)`, `K_A(∞)`, `lambda_1`, and `lambda_2`.
- Saved comparison-case tooltips now include the near-field and far-field coefficient references for the frozen case.
- Far-field references use `K_A(∞)=sqrt(lambda_1 lambda_2)` only when both directional growth rates are positive; otherwise the app reports zero for the current model.

## Traveling Fluid-Element Animation Summary

- Starting commit for this pass: `630065385193fddd78f644eb55349f5f64f41ad1`.
- Feature commit for this pass: `642130111e519ddaa9d9032ca02684e551847af8`.
- Added a cyclic conceptual LHF fluid-element animation to the 3D jet viewer.
- The moving element uses the current prescribed rectangular or elliptical cross-section and expands as it travels from `zeta=0` to `zeta_max`.
- Added play/pause, reset, droplet visibility, animation-speed, and element-zeta controls in English, Japanese, and Spanish.
- Implemented 24 deterministic conserved liquid markers inside the moving element. The marker count and radius remain fixed while their normalized positions redistribute across the expanding local element.
- The animation is a visualization of the locally homogeneous-flow interpretation, not a droplet dynamics, breakup, collision, turbulence, or axis-switching prediction.
- Deployment: pushed to `origin/main`; GitHub Actions run `26601438813` completed successfully and the live Pages URL returned HTTP 200.

## Public-Facing Polish Summary

- Replaced source-code links with `https://github.com/ferminfm/ideal-momentum-jet-explorer`.
- Removed internal positioning language from the public UI.
- Reframed the header as a browser-based scientific computing app for reduced-order fluid-mechanics exploration.
- Strengthened model-scope text around conservative top-hat closure, prescribed inputs, non-predicted physics, and validation limits.
- Added compact model-lineage text for the JPSJ 2017 circular model, noncircular rectangular/elliptical extension, and Kumamoto JSFM 2026 short conference version.
- Updated README, deployment notes, package metadata, and HTML metadata for public release.

## Implemented App Features

- Client-side TypeScript implementation of the rectangular and elliptical ideal momentum jet model.
- Presets for circular, square, aspect-ratio 2, Gutmark-like equal-density, liquid-in-air, and equal-density cases.
- Interactive controls for geometry, density ratio, initial dimensions, spreading half-angles, zeta range, and sample count.
- Plotly plots for normalized area, velocity, density, dynamic pressure, gas entrainment, and `K_A`.
- Saved model-case comparison overlays on all Plotly model variables.
- Three.js control-volume viewer with translucent rectangular or elliptical frustum geometry.
- Traveling LHF fluid-element animation with conserved marker droplets in the 3D viewer.
- GitHub Pages deployment through GitHub Actions.
- Saved share URLs, CSV export, citation copying, data-overlay infrastructure, and 3D cross-section inspection.
- Compact URL restoration for saved model comparisons.
- English, Japanese, and Spanish interface modes with language state encoded in reproducible URLs.

## Known Limitations

- Spreading half-angles are prescribed inputs; the model does not predict them.
- Axis switching, vortex dynamics, breakup, turbulence, losses, and droplet-size distributions are outside the reduced-order model.
- The traveling fluid-element markers are conceptual conserved-liquid markers and do not model droplet-size evolution or interactions.
- Composite density needs independent phase-fraction or concentration validation.
- No measured/literature data-overlay dataset is bundled yet; the current built-in overlay is synthetic and only demonstrates the plotting mechanism.
- The initial JavaScript bundle is large because Plotly and Three.js are bundled client-side; code-splitting is a reasonable future optimization.
- GitHub Pages is public; private manuscripts, PDFs, credentials, and non-public datasets must stay out of committed assets.

## Dimensional Engineering Mode Branch

- Branch: `feature/dimensional-mode-ui`.
- Starting commit: `083a3b2`.
- Feature commit: branch `HEAD` after this report update; exact hash recorded in the final report.
- Added a dimensional input mode on top of the engineering core foundation.
- Added fluid preset selectors, physical nozzle dimension sliders in mm, velocity/pressure-drop operating inputs, discharge coefficient control, and an engineering summary panel.
- Dimensional mode maps physical nozzle geometry to the existing equivalent-diameter normalized model and preserves normalized mode as the default behavior.
- Saved URL state now includes dimensional-mode settings; CSV export adds SI-unit current-curve columns in dimensional mode.
- Validation before commit: `npm run test`, `npm run build`, `npm run lint`, and local `npm run smoke:visual` passed.
- Deferred: dimensional plot-unit toggles and regime/applicability checks.

## Regime Applicability Checker Branch

- Branch: `feature/regime-applicability-checker`.
- Starting commit: `b45b0f6`.
- Feature commit: branch `HEAD` after this report update; exact hash recorded in the final report.
- Added gas Weber number to dimensional engineering groups.
- Added a heuristic regime/applicability checker for `Re_l`, `We_l`, `We_g`, `Oh_l`, gas Mach estimate, density ratio, aspect ratio, spreading angles, and dimensional-mode availability.
- Added a compact app panel that reports overall applicability, nondimensional groups, recommended use, and concise warnings.
- The checker is explicitly scoped as heuristic screening, not a validated breakup-regime map or engineering certification.
- Validation before commit: `npm run test`, `npm run build`, `npm run lint`, and local `npm run smoke:visual` passed.
- Next recommended unit: Unit 4 data overlay/import foundation.

## Data Overlay Import Foundation Branch

- Branch: `feature/data-overlay-foundation`.
- Starting commit: `de85d95`.
- Feature commit: branch `HEAD` after this report update; exact hash recorded in the final report.
- Added a general data-overlay model that is separate from saved model-generated comparison cases.
- Added a built-in overlay registry. The current bundled overlay is a synthetic velocity demo only, not measured or literature data.
- Added a local browser-side CSV importer for user comparison curves with x/y column selection, optional error columns, target-variable selection, and row/size validation.
- Added a data-overlay manager panel for built-in overlays, CSV imports, show/hide, removal, and clearing user or all overlays.
- Plotly plots now render visible data overlays only on matching variables, with markers, optional error bars, and source/notes hover text.
- Saved URL behavior: built-in overlays can be encoded; imported CSV overlays are intentionally not encoded and remain session-local.
- Documentation now states that overlays are comparison aids only, no measured public validation dataset is bundled yet, and this unit does not fit model parameters.
- Validation before commit: `npm run test` passed with 18 test files and 76 tests; `npm run build` passed with the expected large-bundle warning from Plotly/Three/KaTeX; `npm run lint` passed; local `npm run smoke:visual` passed on desktop and mobile.
- Known warning: local Vite/browser logging still reports the existing `THREE.Clock` deprecation warning from the 3D stack.
- Next recommended unit: Unit 5 calibration/fitting of prescribed spreading angles.

## Post Unit 4 Steering Cleanup

- Branch: `feature/data-overlay-foundation`.
- Starting commit: `c118447`.
- Feature commit: branch `HEAD` after this report update; exact hash recorded in the final report.
- Marked Unit 6 lossy model extensions as deferred until the governing equations, assumptions, and validation strategy are formally documented.
- Corrected Unit 7 roadmap dependencies so quasi-steady tip penetration can proceed independently from the deferred lossy model.
- Clarified liquid-gas surface/interfacial tension terminology for engineering presets and dimensionless groups.
- Clarified engineering summary labels for initial liquid mass flow rate and initial liquid momentum flux at the nozzle.
- Adjusted regime-checker angle thresholds so maximum UI half-angles can trigger the intended warning.
- Confirmed user-imported overlay data remain session-local and are not encoded in shareable URLs; built-in overlays are encoded only by ID and visibility.
- Validation before commit: `npm run test` passed with 18 test files and 81 tests; `npm run build` passed with the expected large-bundle warning from Plotly/Three/KaTeX; `npm run lint` passed; local `npm run smoke:visual` passed on desktop and mobile.
- Known warning: local Vite/browser logging still reports the existing `THREE.Clock` deprecation warning from the 3D stack.

## Units 1-4 Merged To Main

- Previous main commit: `4ba550d`.
- Merged branch: `origin/feature/data-overlay-foundation`.
- Reviewed branch commit: `7a645ce`.
- Merge commit: `086d071`.
- Safety backup branch: `backup/main-before-units-1-4-merge-20260529-2131`.
- Commands run before and after merge: `npm run test`, `npm run build`, `npm run lint`, and `npm run smoke:visual`.
- Validation on reviewed branch: `npm run test` passed with 18 test files and 81 tests; `npm run build` passed with the expected large-bundle warning; `npm run lint` passed; local `npm run smoke:visual` passed on desktop and mobile.
- Validation on merged main: `npm run test` passed with 18 test files and 81 tests; `npm run build` passed with the expected large-bundle warning; `npm run lint` passed; local `npm run smoke:visual` passed on desktop and mobile.
- Scope check: Unit 5 calibration code was not merged; Unit 6 lossy model remains deferred.
- Deployment status: pending push to `origin/main` and GitHub Pages workflow.

## Calibration Mode Branch

- Branch: `feature/calibration-mode`.
- Starting commit: `7a645ce`.
- Feature commit: branch `HEAD` after this report update; exact hash recorded in the final report.
- Added a browser-side calibration model for fitting prescribed spreading half-angles to selected built-in or user-imported overlays.
- Implemented symmetric-angle, two-angle, theta-only, and phi-only calibration modes.
- Optimizer strategy: bounded coarse-grid search followed by coordinate refinement of the active angle parameters.
- Supported targets: normalized `Ahat`, `vhat`, `rhohat`, `phat`, `mhat_g`, and `K_A`.
- Added a calibration panel with fit results, fitted-curve preview, apply fitted parameters, and add fitted curve to saved model cases.
- Calibration remains explicitly scoped as exploratory parameter fitting, not physical validation.
- Validation before commit: `npm run test` passed with 20 test files and 91 tests; `npm run build` passed with the expected large-bundle warning from Plotly/Three/KaTeX; `npm run lint` passed; local `npm run smoke:visual` passed on desktop and mobile after starting the required Vite dev server.

## Tip Penetration Module Branch

- Branch: `feature/tip-penetration-module`.
- Starting commit: `74e04f7`.
- Feature commit: branch `HEAD` after this report update; exact hash recorded in the final report.
- Added a quasi-steady kinematic tip-penetration estimate based on `d zeta / d tau = vhat(zeta)`.
- Added dimensional display and CSV fields when dimensional engineering scales are available.
- Added a compact panel below the main plots with penetration summary values, Plotly curve, and penetration CSV export.
- The module is explicitly scoped as a research/visualization estimate, not a full transient spray model or validation claim.
- Validation before commit: `npm run test` passed with 22 test files and 98 tests; `npm run build` passed with the expected large-bundle warning from Plotly/Three/KaTeX; `npm run lint` passed; local `npm run smoke:visual` passed on desktop and mobile after starting the required Vite dev server; targeted browser check passed for normalized and dimensional penetration-panel output.

## CFD Configuration Export Branch

- Branch: `feature/cfd-config-export`.
- Starting commit: `4cf0f47`.
- Feature commit: branch `HEAD` after this report update; exact hash recorded in the final report.
- Added a typed CFD/configuration export payload for solver-agnostic reduced-order setup summaries.
- Added browser-side downloads for JSON, YAML-like text, Markdown summaries, and OpenFOAM-oriented setup notes.
- The OpenFOAM output is intentionally notes-only: it does not generate a solver-ready case, mesh, dictionaries, boundary conditions, multiphase setup, or numerical schemes.
- Export options can include sampled normalized states, dimensional states when dimensional mode is active, regime assessment, quasi-steady tip penetration, data overlays by explicit opt-in, and saved model comparison cases.
- Added a compact multilingual export panel in the reproducibility section.
- Validation before commit: `npm run test` passed with 25 test files and 109 tests; `npm run build` passed with the expected large-bundle warning from Plotly/Three/KaTeX; `npm run lint` passed; local `npm run smoke:visual` passed on desktop and mobile after starting the required Vite dev server.
- Known warning: local Vite/browser logging still reports the existing `THREE.Clock` deprecation warning from the 3D stack.
- Next recommended unit: Unit 9 report generator.

## Browser-Side Report Generator Branch

- Branch: `feature/report-generator`.
- Starting commit: `78e15cf`.
- Feature commit: branch `HEAD` after this report update; exact hash recorded in the final report.
- Added a typed report payload builder for compact research/engineering summaries of the current app state.
- Added Markdown and self-contained HTML report serialization with escaped user-provided strings.
- Added a report panel in the reproducibility section with title/author fields, optional section checkboxes, sampled-state stride, in-app preview, browser print/save-as-PDF, Markdown download, and HTML download.
- Optional sections include dimensional summary, regime assessment, sampled state table, saved model cases, data overlays by explicit opt-in, quasi-steady tip penetration, CFD/config summary, citations, and research-use disclaimer.
- The report generator is browser-side only and does not upload data or add server-side/heavy PDF-generation dependencies.
- Validation before commit: `npm run test` passed with 28 test files and 117 tests; `npm run build` passed with the expected large-bundle warning from Plotly/Three/KaTeX; `npm run lint` passed; local `npm run smoke:visual` passed on desktop and mobile after starting the required Vite dev server; targeted browser check passed for report preview and disclaimer rendering.
- Known warning: local Vite/browser logging still reports the existing `THREE.Clock` deprecation warning from the 3D stack.
- Next recommended unit: Unit 10 performance/tutorial/showcase polish.

## Performance Showcase Polish Branch

- Branch: `feature/performance-showcase-polish`.
- Starting commit: `4e2a4cb`.
- Feature commit: branch `HEAD` after this report update; exact hash recorded in the final report.
- Added dependency-free asset reporting with `scripts/report-build-assets.mjs` and `npm run analyze:assets`.
- Added lazy loading and Suspense fallbacks for Plotly plots, Three.js 3D viewer, data overlays, calibration, tip penetration, CFD/config export, and report tools.
- Added optional unmounting for collapsed heavy sections so closed tooling does not mount until opened.
- Added Vite manual chunks for React, Plotly, and Three.js.
- Added quick-start examples for circular, rectangular, elliptical, dimensional water-air, and equal-density scenarios.
- Added public README showcase polish, project `AGENTS.md`, and `PERFORMANCE_REPORT.md`.
- Validation before commit: `npm run test` passed with 30 test files and 119 tests; `npm run build` passed with the expected large Plotly/Three chunk warning; `npm run lint` passed; `npm run analyze:assets` passed; local `npm run smoke:visual` passed on desktop and mobile after starting the required Vite dev server; targeted browser check passed for applying a quick-start example.
- Known warning: local Vite/browser logging still reports the existing `THREE.Clock` deprecation warning from the 3D stack.
- Next recommended action: merge reviewed feature branches into main in order or open PRs.

## Unit 11 Integration Release Branch

- Branch: `integration/industry-features-release`.
- Starting main commit: `0adad3c`.
- Units 1-4 were already present on `main` before this integration branch.
- Merged feature branches:
  - `origin/feature/calibration-mode` at `74e04f7`.
  - `origin/feature/tip-penetration-module` at `4cf0f47`.
  - `origin/feature/cfd-config-export` at `78e15cf`.
  - `origin/feature/report-generator` at `4e2a4cb`.
  - `origin/feature/performance-showcase-polish` at `189fb30`.
- Unit 6 lossy model branch was not found and was not merged; the roadmap keeps
  Unit 6 deferred until the governing equations, assumptions, and validation
  strategy are formally documented.
- Conflicts encountered: `FEATURE_PASS_REPORT.md` and `PROJECT_REPORT.md`
  during the Unit 5 merge. The resolution kept both the Units 1-4 main-merge
  notes and the Unit 5 calibration notes. Later merges were automatic.
- Version metadata updated to `0.2.0` in `package.json` and `package-lock.json`.
- Added `CHANGELOG.md` with the industry feature integration summary.
- Public-safety scan: no committed PDF files were found. Local absolute paths
  were removed from public documentation. Remaining `private`, `token`, and
  related hits are package metadata/dependency names, safety instructions, or
  tests for HTML escaping and URL privacy.
- Validation:
  - `npm run test` passed with 30 files and 119 tests.
  - `npm run build` passed with the expected large Plotly chunk warning.
  - `npm run lint` passed.
  - `npm run analyze:assets` passed; largest chunks were Plotly
    `4535.12 kB` raw / `1345.08 kB` gzip and Three `904.27 kB` raw /
    `240.25 kB` gzip.
  - `npm run smoke:visual` passed on desktop and mobile after starting the Vite
    dev server.
  - `npm audit --omit=dev` reported 0 vulnerabilities.
- Known warning: local Vite/browser logging still reports the existing
  `THREE.Clock` deprecation warning from the 3D dependency stack.
- Deployment status: integration branch prepared for PR; `main` is not changed
  by this pass until the PR is reviewed and merged.

## Pre-Merge Calibration Cleanup

- Branch: `integration/industry-features-release`.
- Starting commit: `3e78f21`.
- Fixed calibration target synchronization so the selected target follows the
  active overlay variable when overlays first appear or when the selected
  overlay changes.
- Added a translated mismatch warning when the user intentionally fits a target
  variable different from the overlay variable.
- Localized calibration failure display in the UI; raw model-layer messages are
  available only under a technical-details disclosure.
- Unit 6 remains deferred; no lossy-model code was added.
- Validation:
  - `npm run test` passed with 30 files and 123 tests.
  - `npm run build` passed with the expected large Plotly chunk warning.
  - `npm run lint` passed.
  - `npm run analyze:assets` passed.
  - `npm run smoke:visual` passed on desktop and mobile after starting the Vite
    dev server.
- Integration checks: user-imported overlays remain session-local and are not
  encoded in URLs; citations remain visible; the 3D section remains before
  plots; no local absolute paths were found in public docs/source scans.

## Post-v0.2.0 UI And Scientific Polish

- Branch: `fix/post-v0.2.0-ui-scientific-polish`.
- Starting commit: `13fc104`.
- Feature commit: branch `HEAD` after this report update; exact hash recorded
  in the final report.
- Added shared app metadata and displayed `Ideal Momentum Jet Explorer v0.2.0`
  in the header.
- Fixed CFD/config export and report-generator checkbox option layout to avoid
  label overlap.
- Renamed the user-facing state-stride control to "Export every Nth sampled
  state" and added explanatory helper text.
- Added model and plot-helper tests for the equal-density symmetric `K_A`
  branch and flattened near-constant plotted model traces to avoid roundoff
  spikes.
- Removed the visible normalized preset grid from the control rail while
  preserving internal presets, URL compatibility, and quick-start examples.
- Added `docs/public-data-discovery.md` and `docs/analytics-options.md`; no
  unverified public datasets or tracking scripts were added.
- Unit 6 remains deferred; no lossy-model code was added.
- Validation:
  - `npm run test` passed with 31 files and 127 tests.
  - `npm run build` passed with the expected large Plotly chunk warning.
  - `npm run lint` passed.
  - `npm run analyze:assets` passed; largest chunks were Plotly
    `4535.12 kB` raw / `1345.08 kB` gzip and Three `904.27 kB` raw /
    `240.25 kB` gzip.
  - `npm run smoke:visual` passed on desktop and mobile after starting the Vite
    dev server. A first smoke attempt failed before the server was running.
- Known warning: local Vite/browser logging still reports the existing
  `THREE.Clock` deprecation warning from the 3D dependency stack.
