import type { GlobalConfig } from 'payload'
import {
  lexicalEditor,
  BoldFeature,
  ItalicFeature,
  UnderlineFeature
} from '@payloadcms/richtext-lexical'

import { adminOnly } from '@/access/adminOnly'
import { link } from '@/fields/link'

export const Header: GlobalConfig = {
  slug: 'header',
  label: { en: 'Header', ru: 'Шапка сайта', de: 'Kopfzeile', fr: 'En-tête' },
  access: {
    read: () => true,
    update: adminOnly
  },
  admin: {
    group: { en: 'Settings', ru: 'Настройки', de: 'Einstellungen', fr: 'Paramètres' }
  },
  fields: [
    {
      name: 'icon',
      type: 'relationship',
      label: { en: 'Logo', ru: 'Логотип', de: 'Logo', fr: 'Logo' },
      relationTo: 'svg-media',
      required: false
    },
    {
      name: 'slogan',
      type: 'richText',
      editor: lexicalEditor({
        features: () => [BoldFeature(), ItalicFeature(), UnderlineFeature()]
      }),
      localized: true,
      required: false,
      label: {
        en: 'Slogan',
        ru: 'Слоган',
        de: 'Slogan',
        fr: 'Slogan'
      }
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
      maxRows: 4,
      required: false,
      localized: true
    },
    {
      name: 'navButtons',
      type: 'array',
      label: { en: 'Buttons', ru: 'Кнопки', de: 'Buttons', fr: 'Boutons' },
      fields: [
        link({
          appearances: false
        })
      ],
      maxRows: 3,
      required: false,
      localized: true
    },
    {
      name: 'headerPages',
      type: 'relationship',
      relationTo: 'pages',
      hasMany: true,
      label: {
        en: 'Top Navigation Pages',
        ru: 'Страницы верхней навигации',
        de: 'Seiten der oberen Navigation',
        fr: 'Pages de navigation supérieure'
      },
      admin: {
        description: {
          en: 'Select pages to show in the top navigation row.',
          ru: 'Выберите страницы для отображения в верхней панели навигации.',
          de: 'Wählen Sie die Seiten für die obere Navigationsleiste aus.',
          fr: 'Sélectionnez les pages à afficher dans la barre de navigation supérieure.'
        }
      }
    },
    {
      name: 'importantNotice',
      type: 'group',
      label: {
        en: 'Important Notice',
        ru: 'Важное уведомление',
        de: 'Wichtiger Hinweis',
        fr: 'Avis important'
      },
      fields: [
        {
          name: 'showNotice',
          type: 'checkbox',
          label: {
            en: 'Show Notice',
            ru: 'Показывать уведомление',
            de: 'Hinweis anzeigen',
            fr: "Afficher l'avis"
          },
          defaultValue: false
        },
        {
          name: 'noticeIcon',
          type: 'relationship',
          relationTo: 'svg-media',
          label: { en: 'Icon', ru: 'Иконка', de: 'Icon', fr: 'Icône' },
          required: false
        },
        {
          name: 'noticeText',
          type: 'richText',
          label: {
            en: 'Notice Text',
            ru: 'Текст уведомления',
            de: 'Hinweistext',
            fr: "Texte de l'avis"
          },
          localized: true
        }
      ],
      admin: {
        description: {
          en: 'Displayed below the main header on the frontend.',
          ru: 'Отображается под шапкой на фронтенде.',
          de: 'Wird unter der Kopfzeile im Frontend angezeigt.',
          fr: "Affiché sous l'en-tête sur le frontend."
        }
      }
    }
  ]
}
