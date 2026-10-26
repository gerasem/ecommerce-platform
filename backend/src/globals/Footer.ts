import type { GlobalConfig } from 'payload'
import {
  lexicalEditor,
  BoldFeature,
  ItalicFeature,
  UnderlineFeature
} from '@payloadcms/richtext-lexical'
import { adminOnly } from '@/access/adminOnly'
import { link } from '@/fields/link'

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: { en: 'Footer', ru: 'Подвал сайта', de: 'Fußzeile', fr: 'Pied de page' },
  access: {
    read: () => true,
    update: adminOnly
  },
  admin: {
    group: { en: 'Settings', ru: 'Настройки', de: 'Einstellungen', fr: 'Paramètres' }
  },
  fields: [
    {
      name: 'slogan',
      type: 'richText',
      editor: lexicalEditor({
        features: () => [BoldFeature(), ItalicFeature(), UnderlineFeature()]
      }),
      label: {
        en: 'Slogan in Footer',
        ru: 'Слоган в подвале',
        de: 'Slogan in der Fußzeile',
        fr: 'Slogan dans le pied de page'
      },
      localized: true
    },

    {
      name: 'contactLink',
      type: 'group',
      label: {
        en: 'Contact Link',
        ru: 'Контактная ссылка',
        de: 'Kontakt-Link',
        fr: 'Lien de contact'
      },
      fields: [
        link({
          appearances: false,
          disableRequired: true
        })
      ],
      localized: true
    },

    {
      name: 'socialLink',
      type: 'group',
      label: {
        en: 'Social Link',
        ru: 'Ссылка на соцсеть',
        de: 'Social-Media-Link',
        fr: 'Lien réseau social'
      },
      fields: [
        link({
          appearances: false,
          disableRequired: true
        })
      ],
      localized: true
    },

    {
      name: 'navItems',
      type: 'array',
      label: { en: 'Links', ru: 'Ссылки', de: 'Links', fr: 'Liens' },
      fields: [
        link({
          appearances: false
        })
      ],
      maxRows: 16,
      localized: true
    }
  ]
}
