import type { CollectionConfig } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'
import { adminOnly } from '@/access/adminOnly'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  labels: {
    singular: { en: 'Media', ru: 'Медиафайл', de: 'Medium', fr: 'Média' },
    plural: { en: 'Media', ru: 'Медиафайлы', de: 'Medien', fr: 'Médias' }
  },
  admin: {
    group: { en: 'Content', ru: 'Контент', de: 'Inhalt', fr: 'Contenu' },
    useAsTitle: 'filename'
  },
  slug: 'media',
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: () => true,
    update: adminOnly
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: {
        en: 'Alt Text',
        ru: 'Альтернативный текст',
        de: 'Alt-Text',
        fr: 'Texte alternatif'
      },
      required: true
    }
  ],
  upload: {
    staticDir: process.env.MEDIA_DIR
      ? path.resolve(process.cwd(), process.env.MEDIA_DIR)
      : path.resolve(dirname, '../../public/media'),
    adminThumbnail: 'thumbnail',
    formatOptions: {
      format: 'webp',
      options: {
        quality: 95
      }
    },
    imageSizes: [
      {
        name: 'categoryPreview',
        width: 320,
        height: 180,
        fit: 'cover',
        position: 'centre',
        withoutEnlargement: true,
        formatOptions: {
          format: 'webp',
          options: {
            quality: 95
          }
        }
      },
      {
        name: 'thumbnail',
        width: 400,
        height: 400,
        fit: 'cover',
        position: 'centre',
        withoutEnlargement: true,
        formatOptions: {
          format: 'webp',
          options: {
            quality: 95
          }
        }
      }
    ]
  }
}
