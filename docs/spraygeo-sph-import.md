# SprayGeo And SPH Geometry Import

This note defines the current bridge from SprayGeo into the Ideal Momentum Jet
Explorer. It is intentionally an import/data-contract workflow, not a new model
or duplicated fitting surface.

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

The current sample is synthetic SprayGeo geometry data. It validates the bridge
format only; it is not measured data, not a stationary DualSPHysics jet, and not
atomization validation.

## Future SPH Handoff

For a future DualSPHysics-generated jet/spray-geometry proxy, SprayGeo should
first aggregate particle slices into a metric table:

```text
z, time/frame, particle_count, area, major_extent, minor_extent,
aspect_ratio, orientation_unwrapped_rad, quality_flags
```

After transient rejection and time averaging, SprayGeo should export:

```text
zeta, Ahat, Ahat_error
```

The Ideal Momentum Jet Explorer can then import the file through the existing
Data Overlay panel and use the existing calibration panel to fit prescribed
area-growth/spreading parameters.

## Caveat

This app remains an exploratory reduced-order model. Importing an SPH-generated
or synthetic overlay does not create production CFD validation, experimental
agreement, or a fully atomized spray simulation.
