export const LANGUAGE_OPTIONS = [
  { id: 'en', label: 'English', shortLabel: 'EN' },
  { id: 'ja', label: '日本語', shortLabel: '日本語' },
  { id: 'es', label: 'Español', shortLabel: 'ES' },
] as const

export type Language = (typeof LANGUAGE_OPTIONS)[number]['id']

export const DEFAULT_LANGUAGE: Language = 'en'

const ENGLISH_AFFILIATION =
  'Fermín Franco-Medrano — Ensenada Campus, Autonomous University of Baja California / Institute of Mathematics for Industry, Kyushu University'
const JAPANESE_AFFILIATION =
  'フランコ＝メドラノ・フェルミン｜バハ・カリフォルニア自治大学エンセナダキャンパス / 九州大学マス・フォア・インダストリ研究所'
const SPANISH_AFFILIATION =
  'Fermín Franco-Medrano — Campus Ensenada, Universidad Autónoma de Baja California / Instituto de Matemáticas para la Industria, Universidad de Kyushu'

const ENGLISH_TEXT = {
  layout: {
    languageLabel: 'Interface language',
    projectLinksLabel: 'Project links',
    eyebrow: 'Browser-based scientific computing app',
    title: 'Ideal Momentum Jet Explorer',
    subtitle:
      'Interactive reduced-order model for circular, rectangular, and elliptical atomizing jets',
    description:
      'Explore how prescribed nozzle geometry and area growth affect bulk velocity, composite density, dynamic pressure, and entrainment in a conservative locally homogeneous two-phase jet model.',
    author: ENGLISH_AFFILIATION,
    sourceCode: 'Source code',
    modelNotes: 'Model notes',
    researchmap: 'Researchmap profile',
    footerLineage:
      'Model lineage: Franco, Fukumoto, Velte & Hodžić, JPSJ 2017 circular ideal momentum jet model; rectangular and elliptical area-growth extension; Kumamoto JSFM 2026 short conference version.',
    sourceRepository: 'Source repository',
  },
  summary: {
    ariaLabel: 'Terminal state summary',
    areaAtZetaMax: 'Ahat at zeta max',
    velocity: 'vhat',
    density: 'rhohat',
    gasEntrainment: 'mhat_g',
    coefficient: 'K_A',
  },
  controls: {
    eyebrow: 'Model controls',
    title: 'Nozzle and area-growth inputs',
    geometry: 'Nozzle geometry',
    geometryAria: 'Nozzle geometry',
    rectangular: 'Rectangular',
    elliptical: 'Elliptical',
    densityRatio: 'Density ratio',
    width: 'B0 width',
    height: 'H0 height',
    majorAxis: 'a0 full major axis',
    minorAxis: 'b0 full minor axis',
    theta: 'theta half-angle',
    phi: 'phi half-angle',
    zetaMax: 'zeta max = z / De',
    samplePoints: 'Sample points',
    derivedGeometryAria: 'Derived geometry values',
    presets: 'Presets',
    presetsCopy: {
      'circular-limit': {
        name: 'Circular limit',
        description: 'Elliptical branch with equal full axes and isotropic spreading.',
      },
      'square-limit': {
        name: 'Square limit',
        description: 'Rectangular branch with equal sides and isotropic spreading.',
      },
      'rectangular-ar2': {
        name: 'Rectangular AR=2',
        description: 'Equal-area rectangular nozzle with slower spreading on the long side.',
      },
      'elliptical-ar2': {
        name: 'Elliptical AR=2',
        description: 'Full-axis elliptical nozzle with slower spreading on the major axis.',
      },
      'gutmark-like-elliptic': {
        name: 'Gutmark-like elliptic example',
        description: 'Equal-density elliptic branch for velocity-only comparison studies.',
      },
      'liquid-in-air': {
        name: 'Liquid-in-air atomizing example',
        description: 'Air-to-water density ratio with a rectangular anisotropic exit.',
      },
      'equal-density': {
        name: 'Equal-density single-phase branch',
        description: 'Single-phase limit with density ratio equal to unity.',
      },
    },
  },
  export: {
    eyebrow: 'Reproducibility',
    title: 'Share and export',
    copyUrl: 'Copy shareable URL',
    downloadCsv: 'Download CSV',
    helper:
      'URLs encode the model configuration, plot options, overlay choice, saved model cases, and cross-section controls. CSV exports include the current curve and visible saved cases.',
    copied: 'Shareable URL copied.',
  },
  comparison: {
    addEyebrow: 'Model comparisons',
    addTitle: 'Saved model cases',
    addButton: 'Add current case to comparison',
    addHelper:
      'Saved cases remain fixed while the sliders continue to control the live curve.',
    added: 'Current case added to comparison.',
    maxWarning: 'Maximum saved cases reached. Remove one to add another.',
    trayEyebrow: 'Model comparisons',
    trayTitle: 'Saved model cases',
    empty: 'No saved model cases yet. Add a case from the controls to compare it with the live curve.',
    showAll: 'Show all',
    hideAll: 'Hide all',
    clearAll: 'Clear all',
    currentLabel: 'Current',
    removeCase: 'Remove saved case',
    bulkActionsLabel: 'Comparison case controls',
  },
  equations: {
    eyebrow: 'Reduced-order model',
    title: 'Ideal momentum closure',
    momentum:
      'Axial momentum flux is conserved for the prescribed top-hat control volume.',
    density:
      'Composite density follows from the liquid fraction implied by bulk continuity.',
    pressure: 'Dynamic pressure decays directly with normalized area growth.',
    entrainment:
      'Gas entrainment is reported in nondimensional form relative to the inlet liquid flux.',
    coefficient: 'Generalized entrainment coefficient for arbitrary area-growth histories.',
    coefficientReferences:
      'On the K_A plot, dashed and dotted horizontal lines show K_A(0) and the far-field asymptote K_A(∞); for positive two-direction area growth, K_A(∞)=sqrt(lambda_1 lambda_2).',
  },
  plots: {
    eyebrow: 'Interactive plots',
    title: 'State variables along zeta',
    logDensity: 'Log density',
    plotVariableAria: 'Plot variable',
    velocityOverlay: 'Velocity overlay',
    none: 'None',
    defaultOverlayNote:
      'No public measured velocity dataset is bundled yet. Overlays are optional comparison aids and may test only reduced model branches.',
    xAxisTitle: 'Normalized distance, zeta = z / De',
    hoverZeta: 'zeta',
    hoverValue: 'value',
    referenceValues: {
      title: 'Coefficient reference values',
      nearFieldLimit: 'Near-field K_A(0)',
      farFieldLimit: 'Far-field K_A(∞)',
      directionalRates: 'Directional rates',
      help:
        'Dashed and dotted lines show the near-field value and far-field asymptote for the current settings.',
    },
    definitions: {
      area: { label: 'Ahat', yTitle: 'Normalized area, Ahat' },
      velocity: { label: 'vhat', yTitle: 'Bulk velocity, vhat' },
      density: { label: 'rhohat', yTitle: 'Composite density, rhohat' },
      pressure: { label: 'phat', yTitle: 'Dynamic pressure, phat' },
      entrainment: { label: 'mhat_g', yTitle: 'Gas entrainment rate, mhat_g' },
      coefficient: {
        label: 'K_A',
        yTitle: 'Generalized entrainment coefficient, K_A',
      },
    },
    overlays: {
      'synthetic-equal-density-reference': {
        label: 'Example synthetic velocity curve',
        source: 'Synthetic reference generated inside the app; not measured data.',
        notes:
          'Illustrates the overlay mechanism only. It is disabled by default and must not be interpreted as validation data.',
      },
    },
  },
  geometry: {
    eyebrow: '3D geometry',
    title: 'Expanding control volume',
    crossSection: 'Cross-section zeta',
    showSelected: 'Show selected cross-section',
    highlightSwitching: 'Highlight axis-switching section',
    jumpToSwitching: 'Jump to axis switching',
    selectedDimensions: 'Selected dimensions',
    areaAtSelected: 'Ahat at selected zeta',
    axisSwitching: 'Axis switching',
    noneInRange: 'none in range',
    zetaPrefix: 'zeta',
    zAxis: 'z-axis',
    surface: 'A(z) surface',
    controlsHint: 'Drag to rotate · scroll to zoom · right-drag/shift-drag to pan',
    playElement: 'Play fluid element',
    pauseElement: 'Pause fluid element',
    resetElement: 'Reset element',
    showElementDroplets: 'Show droplets in element',
    animationSpeed: 'Animation speed',
    elementZeta: 'Element zeta',
    animationHelp:
      'Conceptual LHF element: conserved liquid markers redistributed inside the expanding control volume.',
  },
  interpretation: {
    eyebrow: 'Model scope',
    title: 'Closure assumptions and validation boundary',
    stateClosureTitle: 'State closure',
    stateClosureBody:
      'This app implements a conservative, top-hat, locally homogeneous two-phase state closure. The inputs are density ratio and a prescribed rectangular or elliptical area-growth history. The traveling element in the 3D view is a conceptual LHF visualization, not droplet dynamics.',
    predictedTitle: 'Predicted',
    predictedBody:
      'Normalized area, bulk velocity, composite density, dynamic pressure, gas entrainment, and the generalized entrainment coefficient K_A(z).',
    prescribedTitle: 'Prescribed',
    prescribedBody:
      'Nozzle geometry, initial dimensions, directional spreading half-angles, and downstream sampling range are model inputs rather than inferred quantities.',
    notPredictedTitle: 'Not predicted',
    notPredictedBody:
      'Axis switching, vortex dynamics, droplet-size distribution, breakup, losses, and spreading angles. Velocity can be compared with equal-density jet data; composite density requires phase-fraction or concentration data.',
  },
  citations: {
    eyebrow: 'References',
    title: 'Cite this model and app',
    formatAria: 'Citation format',
    copy: 'Copy',
    copied: 'Copied',
    formats: {
      plain: 'Plain text',
      bibtex: 'BibTeX',
      latex: 'LaTeX',
      word: 'Word / APA',
    },
    entryTitles: {
      'franco-2017': 'Original circular ideal momentum jet model',
      'kumamoto-2026': 'Kumamoto JSFM noncircular extension',
      'web-app-2026': 'Ideal Momentum Jet Explorer web application',
    },
  },
}

export type UiText = typeof ENGLISH_TEXT

export const TRANSLATIONS: Record<Language, UiText> = {
  en: ENGLISH_TEXT,
  ja: {
    layout: {
      languageLabel: '表示言語',
      projectLinksLabel: 'プロジェクトリンク',
      eyebrow: 'ブラウザベースの科学計算アプリ',
      title: '理想運動量噴流 エクスプローラー',
      subtitle: '円形・矩形・楕円形の微粒化噴流のための対話型低次元モデル',
      description:
        '指定したノズル形状と面積成長が、保存的な局所均質二相噴流モデルにおけるバルク速度、混合密度、動圧、エントレインメントに与える影響を調べます。',
      author: JAPANESE_AFFILIATION,
      sourceCode: 'ソースコード',
      modelNotes: 'モデルノート',
      researchmap: 'researchmapプロフィール',
      footerLineage:
        'モデルの系譜: Franco, Fukumoto, Velte & Hodžić, JPSJ 2017 の円形理想運動量噴流モデル; 矩形・楕円形の面積成長拡張; Kumamoto JSFM 2026 短報版。',
      sourceRepository: 'ソースリポジトリ',
    },
    summary: {
      ariaLabel: '終端状態の概要',
      areaAtZetaMax: '最大 zeta での Ahat',
      velocity: 'vhat',
      density: 'rhohat',
      gasEntrainment: 'mhat_g',
      coefficient: 'K_A',
    },
    controls: {
      eyebrow: 'モデル入力',
      title: 'ノズルと面積成長の入力',
      geometry: 'ノズル形状',
      geometryAria: 'ノズル形状',
      rectangular: '矩形',
      elliptical: '楕円',
      densityRatio: '密度比',
      width: 'B0 幅',
      height: 'H0 高さ',
      majorAxis: 'a0 全長軸',
      minorAxis: 'b0 全短軸',
      theta: 'theta 半角',
      phi: 'phi 半角',
      zetaMax: 'zeta max = z / De',
      samplePoints: 'サンプル点数',
      derivedGeometryAria: '導出された形状量',
      presets: 'プリセット',
      presetsCopy: {
        'circular-limit': {
          name: '円形極限',
          description: '全軸が等しく、等方的に広がる楕円分岐。',
        },
        'square-limit': {
          name: '正方形極限',
          description: '辺が等しく、等方的に広がる矩形分岐。',
        },
        'rectangular-ar2': {
          name: '矩形 AR=2',
          description: '長辺方向の広がりが小さい等面積矩形ノズル。',
        },
        'elliptical-ar2': {
          name: '楕円 AR=2',
          description: '長軸方向の広がりが小さい全軸表記の楕円ノズル。',
        },
        'gutmark-like-elliptic': {
          name: 'Gutmark 型楕円例',
          description: '速度分岐のみの比較に用いる等密度楕円分岐。',
        },
        'liquid-in-air': {
          name: '空気中液体噴流例',
          description: '矩形異方性出口を用いた空気対水の密度比。',
        },
        'equal-density': {
          name: '等密度単相分岐',
          description: '密度比が 1 の単相極限。',
        },
      },
    },
    export: {
      eyebrow: '再現性',
      title: '共有とエクスポート',
      copyUrl: '共有URLをコピー',
      downloadCsv: 'CSVをダウンロード',
      helper:
        'URLにはモデル設定、プロットオプション、オーバーレイ選択、保存したモデルケース、断面表示設定が含まれます。CSVには現在の曲線と表示中の保存ケースが含まれます。',
      copied: '共有URLをコピーしました。',
    },
    comparison: {
      addEyebrow: 'モデル比較',
      addTitle: '保存したモデルケース',
      addButton: '現在のケースを比較に追加',
      addHelper:
        '保存したケースは固定され、スライダーは引き続き現在のライブ曲線を制御します。',
      added: '現在のケースを比較に追加しました。',
      maxWarning: '保存ケース数が上限に達しました。追加するにはケースを削除してください。',
      trayEyebrow: 'モデル比較',
      trayTitle: '保存したモデルケース',
      empty: '保存したモデルケースはまだありません。コントロールからケースを追加してライブ曲線と比較できます。',
      showAll: 'すべて表示',
      hideAll: 'すべて非表示',
      clearAll: 'すべて削除',
      currentLabel: '現在',
      removeCase: '保存ケースを削除',
      bulkActionsLabel: '比較ケースの操作',
    },
    equations: {
      eyebrow: '低次元モデル',
      title: '理想運動量クロージャ',
      momentum: '規定されたトップハット制御体積で軸方向運動量流束が保存されます。',
      density: '混合密度は、バルク連続式から得られる液相分率に基づきます。',
      pressure: '動圧は正規化面積の成長に反比例して減衰します。',
      entrainment:
        '気相エントレインメントは、入口液体流束に対する無次元量として表示します。',
      coefficient: '任意の面積成長履歴に対する一般化エントレインメント係数です。',
      coefficientReferences:
        'K_A プロットでは、破線と点線の水平線が K_A(0) と遠方漸近値 K_A(∞) を示します。正の二方向面積成長では K_A(∞)=sqrt(lambda_1 lambda_2) です。',
    },
    plots: {
      eyebrow: '対話型プロット',
      title: 'zeta 方向の状態変数',
      logDensity: '密度を対数表示',
      plotVariableAria: 'プロット変数',
      velocityOverlay: '速度オーバーレイ',
      none: 'なし',
      defaultOverlayNote:
        '公開された実測速度データセットはまだ同梱していません。オーバーレイは任意の比較補助であり、モデルの限定的な分岐のみを確認する場合があります。',
      xAxisTitle: '正規化距離, zeta = z / De',
      hoverZeta: 'zeta',
      hoverValue: '値',
      referenceValues: {
        title: '係数の参照値',
        nearFieldLimit: '近傍 K_A(0)',
        farFieldLimit: '遠方漸近 K_A(∞)',
        directionalRates: '方向別成長率',
        help:
          '破線と点線は、現在の設定に対する近傍値と遠方漸近値を示します。',
      },
      definitions: {
        area: { label: 'Ahat', yTitle: '正規化面積, Ahat' },
        velocity: { label: 'vhat', yTitle: 'バルク速度, vhat' },
        density: { label: 'rhohat', yTitle: '混合密度, rhohat' },
        pressure: { label: 'phat', yTitle: '動圧, phat' },
        entrainment: { label: 'mhat_g', yTitle: '気相エントレインメント率, mhat_g' },
        coefficient: { label: 'K_A', yTitle: '一般化エントレインメント係数, K_A' },
      },
      overlays: {
        'synthetic-equal-density-reference': {
          label: '合成速度曲線の例',
          source: 'アプリ内で生成した合成参照です。実測データではありません。',
          notes:
            'オーバーレイ機構を示すためだけの例です。初期状態では無効で、検証データとして解釈しないでください。',
        },
      },
    },
    geometry: {
      eyebrow: '3D形状',
      title: '拡大する制御体積',
      crossSection: '断面 zeta',
      showSelected: '選択断面を表示',
      highlightSwitching: '軸スイッチング断面を強調',
      jumpToSwitching: '軸スイッチングへ移動',
      selectedDimensions: '選択断面の寸法',
      areaAtSelected: '選択 zeta での Ahat',
      axisSwitching: '軸スイッチング',
      noneInRange: '範囲内になし',
      zetaPrefix: 'zeta',
      zAxis: 'z軸',
      surface: 'A(z) 面',
      controlsHint: 'ドラッグで回転 · スクロールでズーム · 右ドラッグ/Shiftドラッグでパン',
      playElement: '流体要素を再生',
      pauseElement: '流体要素を一時停止',
      resetElement: '要素をリセット',
      showElementDroplets: '要素内の液滴を表示',
      animationSpeed: 'アニメーション速度',
      elementZeta: '要素 zeta',
      animationHelp:
        'LHF の概念図：保存された液体マーカーが拡大する制御体積内に再分布します。',
    },
    interpretation: {
      eyebrow: 'モデルの範囲',
      title: 'クロージャ仮定と検証範囲',
      stateClosureTitle: '状態クロージャ',
      stateClosureBody:
        'このアプリは、保存的なトップハット型・局所均質二相状態クロージャを実装しています。入力は密度比と、規定された矩形または楕円形の面積成長履歴です。3D 表示の移動要素は LHF の概念図であり、液滴力学のシミュレーションではありません。',
      predictedTitle: '予測する量',
      predictedBody:
        '正規化面積、バルク速度、混合密度、動圧、気相エントレインメント、一般化エントレインメント係数 K_A(z)。',
      prescribedTitle: '規定する量',
      prescribedBody:
        'ノズル形状、初期寸法、方向別の広がり半角、下流サンプリング範囲は、推定量ではなくモデル入力です。',
      notPredictedTitle: '予測しない量',
      notPredictedBody:
        '軸スイッチング、渦構造、液滴径分布、分裂、損失、広がり角は予測しません。速度は等密度噴流データと比較できますが、混合密度の検証には相分率または濃度データが必要です。',
    },
    citations: {
      eyebrow: '参考文献',
      title: 'モデルとアプリの引用',
      formatAria: '引用形式',
      copy: 'コピー',
      copied: 'コピー済み',
      formats: {
        plain: 'プレーンテキスト',
        bibtex: 'BibTeX',
        latex: 'LaTeX',
        word: 'Word / APA',
      },
      entryTitles: {
        'franco-2017': '円形理想運動量噴流モデルの原論文',
        'kumamoto-2026': 'Kumamoto JSFM 非円形拡張',
        'web-app-2026': 'Ideal Momentum Jet Explorer Webアプリ',
      },
    },
  },
  es: {
    layout: {
      languageLabel: 'Idioma de la interfaz',
      projectLinksLabel: 'Enlaces del proyecto',
      eyebrow: 'Aplicación científica de cómputo en el navegador',
      title: 'Explorador del Chorro Ideal de Cantidad de Movimiento',
      subtitle:
        'Modelo reducido interactivo para chorros atomizantes circulares, rectangulares y elípticos',
      description:
        'Explore cómo la geometría de la boquilla y el crecimiento de área prescritos afectan la velocidad media, la densidad compuesta, la presión dinámica y el arrastre de gas en un modelo bifásico conservativo localmente homogéneo.',
      author: SPANISH_AFFILIATION,
      sourceCode: 'Código fuente',
      modelNotes: 'Notas del modelo',
      researchmap: 'Perfil researchmap',
      footerLineage:
        'Linaje del modelo: Franco, Fukumoto, Velte & Hodžić, JPSJ 2017, modelo circular de chorro ideal de cantidad de movimiento; extensión rectangular y elíptica de crecimiento de área; versión corta Kumamoto JSFM 2026.',
      sourceRepository: 'Repositorio fuente',
    },
    summary: {
      ariaLabel: 'Resumen del estado final',
      areaAtZetaMax: 'Ahat en zeta máximo',
      velocity: 'vhat',
      density: 'rhohat',
      gasEntrainment: 'mhat_g',
      coefficient: 'K_A',
    },
    controls: {
      eyebrow: 'Controles del modelo',
      title: 'Entradas de boquilla y crecimiento de área',
      geometry: 'Geometría de la boquilla',
      geometryAria: 'Geometría de la boquilla',
      rectangular: 'Rectangular',
      elliptical: 'Elíptica',
      densityRatio: 'Relación de densidades',
      width: 'Ancho B0',
      height: 'Altura H0',
      majorAxis: 'Eje mayor completo a0',
      minorAxis: 'Eje menor completo b0',
      theta: 'semiángulo theta',
      phi: 'semiángulo phi',
      zetaMax: 'zeta máximo = z / De',
      samplePoints: 'Puntos de muestreo',
      derivedGeometryAria: 'Valores geométricos derivados',
      presets: 'Preajustes',
      presetsCopy: {
        'circular-limit': {
          name: 'Límite circular',
          description: 'Rama elíptica con ejes completos iguales y expansión isotrópica.',
        },
        'square-limit': {
          name: 'Límite cuadrado',
          description: 'Rama rectangular con lados iguales y expansión isotrópica.',
        },
        'rectangular-ar2': {
          name: 'Rectangular AR=2',
          description:
            'Boquilla rectangular de área equivalente con expansión más lenta en el lado largo.',
        },
        'elliptical-ar2': {
          name: 'Elíptica AR=2',
          description:
            'Boquilla elíptica con ejes completos y expansión más lenta en el eje mayor.',
        },
        'gutmark-like-elliptic': {
          name: 'Ejemplo elíptico tipo Gutmark',
          description:
            'Rama elíptica de igual densidad para estudios comparativos solo de velocidad.',
        },
        'liquid-in-air': {
          name: 'Ejemplo líquido en aire',
          description: 'Relación de densidad aire-agua con salida rectangular anisotrópica.',
        },
        'equal-density': {
          name: 'Rama monofásica de igual densidad',
          description: 'Límite monofásico con relación de densidades igual a uno.',
        },
      },
    },
    export: {
      eyebrow: 'Reproducibilidad',
      title: 'Compartir y exportar',
      copyUrl: 'Copiar URL reproducible',
      downloadCsv: 'Descargar CSV',
      helper:
        'Las URL codifican la configuración del modelo, opciones de gráfica, selección de superposición, casos guardados y controles de sección. Los CSV incluyen la curva actual y los casos guardados visibles.',
      copied: 'URL reproducible copiada.',
    },
    comparison: {
      addEyebrow: 'Comparaciones del modelo',
      addTitle: 'Casos de modelo guardados',
      addButton: 'Agregar caso actual a la comparación',
      addHelper:
        'Los casos guardados permanecen fijos mientras los deslizadores siguen controlando la curva actual.',
      added: 'Caso actual agregado a la comparación.',
      maxWarning: 'Se alcanzó el máximo de casos guardados. Elimine uno para agregar otro.',
      trayEyebrow: 'Comparaciones del modelo',
      trayTitle: 'Casos de modelo guardados',
      empty: 'Aún no hay casos de modelo guardados. Agregue un caso desde los controles para compararlo con la curva actual.',
      showAll: 'Mostrar todos',
      hideAll: 'Ocultar todos',
      clearAll: 'Borrar todos',
      currentLabel: 'Actual',
      removeCase: 'Eliminar caso guardado',
      bulkActionsLabel: 'Controles de casos comparativos',
    },
    equations: {
      eyebrow: 'Modelo reducido',
      title: 'Cierre de cantidad de movimiento ideal',
      momentum:
        'El flujo axial de cantidad de movimiento se conserva para el volumen de control top-hat prescrito.',
      density:
        'La densidad compuesta se obtiene de la fracción líquida implícita por la continuidad media.',
      pressure: 'La presión dinámica decae directamente con el crecimiento de área normalizada.',
      entrainment:
        'El arrastre de gas se informa en forma adimensional respecto al flujo líquido de entrada.',
      coefficient:
        'Coeficiente generalizado de arrastre para historias arbitrarias de crecimiento de área.',
      coefficientReferences:
        'En la gráfica de K_A, las líneas horizontales discontinua y punteada muestran K_A(0) y la asíntota lejana K_A(∞); para crecimiento positivo en dos direcciones, K_A(∞)=sqrt(lambda_1 lambda_2).',
    },
    plots: {
      eyebrow: 'Gráficas interactivas',
      title: 'Variables de estado a lo largo de zeta',
      logDensity: 'Densidad logarítmica',
      plotVariableAria: 'Variable graficada',
      velocityOverlay: 'Superposición de velocidad',
      none: 'Ninguna',
      defaultOverlayNote:
        'Aún no se incluye un conjunto público de velocidades medidas. Las superposiciones son ayudas opcionales de comparación y pueden probar solo ramas reducidas del modelo.',
      xAxisTitle: 'Distancia normalizada, zeta = z / De',
      hoverZeta: 'zeta',
      hoverValue: 'valor',
      referenceValues: {
        title: 'Valores de referencia del coeficiente',
        nearFieldLimit: 'Campo cercano K_A(0)',
        farFieldLimit: 'Asíntota lejana K_A(∞)',
        directionalRates: 'Tasas direccionales',
        help:
          'Las líneas discontinua y punteada muestran el valor de campo cercano y la asíntota lejana para la configuración actual.',
      },
      definitions: {
        area: { label: 'Ahat', yTitle: 'Área normalizada, Ahat' },
        velocity: { label: 'vhat', yTitle: 'Velocidad media, vhat' },
        density: { label: 'rhohat', yTitle: 'Densidad compuesta, rhohat' },
        pressure: { label: 'phat', yTitle: 'Presión dinámica, phat' },
        entrainment: { label: 'mhat_g', yTitle: 'Tasa de arrastre de gas, mhat_g' },
        coefficient: {
          label: 'K_A',
          yTitle: 'Coeficiente generalizado de arrastre, K_A',
        },
      },
      overlays: {
        'synthetic-equal-density-reference': {
          label: 'Curva sintética de velocidad de ejemplo',
          source: 'Referencia sintética generada dentro de la app; no es dato medido.',
          notes:
            'Solo ilustra el mecanismo de superposición. Está desactivada por defecto y no debe interpretarse como dato de validación.',
        },
      },
    },
    geometry: {
      eyebrow: 'Geometría 3D',
      title: 'Volumen de control en expansión',
      crossSection: 'Sección zeta',
      showSelected: 'Mostrar sección seleccionada',
      highlightSwitching: 'Resaltar sección de cambio de eje',
      jumpToSwitching: 'Ir al cambio de eje',
      selectedDimensions: 'Dimensiones seleccionadas',
      areaAtSelected: 'Ahat en la zeta seleccionada',
      axisSwitching: 'Cambio de eje',
      noneInRange: 'ninguno en el rango',
      zetaPrefix: 'zeta',
      zAxis: 'eje z',
      surface: 'superficie A(z)',
      controlsHint:
        'Arrastre para rotar · rueda para zoom · clic derecho/Shift-arrastre para desplazar',
      playElement: 'Reproducir elemento fluido',
      pauseElement: 'Pausar elemento fluido',
      resetElement: 'Reiniciar elemento',
      showElementDroplets: 'Mostrar gotas en el elemento',
      animationSpeed: 'Velocidad de animación',
      elementZeta: 'zeta del elemento',
      animationHelp:
        'Elemento LHF conceptual: marcadores líquidos conservados redistribuidos dentro del volumen de control en expansión.',
    },
    interpretation: {
      eyebrow: 'Alcance del modelo',
      title: 'Supuestos de cierre y límite de validación',
      stateClosureTitle: 'Cierre de estado',
      stateClosureBody:
        'Esta app implementa un cierre de estado bifásico conservativo, top-hat y localmente homogéneo. Las entradas son la relación de densidades y una historia prescrita de crecimiento de área rectangular o elíptica. El elemento móvil en la vista 3D es una visualización conceptual LHF, no una simulación de dinámica de gotas.',
      predictedTitle: 'Predice',
      predictedBody:
        'Área normalizada, velocidad media, densidad compuesta, presión dinámica, arrastre de gas y el coeficiente generalizado de arrastre K_A(z).',
      prescribedTitle: 'Prescrito',
      prescribedBody:
        'La geometría de la boquilla, dimensiones iniciales, semiángulos direccionales de expansión y rango de muestreo aguas abajo son entradas del modelo, no cantidades inferidas.',
      notPredictedTitle: 'No predice',
      notPredictedBody:
        'Cambio de eje, dinámica vorticial, distribución de tamaño de gotas, ruptura, pérdidas ni ángulos de expansión. La velocidad puede compararse con datos de chorros de igual densidad; la densidad compuesta requiere datos de fracción de fase o concentración.',
    },
    citations: {
      eyebrow: 'Referencias',
      title: 'Citar este modelo y la app',
      formatAria: 'Formato de cita',
      copy: 'Copiar',
      copied: 'Copiado',
      formats: {
        plain: 'Texto plano',
        bibtex: 'BibTeX',
        latex: 'LaTeX',
        word: 'Word / APA',
      },
      entryTitles: {
        'franco-2017': 'Modelo circular original de chorro ideal de cantidad de movimiento',
        'kumamoto-2026': 'Extensión no circular Kumamoto JSFM',
        'web-app-2026': 'Aplicación web Ideal Momentum Jet Explorer',
      },
    },
  },
}
