import { Canvas } from '@react-three/fiber'
import { Line, OrbitControls } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'
import {
  computeAxisSwitchingZeta,
  getJetState,
  type JetSeries,
  type JetState,
} from '../model/jetModel'
import { formatDegrees, formatNumber } from '../utils/format'

interface JetGeometry3DProps {
  series: JetSeries
  crossSectionZeta: number
  showSelectedCrossSection: boolean
  showAxisSwitchingSection: boolean
  onCrossSectionZetaChange: (zeta: number) => void
  onShowSelectedCrossSectionChange: (value: boolean) => void
  onShowAxisSwitchingSectionChange: (value: boolean) => void
}

function sampleStates(states: JetState[], count: number): JetState[] {
  const sections = Math.min(count, states.length)

  return Array.from({ length: sections }, (_, index) => {
    const sourceIndex = Math.round((index / (sections - 1)) * (states.length - 1))
    return states[sourceIndex]
  })
}

function getSceneScale(states: JetState[]): number {
  const terminal = states[states.length - 1]
  const maxSpan = states.reduce(
    (current, state) => Math.max(current, state.primarySpan, state.secondarySpan),
    1,
  )
  const maxExtent = Math.max(terminal.axialZ, maxSpan, 1)

  return 7 / maxExtent
}

function createRectangularGeometry(states: JetState[], scale: number) {
  const vertices: number[] = []
  const indices: number[] = []

  for (const state of states) {
    const halfWidth = (state.primarySpan * scale) / 2
    const halfHeight = (state.secondarySpan * scale) / 2
    const z = state.axialZ * scale

    vertices.push(
      -halfWidth,
      -halfHeight,
      z,
      halfWidth,
      -halfHeight,
      z,
      halfWidth,
      halfHeight,
      z,
      -halfWidth,
      halfHeight,
      z,
    )
  }

  for (let section = 0; section < states.length - 1; section += 1) {
    const base = section * 4
    const nextBase = (section + 1) * 4

    for (let corner = 0; corner < 4; corner += 1) {
      const nextCorner = (corner + 1) % 4
      const a = base + corner
      const b = base + nextCorner
      const c = nextBase + corner
      const d = nextBase + nextCorner

      indices.push(a, c, b, b, c, d)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()

  return geometry
}

function createEllipticalGeometry(states: JetState[], scale: number) {
  const ringSegments = 64
  const vertices: number[] = []
  const indices: number[] = []

  for (const state of states) {
    const halfMajor = (state.primarySpan * scale) / 2
    const halfMinor = (state.secondarySpan * scale) / 2
    const z = state.axialZ * scale

    for (let segment = 0; segment < ringSegments; segment += 1) {
      const angle = (segment / ringSegments) * Math.PI * 2
      vertices.push(Math.cos(angle) * halfMajor, Math.sin(angle) * halfMinor, z)
    }
  }

  for (let section = 0; section < states.length - 1; section += 1) {
    const base = section * ringSegments
    const nextBase = (section + 1) * ringSegments

    for (let segment = 0; segment < ringSegments; segment += 1) {
      const nextSegment = (segment + 1) % ringSegments
      const a = base + segment
      const b = base + nextSegment
      const c = nextBase + segment
      const d = nextBase + nextSegment

      indices.push(a, c, b, b, c, d)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()

  return geometry
}

function createDropletGeometry(series: JetSeries, scale: number) {
  const vertices: number[] = []
  let seed = 42
  const nextRandom = () => {
    seed = (1664525 * seed + 1013904223) % 4294967296
    return seed / 4294967296
  }

  for (let index = 0; index < 170; index += 1) {
    const streamPosition = nextRandom()
    const stateIndex = Math.round(streamPosition * (series.states.length - 1))
    const state = series.states[stateIndex]
    const z = state.axialZ * scale

    if (series.params.geometry.geometry === 'rectangular') {
      const x = (nextRandom() - 0.5) * state.primarySpan * scale
      const y = (nextRandom() - 0.5) * state.secondarySpan * scale
      vertices.push(x, y, z)
    } else {
      const radius = Math.sqrt(nextRandom())
      const angle = nextRandom() * Math.PI * 2
      const x = Math.cos(angle) * radius * (state.primarySpan * scale) / 2
      const y = Math.sin(angle) * radius * (state.secondarySpan * scale) / 2
      vertices.push(x, y, z)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))

  return geometry
}

function createCrossSectionPoints(state: JetState, scale: number, segments: number) {
  const z = state.axialZ * scale

  if (segments === 4) {
    const halfWidth = (state.primarySpan * scale) / 2
    const halfHeight = (state.secondarySpan * scale) / 2

    return [
      [-halfWidth, -halfHeight, z],
      [halfWidth, -halfHeight, z],
      [halfWidth, halfHeight, z],
      [-halfWidth, halfHeight, z],
      [-halfWidth, -halfHeight, z],
    ] as Array<[number, number, number]>
  }

  return Array.from({ length: segments + 1 }, (_, index) => {
    const angle = (index / segments) * Math.PI * 2
    return [
      Math.cos(angle) * (state.primarySpan * scale) / 2,
      Math.sin(angle) * (state.secondarySpan * scale) / 2,
      z,
    ] as [number, number, number]
  })
}

interface JetMeshProps {
  series: JetSeries
  crossSectionZeta: number
  showSelectedCrossSection: boolean
  showAxisSwitchingSection: boolean
  axisSwitchingZeta: number | null
}

function JetMesh({
  series,
  crossSectionZeta,
  showSelectedCrossSection,
  showAxisSwitchingSection,
  axisSwitchingZeta,
}: JetMeshProps) {
  const sampledStates = useMemo(() => sampleStates(series.states, 36), [series.states])
  const scale = useMemo(() => getSceneScale(series.states), [series.states])
  const surfaceGeometry = useMemo(() => {
    if (series.params.geometry.geometry === 'rectangular') {
      return createRectangularGeometry(sampledStates, scale)
    }

    return createEllipticalGeometry(sampledStates, scale)
  }, [sampledStates, scale, series.params.geometry.geometry])
  const dropletGeometry = useMemo(
    () => createDropletGeometry(series, scale),
    [series, scale],
  )
  const terminal = series.states[series.states.length - 1]
  const axisEnd = terminal.axialZ * scale + 0.6
  const inlet = series.states[0]
  const crossSectionSegments = series.params.geometry.geometry === 'rectangular' ? 4 : 96
  const selectedState = getJetState(series.params, crossSectionZeta)
  const selectedIsSwitching =
    axisSwitchingZeta !== null && Math.abs(axisSwitchingZeta - crossSectionZeta) < 0.05
  const selectedCrossSectionPoints = createCrossSectionPoints(
    selectedState,
    scale,
    crossSectionSegments,
  )
  const switchingState =
    axisSwitchingZeta === null ? null : getJetState(series.params, axisSwitchingZeta)
  const switchingCrossSectionPoints =
    switchingState === null
      ? null
      : createCrossSectionPoints(switchingState, scale, crossSectionSegments)

  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, -4, 5]} intensity={1.5} />
      <mesh geometry={surfaceGeometry}>
        <meshStandardMaterial
          color="#4e89ae"
          opacity={0.28}
          transparent
          side={THREE.DoubleSide}
          roughness={0.55}
          metalness={0.05}
        />
      </mesh>
      <lineSegments>
        <wireframeGeometry args={[surfaceGeometry]} />
        <lineBasicMaterial color="#355f7a" transparent opacity={0.26} />
      </lineSegments>
      <points geometry={dropletGeometry}>
        <pointsMaterial
          color={series.params.densityRatio < 0.01 ? '#b96332' : '#2a6f88'}
          size={0.035}
          sizeAttenuation
          transparent
          opacity={0.72}
        />
      </points>
      {series.params.geometry.geometry === 'rectangular' ? (
        <mesh
          position={[0, 0, -0.09]}
          scale={[inlet.primarySpan * scale, inlet.secondarySpan * scale, 0.18]}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#697783" roughness={0.7} />
        </mesh>
      ) : (
        <mesh
          position={[0, 0, -0.09]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[
            (inlet.primarySpan * scale) / 2,
            0.18,
            (inlet.secondarySpan * scale) / 2,
          ]}
        >
          <cylinderGeometry args={[1, 1, 1, 64]} />
          <meshStandardMaterial color="#697783" roughness={0.7} />
        </mesh>
      )}
      <Line
        points={[
          [0, 0, -0.35],
          [0, 0, axisEnd],
        ]}
        color="#1d2a35"
        lineWidth={1}
      />
      {showSelectedCrossSection ? (
        <Line
          points={selectedCrossSectionPoints}
          color={selectedIsSwitching ? '#b35a2a' : '#174b66'}
          lineWidth={3}
        />
      ) : null}
      {showAxisSwitchingSection && switchingCrossSectionPoints ? (
        <Line points={switchingCrossSectionPoints} color="#c25732" lineWidth={4} />
      ) : null}
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        enablePan
        enableZoom
        enableRotate
      />
    </>
  )
}

export function JetGeometry3D({
  series,
  crossSectionZeta,
  showSelectedCrossSection,
  showAxisSwitchingSection,
  onCrossSectionZetaChange,
  onShowSelectedCrossSectionChange,
  onShowAxisSwitchingSectionChange,
}: JetGeometry3DProps) {
  const axisSwitchingZeta = computeAxisSwitchingZeta(series.params)
  const selectedState = getJetState(series.params, crossSectionZeta)
  const canJumpToAxisSwitching = axisSwitchingZeta !== null

  return (
    <section className="panel geometry-panel" aria-labelledby="geometry-title">
      <div className="section-heading">
        <p className="eyebrow">3D geometry</p>
        <h2 id="geometry-title">Expanding control volume</h2>
      </div>
      <div className="geometry-controls">
        <label className="field">
          <span>Cross-section zeta</span>
          <input
            type="range"
            min="0"
            max={series.params.zetaMax}
            step="0.05"
            value={crossSectionZeta}
            onChange={(event) => onCrossSectionZetaChange(Number(event.target.value))}
          />
          <output>{formatNumber(crossSectionZeta, 2)}</output>
        </label>
        <label className="toggle-control">
          <input
            type="checkbox"
            checked={showSelectedCrossSection}
            onChange={(event) => onShowSelectedCrossSectionChange(event.target.checked)}
          />
          Show selected cross-section
        </label>
        <label className="toggle-control">
          <input
            type="checkbox"
            checked={showAxisSwitchingSection}
            onChange={(event) => onShowAxisSwitchingSectionChange(event.target.checked)}
          />
          Highlight axis-switching section
        </label>
        <button
          type="button"
          className="secondary-action"
          disabled={!canJumpToAxisSwitching}
          onClick={() => {
            if (axisSwitchingZeta !== null) {
              onCrossSectionZetaChange(axisSwitchingZeta)
            }
          }}
        >
          Jump to axis switching
        </button>
      </div>
      <div className="cross-section-readout">
        <div>
          <span>Selected dimensions</span>
          <strong>
            {formatNumber(selectedState.primarySpan, 3)} x{' '}
            {formatNumber(selectedState.secondarySpan, 3)}
          </strong>
        </div>
        <div>
          <span>Ahat at selected zeta</span>
          <strong>{formatNumber(selectedState.normalizedArea, 3)}</strong>
        </div>
        <div>
          <span>Axis switching</span>
          <strong>
            {axisSwitchingZeta === null
              ? 'none in range'
              : `zeta ${formatNumber(axisSwitchingZeta, 2)}`}
          </strong>
        </div>
      </div>
      <div className="viewer-shell">
        <Canvas
          camera={{ position: [4.5, -6, 4.2], fov: 42 }}
          dpr={[1, 2]}
          gl={{ antialias: true, preserveDrawingBuffer: true }}
        >
          <color attach="background" args={['#f8fbfd']} />
          <JetMesh
            series={series}
            crossSectionZeta={crossSectionZeta}
            showSelectedCrossSection={showSelectedCrossSection}
            showAxisSwitchingSection={showAxisSwitchingSection}
            axisSwitchingZeta={axisSwitchingZeta}
          />
        </Canvas>
        <div className="viewer-overlay" aria-hidden="true">
          <span>z-axis</span>
          <span>A(z) surface</span>
          <span>Drag to rotate · scroll to zoom · right-drag/shift-drag to pan</span>
          <span>
            theta {formatDegrees(series.params.thetaDeg)} / phi{' '}
            {formatDegrees(series.params.phiDeg)}
          </span>
          <span>
            {series.params.geometry.geometry}, De {formatNumber(series.equivalentDiameter, 3)}
          </span>
        </div>
      </div>
    </section>
  )
}
