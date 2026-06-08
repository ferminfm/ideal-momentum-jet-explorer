# SprayGeo And SPH Geometry Import

This note defines the current bridge from SprayGeo into the Ideal Momentum Jet
Explorer. It is intentionally an import/data-contract workflow, not a new model
or duplicated fitting surface. The current checked-in file is a sample
synthetic geometry overlay.

The canonical producer-side contract is maintained in SprayGeo as
`docs/stationary_jet_geometry_contract.md`. This app consumes the reduced
overlay form of that contract; it does not own raw solver or stationary-window
metric extraction.

## Existing App Surface

The app already provides:

- local CSV data overlays,
- normalized `zeta = z / De` import,
- area/velocity/density/pressure/entrainment/coefficient overlay variables,
- browser-side calibration of prescribed spreading half-angles,
- saved comparison cases,
- dimensional inputs,
- regime/applicability warnings,
- 3D jet geometry and tip-penetration views.

Therefore, SprayGeo should export model-ready overlay files and let this app
handle fitting and visual analysis.

## Current Example

Example files:

```text
public/examples/spraygeo-overlays/ideal_overlay_area.csv
public/examples/spraygeo-overlays/ideal_overlay_metadata.json
```

Import settings:

```text
x column: zeta
y column: Ahat
y-error column: Ahat_error
variable: area
```

The current sample is synthetic SprayGeo geometry data. It exercises the bridge
format only; it is not measured data, not DualSPHysics-generated, not
statistically stationary, and not atomization validation or production CFD.

## Future SPH Handoff

For a future DualSPHysics-generated jet/spray-geometry proxy, SprayGeo should
first aggregate particle slices into a metric table:

```text
source_id, source_type, simulation_source, physical_validation, z, time, frame,
post_transient, stationarity_window_id, particle_count, area or area_proxy,
Ahat or Ahat_error, centroid_x, centroid_y, aspect_ratio,
orientation_unwrapped_rad, u_axial_mean, u_axial_std,
mass_or_particle_flux_proxy, quality_flags
```

After transient rejection and time averaging, SprayGeo should export:

```text
zeta, Ahat, Ahat_error
```

The Ideal Momentum Jet Explorer can then import the file through the existing
Data Overlay panel and use the existing calibration panel to fit prescribed
area-growth/spreading parameters. The app should not duplicate SprayGeo's
geometry extraction or stationarity filtering.

Recommended metadata fields for the companion JSON:

```text
source_type, stationarity, simulation_source, physical_validation,
model_fit_performed, intended_use, caveat
```

`model_fit_performed` should usually be `false` before import, because fitting
is performed in the Ideal Momentum Jet Explorer.

## Caveat

This app remains an exploratory reduced-order model. Importing an SPH-generated
or synthetic overlay does not create production CFD validation, experimental
agreement, or a fully atomized spray simulation.

## Stationary Overlay Gate

For future SprayGeo/DualSPHysics or SprayGeo/VOF imports, check the companion
metadata before quantitative comparison:

- `fit_readiness=bridge_smoke_only`: import-path exercise only.
- `fit_readiness=blocked_pending_stationary_window`: do not fit; stationarity is
  not documented.
- `fit_readiness=overlay_ready_for_exploratory_fit_only`: acceptable only as an
  exploratory reduced-model overlay, not validation.
- `fit_readiness=overlay_ready_with_validation_protocol`: reserved for future
  datasets with documented provenance, uncertainty, and validation protocol.

The app should consume `zeta,Ahat,Ahat_error` overlays and use its existing
calibration surface. It should not duplicate SprayGeo's contour extraction,
post-transient filtering, or stationary-window aggregation.
