import type { CollectionConfig } from 'payload'
import { getSvgContent } from './hooks/getSvgContent'
import { adminOnly } from '@/access/adminOnly'

import { fileURLToPath } from 'url'
import path from 'path'
const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const SvgMedia: CollectionConfig = {
  slug: 'svg-media',
  labels: {
    singular: { en: 'SVG Media', ru: 'SVG Иконка', de: 'SVG-Medium', fr: 'Icône SVG' },
    plural: { en: 'SVG Media', ru: 'SVG Иконки', de: 'SVG-Medien', fr: 'Icônes SVG' }
  },
  admin: {
    group: { en: 'Content', ru: 'Контент', de: 'Inhalt', fr: 'Contenu' },
    defaultColumns: ['filename', 'updatedAt'],
    useAsTitle: 'filename'
  },
  upload: {
    mimeTypes: ['image/svg+xml'],
    staticDir: process.env.SVG_MEDIA_DIR
      ? path.resolve(process.cwd(), process.env.SVG_MEDIA_DIR)
      : path.resolve(dirname, '../../../public/svg-media')
  },
  fields: [
    {
      name: 'svgContent',
      type: 'textarea',
      admin: {
        hidden: true
      }
    }
  ],
  hooks: {
    afterRead: [getSvgContent]
  },
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: () => true,
    update: adminOnly
  }
}
