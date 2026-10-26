import type { GlobalConfig } from 'payload'
import { adminOnly } from '@/access/adminOnly'

export const InformationBanner: GlobalConfig = {
  slug: 'information-banner',
  label: {
    en: 'Information Banner',
    ru: 'Информационный баннер',
    de: 'Informationsbanner',
    fr: "Bannière d'information"
  },
  access: {
    read: () => true,
    update: adminOnly
  },
  admin: {
    group: { en: 'Settings', ru: 'Настройки', de: 'Einstellungen', fr: 'Paramètres' }
  },
  fields: [
    {
      name: 'items',
      type: 'array',
      label: {
        en: 'Banner Items',
        ru: 'Элементы баннера',
        de: 'Banner-Elemente',
        fr: 'Éléments de bannière'
      },
      maxRows: 4,
      fields: [
        {
          name: 'text',
          type: 'text',
          label: { en: 'Text', ru: 'Текст', de: 'Text', fr: 'Texte' },
          required: true,
          localized: true
        },
        {
          name: 'icon',
          type: 'relationship',
          label: { en: 'SVG Icon', ru: 'SVG Иконка', de: 'SVG-Icon', fr: 'Icône SVG' },
          relationTo: 'svg-media',
          required: false
        }
      ]
    }
  ]
}
