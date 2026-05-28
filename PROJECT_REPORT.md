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
- Latest deployed feature commit: `6eab8af61fbd17bdb4b538f0f1e8601c7346abe2`
- Latest verified deployment run: GitHub Actions run `26599473219`, completed successfully.
- Live Pages check: `curl -I https://ferminfm.github.io/ideal-momentum-jet-explorer/` returned HTTP 200.

## Validation Status

- `npm run test`: passed, 6 test files and 24 tests after adding comparison-case, plot-trace, URL, CSV, language-state, and math formatter coverage.
- `npm run build`: passed with no TypeScript errors. Vite reported the expected large-bundle warning because Plotly and Three.js are bundled client-side.
- `npm run lint`: passed.
- `npm run smoke:visual`: passed on desktop and mobile; Plotly line output and Three.js canvas pixel checks both rendered.
- Live interaction smoke: passed for add saved case, change geometry, hide/show saved case, settings tooltip, and remove saved case.
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
- GitHub Pages deployment through GitHub Actions.
- Saved share URLs, CSV export, citation copying, velocity-overlay infrastructure, and 3D cross-section inspection.
- Compact URL restoration for saved model comparisons.
- English, Japanese, and Spanish interface modes with language state encoded in reproducible URLs.

## Known Limitations

- Spreading half-angles are prescribed inputs; the model does not predict them.
- Axis switching, vortex dynamics, breakup, turbulence, losses, and droplet-size distributions are outside the reduced-order model.
- Composite density needs independent phase-fraction or concentration validation.
- No measured/literature velocity overlay dataset is bundled yet; the current overlay option is synthetic and only demonstrates the plotting mechanism.
- The initial JavaScript bundle is large because Plotly and Three.js are bundled client-side; code-splitting is a reasonable future optimization.
- GitHub Pages is public; private manuscripts, PDFs, credentials, and non-public datasets must stay out of committed assets.
