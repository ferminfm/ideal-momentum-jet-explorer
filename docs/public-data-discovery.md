# Public Data Discovery TODO

Goal: identify public and permissible experimental, literature, or CFD datasets
that can be used as documented comparison overlays for the Ideal Momentum Jet
Explorer.

No measured public numerical dataset is bundled with the app yet. The current
built-in overlay is a synthetic demo only and must not be interpreted as
validation data.

Do not add digitized literature points unless the numerical dataset is
public/permissible and citation, provenance, and license or permission
information are documented. If a figure is digitized, record the digitization
method and uncertainty.

## Candidate Sources To Investigate

- Gutmark et al. elliptic-jet data, if numerical tables or permissible data
  files are available.
- Miller et al. elliptic-jet data, if numeric tables exist.
- Cabrera-Ward et al. prior comparison data, if the authors can provide
  numerical data and permission for redistribution.
- Public X-ray spray datasets with documented geometry and operating
  conditions.
- Public PIV, PDPA, or PLIF datasets with normalized velocity, concentration,
  phase-fraction, or mixture-fraction fields.
- DNS or LES datasets with published tables or repository-hosted numeric data.

## Useful Variables

- Velocity profiles or centerline/bulk velocity.
- Area, width, height, major-axis, or minor-axis growth.
- Liquid volume fraction, mixture fraction, density, or concentration.
- Entrainment or mass-flux estimates.
- CFD reference curves with solver, mesh, and model metadata.

## Required Metadata For Future Bundled Datasets

- Source and citation.
- License, permission, or public-data terms.
- Variable definitions and normalization.
- Units.
- Geometry and nozzle dimensions.
- Fluid properties and operating conditions.
- Data acquisition or simulation method.
- Digitization method, if digitized from a figure.
- Uncertainty estimates, if available.
- Notes about which branch of the reduced model the data can meaningfully test.
