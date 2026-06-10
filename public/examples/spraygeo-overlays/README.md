# SprayGeo Sample Synthetic Overlay Example

These files are small CSV/JSON examples exported from the SprayGeo geometry
workflow for testing the Ideal Momentum Jet Explorer import path.

They are not measured data, not DualSPHysics-generated data, not statistically
stationary, and not physical validation data. The current sample comes from a
synthetic SprayGeo ellipse-family geometry table.

Use in the app:

1. Open the Data Overlay panel.
2. Import `ideal_overlay_area.csv`.
3. Select `zeta` as the x column.
4. Select `Ahat` as the y column.
5. Optionally select `Ahat_error` as the y-error column.
6. Set the variable to `area`.
7. Use the existing calibration panel if fitting prescribed spreading
   half-angles is useful.

Do not add a second fitting workflow for this file. The app already owns the
reduced-model visualization, local overlay import, and calibration surfaces.

## Metadata Gate

The companion metadata should be treated as part of the import. The checked-in
sample is `fit_readiness=bridge_smoke_only`; it is useful for UI import testing
but not for quantitative physical comparison.
