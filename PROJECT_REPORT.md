# Project Report

## Local Path

`/home/franco/Documents/GitHub/ideal-momentum-jet-explorer`

## Public URLs

- GitHub repository: `https://github.com/ferminfm/ideal-momentum-jet-explorer`
- GitHub Pages app: `https://ferminfm.github.io/ideal-momentum-jet-explorer/`

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
- Latest commit hash: see `git log --oneline -1` after the polish commit is created.

## Validation Status

- `npm run test`: passed, 1 test file and 5 tests.
- `npm run build`: passed with no TypeScript errors. Vite reported the expected large-bundle warning because Plotly and Three.js are bundled client-side.
- `npm run lint`: passed.
- `npm run smoke:visual`: passed on desktop and mobile; Plotly line output and Three.js canvas pixel checks both rendered.
- Public placeholder scan: no matches for `OWNER`, `portfolio project`, `showcase project`, or `placeholder` in the requested public/source/doc paths.

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
- Three.js control-volume viewer with translucent rectangular or elliptical frustum geometry.
- GitHub Pages deployment through GitHub Actions.

## Known Limitations

- Spreading half-angles are prescribed inputs; the model does not predict them.
- Axis switching, vortex dynamics, breakup, turbulence, losses, and droplet-size distributions are outside the reduced-order model.
- Composite density needs independent phase-fraction or concentration validation.
- The initial JavaScript bundle is large because Plotly and Three.js are bundled client-side; code-splitting is a reasonable future optimization.
- GitHub Pages is public; private manuscripts, PDFs, credentials, and non-public datasets must stay out of committed assets.
