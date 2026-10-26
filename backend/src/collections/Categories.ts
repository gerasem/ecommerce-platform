import { slugField } from '@/fields/slug'
import { adminOnly } from '@/access/adminOnly'
import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor
} from '@payloadcms/richtext-lexical'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField
} from '@payloadcms/plugin-seo/fields'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: { en: 'Category', ru: 'Категория', de: 'Kategorie', fr: 'Catégorie' },
    plural: { en: 'Categories', ru: 'Категории', de: 'Kategorien', fr: 'Catégories' }
  },
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: () => true,
    update: adminOnly
  },
  admin: {
    useAsTitle: 'title',
    group: { en: 'Content', ru: 'Контент', de: 'Inhalt', fr: 'Contenu' },
    description: {
      en: 'Categories',
      ru: 'Категории',
      de: 'Kategorien',
      fr: 'Catégories'
    }
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: { en: 'Title', ru: 'Название', de: 'Titel', fr: 'Titre' },
      required: true,
      localized: true
    },

    slugField(),

    {
      type: 'tabs',
      tabs: [
        {
          label: { en: 'Content', ru: 'Контент', de: 'Inhalt', fr: 'Contenu' },
          fields: [
            {
              name: 'image',
              type: 'upload',
              label: { en: 'Image', ru: 'Изображение', de: 'Bild', fr: 'Image' },
              relationTo: 'media',
              required: false,
              filterOptions: () => ({
                mimeType: { in: ['image/jpeg', 'image/png', 'image/webp'] }
              })
            },

            {
              name: 'description',
              type: 'richText',
              label: { en: 'Description', ru: 'Описание', de: 'Beschreibung', fr: 'Description' },
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
                }
              }),
              required: false,
              localized: true
            }
          ]
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image'
            }),
            MetaTitleField({
              hasGenerateFn: true
            }),
            MetaImageField({
              relationTo: 'media'
            }),

            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description'
            })
          ]
        }
      ]
    }
  ]
}
