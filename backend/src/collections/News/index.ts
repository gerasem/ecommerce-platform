import type { CollectionConfig } from 'payload'
import { adminOnly } from '@/access/adminOnly'
import { adminOrPublishedStatus } from '@/access/adminOrPublishedStatus'
import { slugField } from '@/fields/slug'
import { featureEnabled } from '@/access/featureEnabled'
import { features } from '@/lib/features'

export const News: CollectionConfig = {
  slug: 'news',
  labels: {
    singular: { en: 'News', ru: 'Новость', de: 'Nachricht', fr: 'Actualité' },
    plural: { en: 'News', ru: 'Новости', de: 'Nachrichten', fr: 'Actualités' }
  },
  admin: {
    group: { en: 'Content', ru: 'Контент', de: 'Inhalt', fr: 'Contenu' },
    hidden: !features.news,
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'publishedOn']
  },
  access: {
    create: featureEnabled('news', adminOnly),
    delete: featureEnabled('news', adminOnly),
    read: featureEnabled('news', adminOrPublishedStatus),
    update: featureEnabled('news', adminOnly)
  },
  versions: {
    drafts: true
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: { en: 'Title', ru: 'Заголовок', de: 'Titel', fr: 'Titre' },
      required: true
    },
    {
      name: 'content',
      type: 'richText',
      label: { en: 'Content', ru: 'Содержание', de: 'Inhalt', fr: 'Contenu' },
      required: true
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: { en: 'Image', ru: 'Изображение', de: 'Bild', fr: 'Image' },
      admin: {
        position: 'sidebar'
      }
    },
    {
      name: 'publishedOn',
      type: 'date',
      label: {
        en: 'Published On',
        ru: 'Дата публикации',
        de: 'Veröffentlicht am',
        fr: 'Publié le'
      },
      admin: {
        date: {
          pickerAppearance: 'dayAndTime'
        },
        position: 'sidebar'
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          }
        ]
      }
    },
    slugField()
  ]
}
