# Ideal Momentum Jet Explorer

Interactive reduced-order model for circular, rectangular, and elliptical atomizing jets.

This browser app explores the ideal momentum atomizing-jet model used in the Kumamoto JSFM noncircular-jet work. It is a static React/TypeScript application: all calculations run client-side, and the public site requires no Python backend, database, or server-side execution.

## What The App Does

- Evaluates rectangular and elliptical nozzle exits, including square and circular limits.
- Computes normalized area growth, bulk velocity, composite density, dynamic pressure, gas entrainment, and generalized entrainment coefficient.
- Provides presets for circular, square, aspect-ratio 2, equal-density, Gutmark-like, and liquid-in-air cases.
- Displays interactive Plotly graphs with hover readouts and export support through the Plotly modebar.
- Renders a Three.js control-volume visualization with rectangular frustum or elliptical frustum geometry.

## Model Scope

The app visualizes a conservative, lossless top-hat branch. A prescribed area-growth history defines the control volume, and ideal momentum conservation gives the bulk state variables.

It does not predict axis switching, vortex dynamics, breakup physics, turbulence structure, or the spreading half-angles. Those half-angles are inputs. Composite-density predictions require independent phase-fraction or concentration validation. Equal-density comparisons validate only the velocity branch.

This app is for educational and research visualization of a reduced-order model, not validated engineering design software.

## Core Equations

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

## Local Development

```bash
npm install
npm run dev
```

Quality checks:

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

GitHub Pages deployment is configured through GitHub Actions in `.github/workflows/deploy.yml`. The Vite base path is set to:

```text
/ideal-momentum-jet-explorer/
```

After pushing the repository, enable Pages with:

```text
GitHub -> Settings -> Pages -> Source: GitHub Actions
```

GitHub Pages sites are public. Do not add private PDFs, unpublished manuscripts, credentials, tokens, or sensitive research notes to `public/` or committed app assets.

## Citations

- Model citation placeholder: Franco, Fukumoto, Velte & Hodžić, JPSJ 2017.
- Kumamoto JSFM 2026: public visualization companion for the noncircular ideal momentum jet model.

## Screenshots

Screenshot placeholders:

- Main dashboard with controls and Plotly graph.
- Three.js rectangular control volume.
- Three.js elliptical control volume.

## Roadmap

- Add saved parameter URLs for reproducible figures.
- Add CSV export for sampled state variables.
- Add a small derivation note for the density and entrainment branches.
- Add comparison overlays for measured or literature velocity curves when public data are available.
