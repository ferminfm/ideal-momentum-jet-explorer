# Performance Report

## Unit 10 Baseline

- Branch: `feature/performance-showcase-polish`.
- Starting commit: `4e2a4cb`.
- Baseline command: `npm run build`.
- Baseline build status: passed.
- Baseline warning: Vite reported a chunk larger than 500 kB.
- Baseline largest assets:
  - `index-a8LSBked.js`: 6,243.45 kB raw, 1,835.35 kB gzip.
  - `index-Bbnmr7R4.css`: 53.76 kB raw, 13.03 kB gzip.
- Baseline chunking: Plotly, Three.js, React, and app code were bundled into a
  single large JavaScript entry asset.

## Unit 10 Changes

- Added `scripts/report-build-assets.mjs` and `npm run analyze:assets` for
  dependency-free build-asset reporting.
- Added React lazy loading and Suspense fallbacks for heavy panels:
  - Plotly plots.
  - Three.js 3D viewer.
  - data overlays.
  - calibration.
  - tip penetration.
  - CFD/config export.
  - report generator.
- Added optional unmounting for collapsed sections so closed heavy tools do not
  mount until opened.
- Added Vite manual chunking for React, Plotly, and Three.js dependencies.

## Post-Change Build Assets

Command: `npm run build` followed by `npm run analyze:assets`.

Largest JS/CSS assets after splitting:

| file | raw | gzip |
| --- | ---: | ---: |
| `plotly-Vai4rULb.js` | 4535.12 kB | 1345.08 kB |
| `three--2S9EBtf.js` | 904.27 kB | 240.25 kB |
| `index-BTU4-YzZ.js` | 406.95 kB | 118.17 kB |
| `vendor-react-DCi_myYG.js` | 182.03 kB | 56.50 kB |
| `index-CEvB0FMb.css` | 53.27 kB | 12.89 kB |
| `ReportPanel-Dh2gDx1s.js` | 19.31 kB | 5.63 kB |
| `JetGeometry3D-CyGX9el_.js` | 15.70 kB | 4.69 kB |
| `DataOverlayPanel-BYJY_5Ip.js` | 8.51 kB | 2.66 kB |
| `Plots-CPNxhZaH.js` | 7.68 kB | 2.93 kB |
| `CalibrationPanel-CuKazNHr.js` | 5.20 kB | 1.50 kB |
| `TipPenetrationPanel-BnMlezKu.js` | 4.83 kB | 1.89 kB |
| `CfdExportPanel-P9r4xqgP.js` | 3.83 kB | 1.29 kB |

## Notes

- The large Plotly and Three.js chunks are now isolated from the main app entry.
- The Vite large-chunk warning remains because Plotly and Three.js are still
  intrinsically large dependencies.
- Replacing `plotly.js-dist-min` with a smaller Plotly bundle remains a possible
  future optimization, but was not changed in this pass to avoid risking plot
  feature regressions.
