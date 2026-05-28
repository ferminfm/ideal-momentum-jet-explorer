# Project Report

## Local Path

`/home/franco/Documents/GitHub/ideal-momentum-jet-explorer`

## Current Publish Target

- GitHub repository URL: `https://github.com/ferminfm/ideal-momentum-jet-explorer`
- Expected GitHub Pages URL: `https://ferminfm.github.io/ideal-momentum-jet-explorer/`
- Local dev command: `npm run dev -- --host 127.0.0.1`
- Test command: `npm run test`
- Build command: `npm run build`
- Production preview command: `npm run preview -- --host 127.0.0.1`

## Commands Run

- `npm create vite@latest . -- --template react-ts`
- `npm install three @react-three/fiber @react-three/drei plotly.js-dist-min react-plotly.js`
- `npm install -D vitest jsdom @testing-library/react @types/three`
- `npm install -D playwright-core`
- `npm run test`
- `npm run build`
- `npm run lint`
- `npm run dev -- --host 127.0.0.1 --port 5173 --strictPort`
- `curl -I http://127.0.0.1:5173/ideal-momentum-jet-explorer/`
- `npm run smoke:visual`
- `gh auth status`
- `gh repo view ferminfm/ideal-momentum-jet-explorer || true`
- `git remote -v`

## Test And Build Results

- `npm run test`: passed, 1 test file and 5 tests.
- `npm run build`: passed with no TypeScript errors. Vite reported a large chunk warning because Plotly and Three.js are bundled into the static app.
- `npm run lint`: passed.
- Dev server: running locally at `http://127.0.0.1:5173/ideal-momentum-jet-explorer/` during verification; HTTP check returned 200 OK.
- Visual smoke test: passed on desktop `1440x1000` and mobile `390x844`; screenshots written to `/tmp/ideal-momentum-jet-desktop.png` and `/tmp/ideal-momentum-jet-mobile.png`.

## Repository

- Local git repository: present on branch `main`.
- Latest local commit before this status update: `0fcb278 Initial ideal momentum jet explorer`.
- GitHub repository: not created automatically. `gh auth status` found account `ferminfm`, but the saved token is invalid.
- Origin remote: not configured.
- GitHub Pages URL: expected at `https://ferminfm.github.io/ideal-momentum-jet-explorer/` after public repo push and Pages activation.
- Deployment status: GitHub Actions workflow is configured; Pages still needs a public GitHub repository push and Pages source set to GitHub Actions.

Exact authentication blocker:

```text
github.com
  X Failed to log in to github.com account ferminfm (default)
  - Active account: true
  - The token in default is invalid.
  - To re-authenticate, run: gh auth login -h github.com
  - To forget about this account, run: gh auth logout -h github.com -u ferminfm
```

Manual next step:

```bash
gh auth login -h github.com
```

Then:

```bash
cd /home/franco/Documents/GitHub/ideal-momentum-jet-explorer
gh repo create ideal-momentum-jet-explorer --public --source=. --remote=origin --push
```

## Implemented Features

- Client-side TypeScript implementation of the rectangular and elliptical ideal momentum jet model.
- Presets for circular, square, aspect-ratio 2, Gutmark-like equal-density, liquid-in-air, and equal-density cases.
- Interactive controls for geometry, density ratio, initial dimensions, spreading half-angles, zeta range, and sample count.
- Plotly plots for normalized area, velocity, density, dynamic pressure, gas entrainment, and `K_A`.
- Three.js control-volume viewer with translucent rectangular or elliptical frustum geometry.
- Public-facing documentation and GitHub Pages workflow.

## Known Limitations

- Spreading half-angles are prescribed inputs; the model does not predict them.
- Axis switching, vortex dynamics, breakup, turbulence, and detailed multiphase structure are outside the reduced-order model.
- Composite density needs independent phase-fraction or concentration validation.
- Initial bundle size is large because Plotly and Three.js are bundled client-side; code-splitting is a reasonable future optimization.
- GitHub Pages becomes public once deployed; no private manuscripts, PDFs, or sensitive notes are included in this app.

## Next Steps

- Create the public GitHub repository manually or refresh GitHub CLI authentication, then push `main`.
- Enable GitHub Pages with source set to GitHub Actions after the repository is pushed.
