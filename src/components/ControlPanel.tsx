import type { UiText } from '../i18n/translations'
import type { JetParameters } from '../model/jetModel'
import { getAspectRatio, getEquivalentDiameter, getInitialArea } from '../model/jetModel'
import { PRESETS, cloneParams } from '../model/presets'
import { formatNumber, formatScientific } from '../utils/format'
import { MathText } from './MathText'

interface ControlPanelProps {
  params: JetParameters
  selectedPresetId: string
  text: UiText
  onChange: (params: JetParameters, presetId?: string) => void
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

function clampDimension(value: number): number {
  return Math.min(4, Math.max(0.25, value))
}

export function ControlPanel({ params, selectedPresetId, text, onChange }: ControlPanelProps) {
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

  const setParams = (next: JetParameters, presetId?: string) =>
    onChange(cloneParams(next), presetId)

  return (
    <section className="panel control-panel" aria-labelledby="controls-title">
      <div className="section-heading">
        <p className="eyebrow">{text.controls.eyebrow}</p>
        <h2 id="controls-title">{text.controls.title}</h2>
      </div>

      <div className="control-block">
        <label className="control-label">{text.controls.geometry}</label>
        <div className="segmented-control" role="group" aria-label={text.controls.geometryAria}>
          <button
            type="button"
            className={params.geometry.geometry === 'rectangular' ? 'active' : ''}
            onClick={() => setParams(updateGeometry(params, 'rectangular'))}
          >
            {text.controls.rectangular}
          </button>
          <button
            type="button"
            className={params.geometry.geometry === 'elliptical' ? 'active' : ''}
            onClick={() => setParams(updateGeometry(params, 'elliptical'))}
          >
            {text.controls.elliptical}
          </button>
        </div>
      </div>

      <div className="control-grid">
        <label className="field" title={text.controls.definitions.densityRatio}>
          <span>
            <MathText text={text.controls.densityRatio} />{' '}
            <span className="math">
              <MathText text="rho* = rho_g / rho_l" />
            </span>
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
            <label className="field" title={text.controls.definitions.dimensions}>
              <span>
                <MathText text={text.controls.width} />
              </span>
              <input
                type="range"
                min="0.25"
                max="4"
                step="0.01"
                value={rectangularWidth}
                onChange={(event) =>
                  setParams({
                    ...params,
                    geometry: {
                      geometry: 'rectangular',
                      width: clampDimension(Number(event.target.value)),
                      height: rectangularHeight,
                    },
                  })
                }
              />
              <output>{formatNumber(rectangularWidth, 2)}</output>
            </label>
            <label className="field" title={text.controls.definitions.dimensions}>
              <span>
                <MathText text={text.controls.height} />
              </span>
              <input
                type="range"
                min="0.25"
                max="4"
                step="0.01"
                value={rectangularHeight}
                onChange={(event) =>
                  setParams({
                    ...params,
                    geometry: {
                      geometry: 'rectangular',
                      width: rectangularWidth,
                      height: clampDimension(Number(event.target.value)),
                    },
                  })
                }
              />
              <output>{formatNumber(rectangularHeight, 2)}</output>
            </label>
          </>
        ) : (
          <>
            <label className="field" title={text.controls.definitions.dimensions}>
              <span>
                <MathText text={text.controls.majorAxis} />
              </span>
              <input
                type="range"
                min="0.25"
                max="4"
                step="0.01"
                value={ellipticalMajorAxis}
                onChange={(event) =>
                  setParams({
                    ...params,
                    geometry: {
                      geometry: 'elliptical',
                      majorAxis: clampDimension(Number(event.target.value)),
                      minorAxis: ellipticalMinorAxis,
                    },
                  })
                }
              />
              <output>{formatNumber(ellipticalMajorAxis, 2)}</output>
            </label>
            <label className="field" title={text.controls.definitions.dimensions}>
              <span>
                <MathText text={text.controls.minorAxis} />
              </span>
              <input
                type="range"
                min="0.25"
                max="4"
                step="0.01"
                value={ellipticalMinorAxis}
                onChange={(event) =>
                  setParams({
                    ...params,
                    geometry: {
                      geometry: 'elliptical',
                      majorAxis: ellipticalMajorAxis,
                      minorAxis: clampDimension(Number(event.target.value)),
                    },
                  })
                }
              />
              <output>{formatNumber(ellipticalMinorAxis, 2)}</output>
            </label>
          </>
        )}

        <label className="field" title={text.controls.definitions.theta}>
          <span>
            <MathText text={text.controls.theta} />
          </span>
          <input
            type="range"
            min="0"
            max="20"
            step="0.05"
            value={params.thetaDeg}
            onChange={(event) =>
              setParams({
                ...params,
                thetaDeg: Number(event.target.value),
              })
            }
          />
          <output>{formatNumber(params.thetaDeg, 2)} deg</output>
        </label>
        <label className="field" title={text.controls.definitions.phi}>
          <span>
            <MathText text={text.controls.phi} />
          </span>
          <input
            type="range"
            min="0"
            max="20"
            step="0.05"
            value={params.phiDeg}
            onChange={(event) =>
              setParams({
                ...params,
                phiDeg: Number(event.target.value),
              })
            }
          />
          <output>{formatNumber(params.phiDeg, 2)} deg</output>
        </label>
        <label className="field" title={text.controls.definitions.zetaMax}>
          <span>
            <MathText text={text.controls.zetaMax} />
          </span>
          <input
            type="range"
            min="10"
            max="60"
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
        <label className="field" title={text.controls.definitions.samplePoints}>
          <span>{text.controls.samplePoints}</span>
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

      <div className="metrics-strip" aria-label={text.controls.derivedGeometryAria}>
        <div>
          <span>
            <MathText text="A0" />
          </span>
          <strong>{formatNumber(initialArea, 4)}</strong>
        </div>
        <div>
          <span>
            <MathText text="De" />
          </span>
          <strong>{formatNumber(equivalentDiameter, 4)}</strong>
        </div>
        <div>
          <span>
            <MathText text="AR" />
          </span>
          <strong>{formatNumber(aspectRatio, 3)}</strong>
        </div>
      </div>

      <div className="control-block">
        <label className="control-label">{text.controls.presets}</label>
        <div className="preset-grid">
          {PRESETS.map((preset) => {
            const presetCopy =
              text.controls.presetsCopy[
                preset.id as keyof typeof text.controls.presetsCopy
              ] ?? preset

            return (
              <button
                key={preset.id}
                type="button"
                className={selectedPresetId === preset.id ? 'active' : ''}
                title={presetCopy.description}
                onClick={() => setParams(preset.params, preset.id)}
              >
                {presetCopy.name}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
