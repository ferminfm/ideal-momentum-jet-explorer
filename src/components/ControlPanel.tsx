import {
  GAS_PRESETS,
  LIQUID_PRESETS,
  getGasPresetById,
  getLiquidPresetById,
} from '../data/fluidPresets'
import type { UiText } from '../i18n/translations'
import type { JetParameters } from '../model/jetModel'
import { getAspectRatio, getEquivalentDiameter, getInitialArea } from '../model/jetModel'
import { cloneParams } from '../model/presets'
import type {
  DimensionalSettings,
  InputMode,
} from '../types/appState'
import { formatNumber, formatScientific } from '../utils/format'
import { MathText } from './MathText'

interface ControlPanelProps {
  params: JetParameters
  inputMode: InputMode
  dimensionalSettings: DimensionalSettings
  text: UiText
  onInputModeChange: (inputMode: InputMode) => void
  onDimensionalSettingsChange: (settings: DimensionalSettings) => void
  onChange: (params: JetParameters, presetId?: string) => void
}

function updateGeometry(
  params: JetParameters,
  geometry: 'rectangular' | 'elliptical',
): JetParameters {
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

function clampMm(value: number): number {
  return Math.min(10, Math.max(0.05, value))
}

function fluidSummary(
  fluid: ReturnType<typeof getLiquidPresetById>,
  text: UiText,
): string {
  const parts = [
    `${text.controls.density}=${formatScientific(fluid.density)} kg/m^3`,
    `${text.controls.dynamicViscosity}=${formatScientific(fluid.dynamicViscosity)} Pa s`,
  ]

  if (fluid.surfaceTension !== undefined) {
    parts.push(`${text.controls.surfaceTension}=${formatScientific(fluid.surfaceTension)} N/m`)
  }

  if (fluid.soundSpeed !== undefined) {
    parts.push(`${text.controls.soundSpeed}=${formatNumber(fluid.soundSpeed, 0)} m/s`)
  }

  return `${text.controls.fluidProperties}: ${parts.join(' · ')}`
}

export function ControlPanel({
  params,
  inputMode,
  dimensionalSettings,
  text,
  onInputModeChange,
  onDimensionalSettingsChange,
  onChange,
}: ControlPanelProps) {
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
  const selectedLiquid = getLiquidPresetById(dimensionalSettings.liquidId)
  const selectedGas = getGasPresetById(dimensionalSettings.gasId)

  const setParams = (next: JetParameters, presetId?: string) =>
    onChange(cloneParams(next), presetId)
  const setDimensionalSettings = (partial: Partial<DimensionalSettings>) =>
    onDimensionalSettingsChange({ ...dimensionalSettings, ...partial })

  return (
    <section className="panel control-panel" aria-labelledby="controls-title">
      <div className="section-heading">
        <p className="eyebrow">{text.controls.eyebrow}</p>
        <h2 id="controls-title">{text.controls.title}</h2>
      </div>

      <div className="control-block">
        <label className="control-label">{text.controls.inputMode}</label>
        <div className="segmented-control" role="group" aria-label={text.controls.inputMode}>
          <button
            type="button"
            className={inputMode === 'normalized' ? 'active' : ''}
            onClick={() => onInputModeChange('normalized')}
          >
            {text.controls.normalizedMode}
          </button>
          <button
            type="button"
            className={inputMode === 'dimensional' ? 'active' : ''}
            onClick={() => onInputModeChange('dimensional')}
          >
            {text.controls.dimensionalMode}
          </button>
        </div>
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

      {inputMode === 'normalized' ? (
        <NormalizedControls
          densityLog={densityLog}
          ellipticalMajorAxis={ellipticalMajorAxis}
          ellipticalMinorAxis={ellipticalMinorAxis}
          params={params}
          rectangularHeight={rectangularHeight}
          rectangularWidth={rectangularWidth}
          text={text}
          setParams={setParams}
        />
      ) : (
        <>
          <div className="control-block">
            <label className="control-label">{text.controls.fluids}</label>
            <div className="control-grid">
              <label className="field">
                <span>{text.controls.liquidPreset}</span>
                <select
                  value={dimensionalSettings.liquidId}
                  onChange={(event) =>
                    setDimensionalSettings({ liquidId: event.target.value })
                  }
                >
                  {LIQUID_PRESETS.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.label}
                    </option>
                  ))}
                </select>
                <small>{fluidSummary(selectedLiquid, text)}</small>
              </label>
              <label className="field">
                <span>{text.controls.gasPreset}</span>
                <select
                  value={dimensionalSettings.gasId}
                  onChange={(event) => setDimensionalSettings({ gasId: event.target.value })}
                >
                  {GAS_PRESETS.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.label}
                    </option>
                  ))}
                </select>
                <small>{fluidSummary(selectedGas, text)}</small>
              </label>
            </div>
            <p className="control-helper">{text.controls.representativePropertiesWarning}</p>
          </div>

          <div className="control-block">
            <label className="control-label">{text.controls.physicalDimensions}</label>
            <p className="control-helper">{text.controls.physicalDimensionsHelp}</p>
            <div className="control-grid">
              {params.geometry.geometry === 'rectangular' ? (
                <>
                  <DimensionalSlider
                    label={text.controls.widthMm}
                    value={dimensionalSettings.rectangularWidthMm}
                    min={0.05}
                    max={10}
                    step={0.01}
                    suffix="mm"
                    onChange={(rectangularWidthMm) =>
                      setDimensionalSettings({
                        rectangularWidthMm: clampMm(rectangularWidthMm),
                      })
                    }
                  />
                  <DimensionalSlider
                    label={text.controls.heightMm}
                    value={dimensionalSettings.rectangularHeightMm}
                    min={0.05}
                    max={10}
                    step={0.01}
                    suffix="mm"
                    onChange={(rectangularHeightMm) =>
                      setDimensionalSettings({
                        rectangularHeightMm: clampMm(rectangularHeightMm),
                      })
                    }
                  />
                </>
              ) : (
                <>
                  <DimensionalSlider
                    label={text.controls.majorAxisMm}
                    value={dimensionalSettings.ellipticalMajorAxisMm}
                    min={0.05}
                    max={10}
                    step={0.01}
                    suffix="mm"
                    onChange={(ellipticalMajorAxisMm) =>
                      setDimensionalSettings({
                        ellipticalMajorAxisMm: clampMm(ellipticalMajorAxisMm),
                      })
                    }
                  />
                  <DimensionalSlider
                    label={text.controls.minorAxisMm}
                    value={dimensionalSettings.ellipticalMinorAxisMm}
                    min={0.05}
                    max={10}
                    step={0.01}
                    suffix="mm"
                    onChange={(ellipticalMinorAxisMm) =>
                      setDimensionalSettings({
                        ellipticalMinorAxisMm: clampMm(ellipticalMinorAxisMm),
                      })
                    }
                  />
                </>
              )}
            </div>
          </div>

          <div className="control-block">
            <label className="control-label">{text.controls.operatingPoint}</label>
            <div
              className="segmented-control"
              role="group"
              aria-label={text.controls.velocityMode}
            >
              <button
                type="button"
                className={dimensionalSettings.velocityMode === 'velocity' ? 'active' : ''}
                onClick={() => setDimensionalSettings({ velocityMode: 'velocity' })}
              >
                {text.controls.velocityInput}
              </button>
              <button
                type="button"
                className={
                  dimensionalSettings.velocityMode === 'pressureDrop' ? 'active' : ''
                }
                onClick={() =>
                  setDimensionalSettings({
                    velocityMode: 'pressureDrop',
                  })
                }
              >
                {text.controls.pressureDropInput}
              </button>
            </div>
            <div className="control-grid">
              {dimensionalSettings.velocityMode === 'velocity' ? (
                <DimensionalSlider
                  label={text.controls.injectionVelocity}
                  value={dimensionalSettings.injectionVelocity}
                  min={0.1}
                  max={300}
                  step={0.1}
                  suffix="m/s"
                  onChange={(injectionVelocity) =>
                    setDimensionalSettings({ injectionVelocity })
                  }
                />
              ) : (
                <DimensionalSlider
                  label={text.controls.pressureDrop}
                  value={dimensionalSettings.pressureDropKPa}
                  min={1}
                  max={30000}
                  step={1}
                  suffix="kPa"
                  onChange={(pressureDropKPa) =>
                    setDimensionalSettings({ pressureDropKPa })
                  }
                />
              )}
              <DimensionalSlider
                label={text.controls.dischargeCoefficient}
                value={dimensionalSettings.dischargeCoefficient}
                min={0.1}
                max={1.2}
                step={0.01}
                suffix=""
                onChange={(dischargeCoefficient) =>
                  setDimensionalSettings({ dischargeCoefficient })
                }
              />
            </div>
          </div>
        </>
      )}

      <SharedSamplingControls params={params} text={text} setParams={setParams} />

      {inputMode === 'normalized' ? (
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
      ) : null}
    </section>
  )
}

interface NormalizedControlsProps {
  params: JetParameters
  densityLog: number
  rectangularWidth: number
  rectangularHeight: number
  ellipticalMajorAxis: number
  ellipticalMinorAxis: number
  text: UiText
  setParams: (params: JetParameters, presetId?: string) => void
}

function NormalizedControls({
  params,
  densityLog,
  rectangularWidth,
  rectangularHeight,
  ellipticalMajorAxis,
  ellipticalMinorAxis,
  text,
  setParams,
}: NormalizedControlsProps) {
  return (
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
    </div>
  )
}

interface SharedSamplingControlsProps {
  params: JetParameters
  text: UiText
  setParams: (params: JetParameters, presetId?: string) => void
}

function SharedSamplingControls({ params, text, setParams }: SharedSamplingControlsProps) {
  return (
    <div className="control-grid sampling-grid">
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
  )
}

interface DimensionalSliderProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  suffix: string
  onChange: (value: number) => void
}

function DimensionalSlider({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: DimensionalSliderProps) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <output>
        {formatNumber(value, step < 0.1 ? 2 : 1)}
        {suffix ? ` ${suffix}` : ''}
      </output>
    </label>
  )
}
