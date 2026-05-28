# Project Report

## Local Path

`/home/franco/Documents/GitHub/ideal-momentum-jet-explorer`

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

## Current Deployment Status

- Branch: `main`
- Remote: `origin` -> `https://github.com/ferminfm/ideal-momentum-jet-explorer.git`
- GitHub Pages workflow: `.github/workflows/deploy.yml`
- Vite project base: `/ideal-momentum-jet-explorer/`
- Latest deployed feature commit: `fdacbc3f7bbef1c3a19ed22cdd08e2ca6787bf3f`
- Latest verified deployment run: GitHub Actions run `26602572873`, completed successfully.
- Live Pages check: `curl -I https://ferminfm.github.io/ideal-momentum-jet-explorer/` returned HTTP 200.

## Validation Status

- `npm run test`: passed, 9 test files and 37 tests after adding comparison-case, plot-trace, URL, CSV, language-state, math formatter, entrainment-coefficient reference, traveling-element helper, equation-panel, and symbols-glossary coverage.
- `npm run build`: passed with no TypeScript errors. Vite reported the expected large-bundle warning because Plotly and Three.js are bundled client-side.
- `npm run lint`: passed.
- `npm run smoke:visual`: passed on desktop and mobile; Plotly line output and Three.js canvas pixel checks both rendered.
- Live `npm run smoke:visual` with `SMOKE_URL=https://ferminfm.github.io/ideal-momentum-jet-explorer/`: passed on desktop and mobile.
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
- Saved share URLs, CSV export, citation copying, velocity-overlay infrastructure, and 3D cross-section inspection.
- Compact URL restoration for saved model comparisons.
- English, Japanese, and Spanish interface modes with language state encoded in reproducible URLs.

## Known Limitations

- Spreading half-angles are prescribed inputs; the model does not predict them.
- Axis switching, vortex dynamics, breakup, turbulence, losses, and droplet-size distributions are outside the reduced-order model.
- The traveling fluid-element markers are conceptual conserved-liquid markers and do not model droplet-size evolution or interactions.
- Composite density needs independent phase-fraction or concentration validation.
- No measured/literature velocity overlay dataset is bundled yet; the current overlay option is synthetic and only demonstrates the plotting mechanism.
- The initial JavaScript bundle is large because Plotly and Three.js are bundled client-side; code-splitting is a reasonable future optimization.
- GitHub Pages is public; private manuscripts, PDFs, credentials, and non-public datasets must stay out of committed assets.
