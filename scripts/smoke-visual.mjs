import { chromium } from 'playwright-core'

const url = process.env.SMOKE_URL ?? 'http://127.0.0.1:5173/ideal-momentum-jet-explorer/'
const chromePath = process.env.CHROME_PATH ?? '/usr/bin/google-chrome-stable'

const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'mobile', width: 390, height: 844 },
]

const browser = await chromium.launch({
  executablePath: chromePath,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})

try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport })
    await page.goto(url, { waitUntil: 'networkidle' })
    await page.waitForSelector('.js-plotly-plot')
    await page.waitForSelector('.viewer-shell canvas')
    await page.waitForTimeout(900)

    const plotCheck = await page.evaluate(() => {
      const plot = document.querySelector('.js-plotly-plot')
      const lineCount = plot?.querySelectorAll('.scatterlayer path.js-line').length ?? 0
      const rect = plot?.getBoundingClientRect()

      return {
        lineCount,
        width: Math.round(rect?.width ?? 0),
        height: Math.round(rect?.height ?? 0),
      }
    })

    const canvasCheck = await page.evaluate(() => {
      const canvas = document.querySelector('.viewer-shell canvas')
      if (!(canvas instanceof HTMLCanvasElement)) {
        return { ok: false, reason: 'missing canvas' }
      }

      const gl =
        canvas.getContext('webgl2', { preserveDrawingBuffer: true }) ??
        canvas.getContext('webgl', { preserveDrawingBuffer: true })
      if (!gl) {
        return { ok: false, reason: 'missing webgl context' }
      }

      const width = gl.drawingBufferWidth
      const height = gl.drawingBufferHeight
      const samples = []
      const pixel = new Uint8Array(4)

      for (const xFactor of [0.28, 0.42, 0.56, 0.7]) {
        for (const yFactor of [0.28, 0.42, 0.56, 0.7]) {
          gl.readPixels(
            Math.floor(width * xFactor),
            Math.floor(height * yFactor),
            1,
            1,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            pixel,
          )
          samples.push(`${pixel[0]},${pixel[1]},${pixel[2]},${pixel[3]}`)
        }
      }

      return {
        ok: new Set(samples).size > 1,
        width,
        height,
        distinctSamples: new Set(samples).size,
      }
    })

    await page.screenshot({
      path: `/tmp/ideal-momentum-jet-${viewport.name}.png`,
      fullPage: true,
    })

    if (plotCheck.lineCount < 1 || plotCheck.width < 200 || plotCheck.height < 200) {
      throw new Error(`${viewport.name}: Plotly plot did not render usable line output.`)
    }

    if (!canvasCheck.ok) {
      throw new Error(
        `${viewport.name}: Three.js canvas pixel check failed: ${JSON.stringify(canvasCheck)}`,
      )
    }

    console.log(
      `${viewport.name}: plot ${plotCheck.width}x${plotCheck.height}, canvas ${canvasCheck.width}x${canvasCheck.height}, pixel samples ${canvasCheck.distinctSamples}`,
    )

    await page.close()
  }
} finally {
  await browser.close()
}
