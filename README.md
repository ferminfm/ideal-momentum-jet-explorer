# Ideal Momentum Jet Explorer

Interactive reduced-order model for circular, rectangular, and elliptical atomizing jets.

Live app: https://ferminfm.github.io/ideal-momentum-jet-explorer/  
Source: https://github.com/ferminfm/ideal-momentum-jet-explorer

Author: Fermín Franco-Medrano — Ensenada Campus, Autonomous University of Baja California / Institute of Mathematics for Industry, Kyushu University

## What This Is

Ideal Momentum Jet Explorer is a browser-based scientific computing app for exploring a conservative locally homogeneous two-phase jet closure. It evaluates how prescribed nozzle geometry and area growth affect bulk velocity, composite density, dynamic pressure, and entrainment.

The app is intended as an educational and exploratory research tool for fluid mechanics, atomization, and reduced-order modeling. It is fully static: all calculations run client-side in TypeScript, and GitHub Pages serves the built files without a backend.

## Scientific Model

The model uses a top-hat control volume and a prescribed area-growth history. The user selects a rectangular or elliptical nozzle exit, density ratio, initial dimensions, directional spreading half-angles, and normalized downstream range.

Density ratio:

```text
rho* = rho_g / rho_l
```

Equivalent diameter:

```text
De = sqrt(4 A0 / pi),   zeta = z / De
```

Rectangular exit:

```text
B(z) = B0 + 2 z tan(phi)
H(z) = H0 + 2 z tan(theta)
Ahat = Bhat Hhat
dAhat/dzeta = beta Hhat + eta Bhat
```

Elliptical exit, using full axes:

```text
a(z) = a0 + 2 z tan(theta)
b(z) = b0 + 2 z tan(phi)
Ahat = ahat bhat
dAhat/dzeta = alpha bhat + gamma ahat
```

State equations:

```text
Delta = sqrt((rho* - 1)^2 + 4 rho* Ahat)
vhat = (rho* - 1 + Delta) / (2 rho* Ahat)
rhohat = rho* + (1 - rho*) / (Ahat vhat)
phat = 1 / Ahat
mhat_g = rho* (Ahat vhat - 1)
K_A = sqrt(rho*) / Delta * dAhat/dzeta
```

For `rho* < 1e-8`, the implementation uses the limiting behavior `vhat ~= 1`, `rhohat ~= 1/Ahat`, and `phat ~= 1/Ahat` to avoid subtractive numerical loss.

## What The App Computes

- Normalized area growth, `Ahat(zeta)`.
- Bulk velocity, `vhat(zeta)`.
- Composite density, `rhohat(zeta)`.
- Dynamic pressure, `phat(zeta)`.
- Normalized gas entrainment rate, `mhat_g(zeta)`.
- Generalized entrainment coefficient, `K_A(zeta)`.
- Rectangular or elliptical expanding control-volume geometry in 3D.
- Axis-switching location when the two cross-stream dimensions become equal within the sampled range.

## Interactive Features

- English, Japanese, and Spanish interface controls for public teaching and research use.
- Saved parameter URLs: the current geometry, density ratio, dimensions, half-angles, plot options, overlay selection, and 3D cross-section controls are encoded in the query string.
- CSV export: sampled model states can be downloaded for reproducible figures and follow-up analysis.
- Velocity overlays: the app includes overlay infrastructure and one disabled-by-default synthetic example curve. No measured/literature numeric dataset is bundled yet, so overlays must not be interpreted as validation unless a documented public dataset is added later.
- Citation panel: copy references in plain text, BibTeX, LaTeX snippet, or Word/APA-style format.
- 3D cross-section tools: inspect a selected downstream cross-section and highlight the computed axis-switching section when it exists.

## What It Does Not Compute

The app does not predict axis switching, vortex dynamics, droplet-size distribution, breakup, losses, turbulence structure, or spreading half-angles. Those half-angles are prescribed inputs.

Velocity predictions can be compared with equal-density jet data. Composite-density validation requires independent phase-fraction or concentration measurements. This app is not validated engineering design software.

## Running Locally

```bash
npm install
npm run dev -- --host 127.0.0.1
```

Default local app path:

```text
http://127.0.0.1:5173/ideal-momentum-jet-explorer/
```

## Tests And Build

```bash
npm run test
npm run build
npm run lint
```

Visual smoke test while the dev server is running:

```bash
npm run smoke:visual
```

The smoke test uses `playwright-core` with system Chrome and writes desktop/mobile screenshots to `/tmp/ideal-momentum-jet-*.png`.

## Deployment

GitHub Pages deployment is configured through GitHub Actions in `.github/workflows/deploy.yml`. The Vite base path is:

```text
/ideal-momentum-jet-explorer/
```

Production preview after building:

```bash
npm run preview -- --host 127.0.0.1
```

GitHub Pages sites are public. Keep private PDFs, unpublished manuscripts, credentials, tokens, sensitive notes, and non-public datasets out of `public/` and committed assets.

## Citation / Model Lineage

- Franco, Fukumoto, Velte & Hodžić, JPSJ 2017: circular ideal momentum jet model.
- Noncircular extension: rectangular and elliptical area-growth formulation.
- Kumamoto JSFM 2026: short conference version.

## Roadmap

- Add documented public velocity-overlay datasets when permissible numerical data are available.
- Add profile-resolved or phase-fraction validation datasets when public data are available.
- Add optional bundle splitting for Plotly and Three.js to reduce initial JavaScript payload.
- Add a concise derivation note for the density and entrainment branches.
