import type { GlobalConfig } from 'payload'
import { adminOnly } from '@/access/adminOnly'

export const ShopSettings: GlobalConfig = {
  slug: 'shop-settings',
  label: {
    en: 'Shop Settings',
    ru: 'Настройки магазина',
    de: 'Shop-Einstellungen',
    fr: 'Paramètres de la boutique'
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
      name: 'categoryOrder',
      type: 'array',
      label: {
        en: 'Category Order',
        ru: 'Порядок категорий',
        de: 'Kategorien-Reihenfolge',
        fr: 'Ordre des catégories'
      },
      labels: {
        singular: { en: 'Category', ru: 'Категория', de: 'Kategorie', fr: 'Catégorie' },
        plural: { en: 'Categories', ru: 'Категории', de: 'Kategorien', fr: 'Catégories' }
      },
      fields: [
        {
          name: 'category',
          type: 'relationship',
          label: { en: 'Category', ru: 'Категория', de: 'Kategorie', fr: 'Catégorie' },
          relationTo: 'categories',
          required: true
        },
        {
          name: 'highlightedProducts',
          type: 'relationship',
          relationTo: 'products',
          hasMany: true,
          label: {
            en: 'Highlighted Products',
            ru: 'Выделенные товары',
            de: 'Hervorgehobene Produkte',
            fr: 'Produits mis en avant'
          },
          filterOptions: ({ siblingData }: any) => {
            return {
              categories: {
                equals: siblingData?.category
              }
            }
          },
          admin: {
            condition: data => Boolean(data?.showHighlightedProducts),
            description: {
              en: 'Select products to display for this category. If empty, standard logic applies.',
              ru: 'Выберите товары для этой категории. Если не выбрано, действует стандартная логика.',
              de: 'Produkte für diese Kategorie auswählen. Wenn leer, gilt Standardlogik.',
              fr: 'Sélectionnez des produits pour cette catégorie. Si vide, la logique standard s’applique.'
            }
          }
        }
      ]
    },
    {
      name: 'isSearchable',
      type: 'checkbox',
      label: {
        en: 'Site is searchable (indexing allowed)',
        ru: 'Сайт доступен для поиска (индексация разрешена)',
        de: 'Website durchsuchbar (Indexierung erlaubt)',
        fr: 'Site indexable (indexation autorisée)'
      },
      defaultValue: true
    },
    {
      name: 'headHtml',
      type: 'textarea',
      label: {
        en: 'Additional HTML for <head>',
        ru: 'Дополнительный HTML код в <head>',
        de: 'Zusätzliches HTML für <head>',
        fr: 'HTML supplémentaire pour <head>'
      },
      admin: {
        description: {
          en: 'E.g. meta tags, analytics scripts',
          ru: 'Например, метатеги, счетчики аналитики',
          de: 'Z. B. Meta-Tags, Analyse-Skripte',
          fr: 'Ex. balises meta, scripts analytiques'
        }
      }
    },
    {
      name: 'showHighlightedProducts',
      type: 'checkbox',
      label: {
        en: 'Highlighted Products for categories',
        ru: 'Выделенные товары для категорий',
        de: 'Hervorgehobene Produkte für Kategorien',
        fr: 'Produits mis en avant pour les catégories'
      },
      defaultValue: false
    },
    {
      name: 'favicon',
      type: 'upload',
      relationTo: 'media',
      label: { en: 'Favicon', ru: 'Фавикон (Favicon)', de: 'Favicon', fr: 'Favicon' },
      admin: {
        description: {
          en: 'Upload a favicon (.ico, .png, .svg) for the website. Recommended size: 32x32px or 64x64px.',
          ru: 'Загрузите фавикон (.ico, .png, .svg). Рекомендуемый размер: 32x32px или 64x64px.',
          de: 'Favicon (.ico, .png, .svg) hochladen. Empfohlene Größe: 32x32px oder 64x64px.',
          fr: 'Téléchargez un favicon (.ico, .png, .svg). Taille recommandée: 32x32px ou 64x64px.'
        }
      }
    },
    {
      name: 'phone',
      type: 'text',
      label: { en: 'Phone', ru: 'Телефон', de: 'Telefon', fr: 'Téléphone' },
      localized: true
    },
    {
      name: 'email',
      type: 'text',
      label: { en: 'Contact Email', ru: 'Контактный Email', de: 'Kontakt-E-Mail', fr: 'E-mail de contact' },
      localized: true
    }
  ]
}
