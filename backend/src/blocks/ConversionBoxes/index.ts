import type { Block } from 'payload'

import { blockSettingsFields } from '../sharedSettings'

export const ConversionBoxesBlock: Block = {
  slug: 'conversionBoxes',
  interfaceName: 'ConversionBoxesBlock',
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: { en: 'Boxes', ru: 'Карточки', de: 'Boxen', fr: 'Boîtes' },
          fields: [
            {
              name: 'boxes',
              type: 'array',
              label: {
                en: 'Conversion Boxes',
                ru: 'Карточки конверсии',
                de: 'Conversion-Boxen',
                fr: 'Boîtes de conversion'
              },
              fields: [
                {
                  name: 'content',
                  type: 'richText',
                  label: { en: 'Content', ru: 'Контент', de: 'Inhalt', fr: 'Contenu' },
                  required: true,
                  localized: true
                },
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  label: { en: 'Image', ru: 'Изображение', de: 'Bild', fr: 'Image' },
                  required: true
                }
              ]
            }
          ]
        },
        {
          label: {
            en: 'Block Layout',
            ru: 'Настройки блока',
            de: 'Block-Layout',
            fr: 'Mise en page du bloc'
          },
          fields: blockSettingsFields
        }
      ]
    }
  ]
}
