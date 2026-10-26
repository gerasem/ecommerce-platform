import type { CollectionConfig } from 'payload'

import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import { adminOnly, adminOnlyField } from '@/access/adminOnly'
import { slugField } from '@/fields/slug'
import { adminOrPublishedStatus } from '@/access/adminOrPublishedStatus'
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField
} from '@payloadcms/plugin-seo/fields'
import { revalidatePage, revalidateDelete } from './hooks/revalidatePage'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor
} from '@payloadcms/richtext-lexical'

import { ContentBlock } from '@/blocks/Content'
import { ConversionBoxesBlock } from '@/blocks/ConversionBoxes'
import { FormBlock } from '@/blocks/Form'
import { RawHtmlBlock } from '@/blocks/RawHtml'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: { en: 'Page', ru: 'Страница', de: 'Seite', fr: 'Page' },
    plural: { en: 'Pages', ru: 'Страницы', de: 'Seiten', fr: 'Pages' }
  },
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: adminOrPublishedStatus,
    update: adminOnly
  },
  admin: {
    group: { en: 'Content', ru: 'Контент', de: 'Inhalt', fr: 'Contenu' },
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'pages',
          req
        })
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'pages',
        req
      }),
    useAsTitle: 'title'
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: { en: 'Title', ru: 'Заголовок', de: 'Titel', fr: 'Titre' },
      required: true,
      localized: true
    },
    {
      name: 'systemRole',
      type: 'select',
      label: { en: 'System Role', ru: 'Системная роль', de: 'Systemrolle', fr: 'Rôle système' },
      defaultValue: 'none',
      admin: {
        position: 'sidebar',
        description: {
          en: 'Used for dynamic routing in the frontend.',
          ru: 'Используется для динамической маршрутизации на фронтенде.',
          de: 'Wird für das dynamische Routing im Frontend verwendet.',
          fr: 'Utilisé pour le routage dynamique sur le frontend.'
        }
      },
      options: [
        {
          label: { en: 'None', ru: 'Нет', de: 'Keine', fr: 'Aucun' },
          value: 'none'
        },
        {
          label: { en: 'Home', ru: 'Главная', de: 'Startseite', fr: 'Accueil' },
          value: 'home'
        },
        {
          label: { en: 'Cart', ru: 'Корзина', de: 'Warenkorb', fr: 'Panier' },
          value: 'cart'
        },
        {
          label: { en: 'Checkout', ru: 'Оформление заказа', de: 'Kasse', fr: 'Paiement' },
          value: 'checkout'
        },
        {
          label: { en: 'Favorites', ru: 'Избранное', de: 'Favoriten', fr: 'Favoris' },
          value: 'favorites'
        },
        {
          label: { en: 'All Items', ru: 'Все товары', de: 'Alle Artikel', fr: 'Tous les articles' },
          value: 'all_items'
        },
        {
          label: {
            en: 'Privacy Policy',
            ru: 'Политика конфиденциальности',
            de: 'Datenschutzrichtlinie',
            fr: 'Politique de confidentialité'
          },
          value: 'privacy_policy'
        },
        {
          label: {
            en: 'Imprint',
            ru: 'Выходные данные (Imprint)',
            de: 'Impressum',
            fr: 'Mentions légales'
          },
          value: 'imprint'
        },
        {
          label: { en: 'Delivery', ru: 'Доставка', de: 'Lieferung', fr: 'Livraison' },
          value: 'delivery'
        }
      ],
      validate: async (value: string | null | undefined, { data, req }: any) => {
        if (!value || value === 'none') return true
        const { payload } = req
        const query: Record<string, any> = {
          systemRole: { equals: value }
        }
        if (data?.id) {
          query['id'] = { not_equals: data.id }
        }
        const existing = await payload.find({
          collection: 'pages',
          where: query,
          limit: 1
        })
        if (existing.totalDocs > 0) {
          return 'This system role is already assigned to another page.'
        }
        return true
      }
    },
    {
      name: 'subtitle',
      type: 'text',
      label: { en: 'Subtitle', ru: 'Подзаголовок', de: 'Untertitel', fr: 'Sous-titre' },
      localized: true,
      admin: {
        description: {
          en: 'Displayed as H1 on the page. Falls back to Title if empty.',
          ru: 'Отображается как H1 на странице. По умолчанию используется Заголовок.',
          de: 'Wird als H1 auf der Seite angezeigt. Fällt auf den Titel zurück, wenn leer.',
          fr: 'Affiché comme H1 sur la page. Reprend le titre si vide.'
        }
      }
    },
    {
      name: 'view',
      type: 'select',
      label: { en: 'View', ru: 'Шаблон страницы', de: 'Seitenansicht', fr: 'Modèle de vue' },
      required: true,
      defaultValue: 'default',
      access: {
        create: adminOnlyField,
        update: adminOnlyField
      },
      admin: {
        position: 'sidebar',
        description: {
          en: 'Select the view template to render this page on the frontend.',
          ru: 'Выберите шаблон для отображения страницы на фронтенде.',
          de: 'Wählen Sie die Vorlage für das Rendering dieser Seite im Frontend.',
          fr: 'Sélectionnez le modèle de vue pour afficher cette page sur le frontend.'
        }
      },
      options: [
        {
          label: {
            en: 'Default View',
            ru: 'Стандартный вид',
            de: 'Standardansicht',
            fr: 'Vue par défaut'
          },
          value: 'default'
        },
        {
          label: {
            en: 'Favorites View',
            ru: 'Избранное',
            de: 'Favoriten-Ansicht',
            fr: 'Vue Favoris'
          },
          value: 'favorites'
        },
        {
          label: {
            en: 'Checkout View',
            ru: 'Оформление заказа',
            de: 'Kassen-Ansicht',
            fr: 'Vue Paiement'
          },
          value: 'checkout'
        },
        {
          label: {
            en: 'Cart View',
            ru: 'Корзина',
            de: 'Warenkorb-Ansicht',
            fr: 'Vue Panier'
          },
          value: 'cart'
        },
        {
          label: {
            en: 'All Items View',
            ru: 'Все товары',
            de: 'Alle-Artikel-Ansicht',
            fr: 'Vue Tous les articles'
          },
          value: 'all-items'
        },
        {
          label: {
            en: 'News View',
            ru: 'Новости',
            de: 'Nachrichten-Ansicht',
            fr: 'Vue Actualités'
          },
          value: 'news'
        }
      ]
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
    {
      type: 'tabs',
      tabs: [
        {
          label: {
            en: 'Layout Blocks',
            ru: 'Блоки макета',
            de: 'Layout-Blöcke',
            fr: 'Blocs de mise en page'
          },
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              label: { en: 'Layout', ru: 'Макет', de: 'Layout', fr: 'Mise en page' },
              blocks: [ContentBlock, ConversionBoxesBlock, FormBlock, RawHtmlBlock],
              required: true
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
    },
    slugField()
  ],
  hooks: {
    afterChange: [revalidatePage],
    afterDelete: [revalidateDelete]
  },
  versions: {
    drafts: {
      autosave: true
    },
    maxPerDoc: 50
  }
}
