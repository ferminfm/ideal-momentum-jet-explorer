export type CitationFormat = 'plain' | 'bibtex' | 'latex' | 'word'

export interface CitationEntry {
  id: string
  title: string
  formats: Record<CitationFormat, string>
}

export const CITATIONS: CitationEntry[] = [
  {
    id: 'franco-2017',
    title: 'Original circular ideal momentum jet model',
    formats: {
      plain:
        'Franco, F., Fukumoto, Y., Velte, C. M., & Hodžić, A. (2017). Mass entrainment rate of an ideal momentum turbulent round jet. Journal of the Physical Society of Japan, 86(3), 034401. https://doi.org/10.7566/JPSJ.86.034401',
      bibtex: `@article{Franco2017IdealMomentumJet,
  author = {Franco, Fermín and Fukumoto, Yasuhide and Velte, Clara M. and Hodžić, Azur},
  title = {Mass Entrainment Rate of an Ideal Momentum Turbulent Round Jet},
  journal = {Journal of the Physical Society of Japan},
  volume = {86},
  number = {3},
  pages = {034401},
  year = {2017},
  doi = {10.7566/JPSJ.86.034401}
}`,
      latex:
        '\\cite{Franco2017IdealMomentumJet} introduced the circular ideal momentum jet entrainment formulation used as the baseline for this reduced-order model.',
      word:
        'Franco, F., Fukumoto, Y., Velte, C. M., & Hodžić, A. (2017). Mass entrainment rate of an ideal momentum turbulent round jet. Journal of the Physical Society of Japan, 86(3), 034401. https://doi.org/10.7566/JPSJ.86.034401',
    },
  },
  {
    id: 'kumamoto-2026',
    title: 'Kumamoto JSFM noncircular extension',
    formats: {
      plain:
        'Franco-Medrano, F., Cabrera-Ward, F., & Fukumoto, Y. (2026). Extension of an ideal atomizing jet model to noncircular nozzle geometries and recovery of the circular nozzle limit. Presented at the 37th JSFM Chugoku-Shikoku/Kyushu Branch Meeting, Kumamoto University, Japan, May 30, 2026.',
      bibtex: `@misc{FrancoMedrano2026NoncircularJetKumamoto,
  author = {Franco-Medrano, Fermín and Cabrera-Ward, Fernando and Fukumoto, Yasuhide},
  title = {Extension of an Ideal Atomizing Jet Model to Noncircular Nozzle Geometries and Recovery of the Circular Nozzle Limit},
  howpublished = {Conference abstract/talk presented at the 37th Japan Society of Fluid Mechanics Chugoku-Shikoku/Kyushu Branch Meeting, Kumamoto University, Japan},
  year = {2026},
  month = may,
  note = {Kumamoto University, May 30, 2026}
}`,
      latex:
        '\\cite{FrancoMedrano2026NoncircularJetKumamoto} presents the rectangular and elliptical area-growth extension used in this app.',
      word:
        'Franco-Medrano, F., Cabrera-Ward, F., & Fukumoto, Y. (2026). Extension of an ideal atomizing jet model to noncircular nozzle geometries and recovery of the circular nozzle limit. Conference abstract/talk presented at the 37th Japan Society of Fluid Mechanics Chugoku-Shikoku/Kyushu Branch Meeting, Kumamoto University, Japan.',
    },
  },
  {
    id: 'web-app-2026',
    title: 'Ideal Momentum Jet Explorer web application',
    formats: {
      plain:
        'Franco-Medrano, F. (2026). Ideal Momentum Jet Explorer [Web application]. GitHub Pages. https://ferminfm.github.io/ideal-momentum-jet-explorer/',
      bibtex: `@software{FrancoMedrano2026IdealMomentumJetExplorer,
  author = {Franco-Medrano, Fermín},
  title = {Ideal Momentum Jet Explorer},
  year = {2026},
  url = {https://ferminfm.github.io/ideal-momentum-jet-explorer/},
  note = {Interactive web application for reduced-order atomizing jet models}
}`,
      latex:
        'The interactive calculations and figures can be reproduced with the Ideal Momentum Jet Explorer web application \\cite{FrancoMedrano2026IdealMomentumJetExplorer}.',
      word:
        'Franco-Medrano, F. (2026). Ideal Momentum Jet Explorer [Web application]. GitHub Pages. https://ferminfm.github.io/ideal-momentum-jet-explorer/',
    },
  },
]
