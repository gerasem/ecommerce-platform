import fs from 'fs/promises'
import path from 'path'

export const getSvgContent = async ({ doc, req }: any) => {
  if (doc.filename && doc.mimeType === 'image/svg+xml') {
    const baseDir = process.env.SVG_MEDIA_DIR ? path.resolve(process.cwd(), process.env.SVG_MEDIA_DIR) : path.join(process.cwd(), 'public/svg-media');
    const filePath = path.join(baseDir, doc.filename)
    try {
      const svgContent = await fs.readFile(filePath, 'utf-8')
      doc.svgContent = svgContent
    } catch (error) {
      console.error('Error reading SVG file:', error)
    }
  }
  return doc
}
