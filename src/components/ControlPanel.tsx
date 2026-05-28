import type { JetParameters } from '../model/jetModel'
import { getAspectRatio, getEquivalentDiameter, getInitialArea } from '../model/jetModel'
import { PRESETS, cloneParams } from '../model/presets'
import { formatNumber, formatScientific } from '../utils/format'

interface ControlPanelProps {
  params: JetParameters
  onChange: (params: JetParameters) => void
}

function updateGeometry(params: JetParameters, geometry: 'rectangular' | 'elliptical'): JetParameters {
  if (params.geometry.geometry === geometry) {
    return params
  }

  if (geometry === 'rectangular') {
    const majorAxis =
      params.geometry.geometry === 'elliptical' ? params.geometry.majorAxis : 1
    const minorAxis =
      params.geometry.geometry === 'elliptical' ? params.geometry.minorAxis : 1

    return {
      ...params,
      geometry: {
        geometry: 'rectangular',
        width: majorAxis,
        height: minorAxis,
      },
    }
  }

  const width = params.geometry.geometry === 'rectangular' ? params.geometry.width : 1
  const height = params.geometry.geometry === 'rectangular' ? params.geometry.height : 1

  return {
    ...params,
    geometry: {
      geometry: 'elliptical',
      majorAxis: width,
      minorAxis: height,
    },
  }
}

function coercePositive(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback
}

export function ControlPanel({ params, onChange }: ControlPanelProps) {
  const densityLog = Math.log10(params.densityRatio)
  const initialArea = getInitialArea(params.geometry)
  const equivalentDiameter = getEquivalentDiameter(params.geometry)
  const aspectRatio = getAspectRatio(params.geometry)
  const rectangularWidth =
    params.geometry.geometry === 'rectangular' ? params.geometry.width : 1
  const rectangularHeight =
    params.geometry.geometry === 'rectangular' ? params.geometry.height : 1
  const ellipticalMajorAxis =
    params.geometry.geometry === 'elliptical' ? params.geometry.majorAxis : 1
  const ellipticalMinorAxis =
    params.geometry.geometry === 'elliptical' ? params.geometry.minorAxis : 1

  const setParams = (next: JetParameters) => onChange(cloneParams(next))

  return (
    <section className="panel control-panel" aria-labelledby="controls-title">
      <div className="section-heading">
        <p className="eyebrow">Model controls</p>
        <h2 id="controls-title">Nozzle and area-growth inputs</h2>
      </div>

      <div className="control-block">
        <label className="control-label">Nozzle geometry</label>
        <div className="segmented-control" role="group" aria-label="Nozzle geometry">
          <button
            type="button"
            className={params.geometry.geometry === 'rectangular' ? 'active' : ''}
            onClick={() => setParams(updateGeometry(params, 'rectangular'))}
          >
            Rectangular
          </button>
          <button
            type="button"
            className={params.geometry.geometry === 'elliptical' ? 'active' : ''}
            onClick={() => setParams(updateGeometry(params, 'elliptical'))}
          >
            Elliptical
          </button>
        </div>
      </div>

      <div className="control-grid">
        <label className="field">
          <span>
            Density ratio <span className="math">rho* = rho_g / rho_l</span>
          </span>
          <input
            type="range"
            min="-4"
            max="0"
            step="0.01"
            value={densityLog}
            onChange={(event) =>
              setParams({
                ...params,
                densityRatio: 10 ** Number(event.target.value),
              })
            }
          />
          <output>{formatScientific(params.densityRatio)}</output>
        </label>

        {params.geometry.geometry === 'rectangular' ? (
          <>
            <label className="field">
              <span>B0 width</span>
              <input
                type="number"
                min="0.05"
                step="0.05"
                value={rectangularWidth}
                onChange={(event) =>
                  setParams({
                    ...params,
                    geometry: {
                      geometry: 'rectangular',
                      width: coercePositive(Number(event.target.value), rectangularWidth),
                      height: rectangularHeight,
                    },
                  })
                }
              />
            </label>
            <label className="field">
              <span>H0 height</span>
              <input
                type="number"
                min="0.05"
                step="0.05"
                value={rectangularHeight}
                onChange={(event) =>
                  setParams({
                    ...params,
                    geometry: {
                      geometry: 'rectangular',
                      width: rectangularWidth,
                      height: coercePositive(Number(event.target.value), rectangularHeight),
                    },
                  })
                }
              />
            </label>
          </>
        ) : (
          <>
            <label className="field">
              <span>a0 full major axis</span>
              <input
                type="number"
                min="0.05"
                step="0.05"
                value={ellipticalMajorAxis}
                onChange={(event) =>
                  setParams({
                    ...params,
                    geometry: {
                      geometry: 'elliptical',
                      majorAxis: coercePositive(
                        Number(event.target.value),
                        ellipticalMajorAxis,
                      ),
                      minorAxis: ellipticalMinorAxis,
                    },
                  })
                }
              />
            </label>
            <label className="field">
              <span>b0 full minor axis</span>
              <input
                type="number"
                min="0.05"
                step="0.05"
                value={ellipticalMinorAxis}
                onChange={(event) =>
                  setParams({
                    ...params,
                    geometry: {
                      geometry: 'elliptical',
                      majorAxis: ellipticalMajorAxis,
                      minorAxis: coercePositive(
                        Number(event.target.value),
                        ellipticalMinorAxis,
                      ),
                    },
                  })
                }
              />
            </label>
          </>
        )}

        <label className="field">
          <span>theta half-angle</span>
          <input
            type="number"
            min="0"
            max="25"
            step="0.05"
            value={params.thetaDeg}
            onChange={(event) =>
              setParams({
                ...params,
                thetaDeg: Number(event.target.value),
              })
            }
          />
        </label>
        <label className="field">
          <span>phi half-angle</span>
          <input
            type="number"
            min="0"
            max="25"
            step="0.05"
            value={params.phiDeg}
            onChange={(event) =>
              setParams({
                ...params,
                phiDeg: Number(event.target.value),
              })
            }
          />
        </label>
        <label className="field">
          <span>zeta max = z / De</span>
          <input
            type="range"
            min="20"
            max="100"
            step="1"
            value={params.zetaMax}
            onChange={(event) =>
              setParams({
                ...params,
                zetaMax: Number(event.target.value),
              })
            }
          />
          <output>{formatNumber(params.zetaMax, 0)}</output>
        </label>
        <label className="field">
          <span>Sample points</span>
          <input
            type="range"
            min="50"
            max="200"
            step="1"
            value={params.samples}
            onChange={(event) =>
              setParams({
                ...params,
                samples: Number(event.target.value),
              })
            }
          />
          <output>{formatNumber(params.samples, 0)}</output>
        </label>
      </div>

      <div className="metrics-strip" aria-label="Derived geometry values">
        <div>
          <span>A0</span>
          <strong>{formatNumber(initialArea, 4)}</strong>
        </div>
        <div>
          <span>De</span>
          <strong>{formatNumber(equivalentDiameter, 4)}</strong>
        </div>
        <div>
          <span>AR</span>
          <strong>{formatNumber(aspectRatio, 3)}</strong>
        </div>
      </div>

      <div className="control-block">
        <label className="control-label">Presets</label>
        <div className="preset-grid">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              title={preset.description}
              onClick={() => setParams(preset.params)}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
