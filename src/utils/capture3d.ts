export function create3DCaptureFilename(date = new Date()): string {
  const timestamp = date.toISOString().replace(/[:.]/g, '-')

  return `ideal-momentum-jet-3d-view_${timestamp}.png`
}

export function downloadCanvasPng(
  canvas: HTMLCanvasElement,
  filename = create3DCaptureFilename(),
): Promise<void> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Could not capture the 3D canvas.'))
        return
      }

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      resolve()
    }, 'image/png')
  })
}
