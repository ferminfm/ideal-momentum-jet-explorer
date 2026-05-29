# Changelog

## Unreleased / Industry Feature Integration

- Post-v0.2.0 polish: app version is visible in the UI and shared metadata.
- Fixed CFD/config export and report-generator option layout so checkbox labels
  wrap without overlap on narrow panels.
- Renamed the user-facing state-stride label to "Export every Nth sampled
  state" and added helper text.
- Stabilized near-constant plotted model traces so the equal-density symmetric
  `K_A` branch does not display roundoff as visual spikes.
- Removed the duplicate normalized preset button grid from the controls rail;
  quick-start examples remain the single visible example mechanism.
- Added public-data discovery and analytics-option documentation without
  bundling unverified datasets or enabling tracking.
- Added built-in synthetic calibration overlay examples and downloadable
  synthetic CSV fixtures. These are generated from the app model and are not
  measured or validation data.
- Improved CSV overlay import guidance with normalized x/y mapping help,
  target-variable explanations, optional error-column notes, and variable
  auto-suggestion from common column names.
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
