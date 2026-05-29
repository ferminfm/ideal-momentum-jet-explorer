# Changelog

## Unreleased / Industry Feature Integration

- Added the dimensional engineering core foundation with SI-unit scales,
  dimensional state conversion, fluid presets, and nondimensional groups.
- Added dimensional engineering mode with material presets, physical nozzle
  dimensions, velocity/pressure-drop operation, URL state, and dimensional CSV
  columns.
- Added a heuristic regime/applicability checker for reduced-order model use
  boundaries.
- Added data overlays and local browser-side CSV import for comparison curves.
- Added exploratory calibration/fitting of prescribed spreading half-angles to
  selected overlays.
- Added quasi-steady tip-penetration estimates from the steady bulk velocity
  field.
- Added CFD/configuration export for JSON, YAML-like text, Markdown summaries,
  and OpenFOAM-oriented notes that are not solver-ready cases.
- Added browser-side report generation with preview, Markdown/HTML downloads,
  and browser print/save-as-PDF.
- Improved performance and onboarding with lazy-loaded heavy panels, manual
  React/Plotly/Three chunks, asset reporting, quick-start examples, and public
  README polish.
- Fixed pre-merge calibration target synchronization so selected overlays
  default the fit target correctly and warn when the user intentionally fits a
  different target variable.
- Kept Unit 6 lossy model extensions deferred until the governing equations,
  assumptions, and validation strategy are formally documented.
