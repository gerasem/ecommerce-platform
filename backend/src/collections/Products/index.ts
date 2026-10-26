import { slugField } from '@/fields/slug'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import { CollectionOverride } from '@payloadcms/plugin-ecommerce/types'
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField
} from '@payloadcms/plugin-seo/fields'
import {
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor
} from '@payloadcms/richtext-lexical'
import { DefaultDocumentIDType, Where, Field } from 'payload'
import { features } from '@/lib/features'

const modifyPricingFields = (fields: Field[]): Field[] => {
  return fields
    .map(field => {
      let modifiedField = { ...field }

      // Hide ecommerce inventory and set default to null based on ENV
      if ('name' in modifiedField && modifiedField.name === 'inventory') {
        const enableInventory = features.enableInventory
        modifiedField = {
          ...modifiedField,
          defaultValue: null as any,
          admin: {
            ...modifiedField.admin,
            hidden: !enableInventory
          }
        } as any
      }

      // Hide enableVariants based on ENV
      if ('name' in modifiedField && modifiedField.name === 'enableVariants') {
        const enableVariants = features.enableVariants
        modifiedField = {
          ...modifiedField,
          admin: {
            ...modifiedField.admin,
            hidden: !enableVariants
          },
          defaultValue: !enableVariants ? false : undefined
        } as any
      }

      // Hide the variants array based on ENV
      if ('name' in modifiedField && modifiedField.name === 'variants') {
        const enableVariants = features.enableVariants
        modifiedField = {
          ...modifiedField,
          admin: {
            ...modifiedField.admin,
            hidden: !enableVariants
          }
        } as any
      }

      if ('name' in modifiedField && modifiedField.name === 'priceInEUR') {
        modifiedField = {
          ...modifiedField,
          admin: {
            condition: (data: any) => data?.baseCurrency === 'EUR' || !data?.baseCurrency,
            description: {
              en: 'Store the normal EUR amount (for example, 49.99 — not 4999).',
              ru: 'Укажите стандартную сумму в EUR (например, 49.99 — не 4999).',
              de: 'Geben Sie den Standard-EUR-Betrag an (z. B. 49.99 — nicht 4999).',
              fr: 'Indiquez le montant normal en EUR (par exemple 49.99 — pas 4999).'
            },
            step: 0.01
          },
          required: false
        } as any
      }

      if ('name' in modifiedField && modifiedField.name === 'priceInUSD') {
        modifiedField = {
          ...modifiedField,
          admin: {
            condition: (data: any) => data?.baseCurrency === 'USD',
            description: {
              en: 'Store the normal USD amount (for example, 49.99 — not 4999).',
              ru: 'Укажите стандартную сумму в USD (например, 49.99 — не 4999).',
              de: 'Geben Sie den Standard-USD-Betrag an (z. B. 49.99 — nicht 4999).',
              fr: 'Indiquez le montant normal en USD (par exemple 49.99 — pas 4999).'
            },
            step: 0.01
          },
          required: false
        } as any
      }

      // Hide the enabled toggles so plugin hooks don't wipe the prices, but keep them in schema
      if (
        'name' in modifiedField &&
        (modifiedField.name === 'priceInEUREnabled' || modifiedField.name === 'priceInUSDEnabled')
      ) {
        modifiedField = {
          ...modifiedField,
          admin: {
            ...modifiedField.admin,
            hidden: true
          },
          defaultValue: true
        } as any
      }

      if ('fields' in modifiedField) {
        modifiedField.fields = modifyPricingFields(modifiedField.fields)
      }

      if ('tabs' in modifiedField) {
        modifiedField.tabs = modifiedField.tabs.map(tab => ({
          ...tab,
          fields: modifyPricingFields(tab.fields)
        }))
      }

      return modifiedField
    })
    .filter(field => {
      // Remove unwanted fields completely
      if ('name' in field && (field.name === 'priceInRUB' || field.name === 'priceInRUBEnabled')) {
        return false
      }

      // Remove layout fields (group, row, collapsibles) if they became empty
      if ('fields' in field && field.fields.length === 0) {
        return false
      }

      return true
    })
}

export const ProductsCollection: CollectionOverride = ({ defaultCollection }) => {
  const modifiedFields = modifyPricingFields(defaultCollection.fields)

  return {
    ...defaultCollection,
    admin: {
      ...defaultCollection?.admin,
      group: { en: 'eCommerce', ru: 'Коммерция', de: 'E-Commerce', fr: 'E-commerce' },
      defaultColumns: ['title', 'enableVariants', '_status', 'variants.variants'],
      livePreview: {
        url: ({ data, req }) =>
          generatePreviewPath({
            slug: data?.slug,
            collection: 'products',
            req
          })
      },
      preview: (data, { req }) =>
        generatePreviewPath({
          slug: data?.slug as string,
          collection: 'products',
          req
        }),
      useAsTitle: 'title'
    },
    defaultPopulate: {
      ...defaultCollection?.defaultPopulate,
      title: true,
      slug: true,
      variantOptions: true,
      variants: true,
      enableVariants: true,
      gallery: true,
      priceInEUR: true,
      priceInUSD: true,
      baseCurrency: true,
      inventory: true,
      meta: true
    },
    fields: [
      {
        name: 'baseCurrency',
        type: 'select',
        label: {
          en: 'Base Currency',
          ru: 'Базовая валюта',
          de: 'Basiswährung',
          fr: 'Devise de base'
        },
        options: [
          {
            label: {
              en: 'Euro (EUR)',
              ru: 'Евро (EUR)',
              de: 'Euro (EUR)',
              fr: 'Euro (EUR)'
            },
            value: 'EUR'
          },
          {
            label: {
              en: 'US Dollar (USD)',
              ru: 'Доллар США (USD)',
              de: 'US-Dollar (USD)',
              fr: 'Dollar américain (USD)'
            },
            value: 'USD'
          }
        ],
        defaultValue: 'EUR',
        admin: {
          position: 'sidebar'
        }
      },
      {
        name: 'title',
        type: 'text',
        label: { en: 'Title', ru: 'Название', de: 'Titel', fr: 'Titre' },
        required: true,
        localized: true
      },
      {
        type: 'tabs',
        tabs: [
          {
            label: { en: 'Content', ru: 'Контент', de: 'Inhalt', fr: 'Contenu' },
            fields: [
              {
                name: 'description',
                type: 'richText',
                editor: lexicalEditor({
                  features: ({ defaultFeatures }) => {
                    const featuresWithoutHeading = defaultFeatures.filter(f => f.key !== 'heading')
                    return [
                      ...featuresWithoutHeading,
                      HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                      FixedToolbarFeature()
                    ]
                  }
                }),
                label: {
                  en: 'Description',
                  ru: 'Описание',
                  de: 'Beschreibung',
                  fr: 'Description'
                },
                required: false,
                localized: true
              },
              {
                name: 'gallery',
                type: 'upload',
                relationTo: 'media',
                hasMany: true,
                required: false,
                label: { en: 'Gallery', ru: 'Галерея', de: 'Galerie', fr: 'Galerie' },
                admin: {
                  description: {
                    en: 'Upload multiple gallery images',
                    ru: 'Загрузите несколько изображений для галереи',
                    de: 'Laden Sie mehrere Galeriebilder hoch',
                    fr: 'Téléchargez plusieurs images pour la galerie'
                  }
                }
              }
            ]
          },
          {
            label: {
              en: 'Product Details',
              ru: 'Детали товара',
              de: 'Produktdetails',
              fr: 'Détails du produit'
            },
            fields: [
              ...modifiedFields,
              {
                name: 'relatedProducts',
                type: 'relationship',
                label: {
                  en: 'Related Products',
                  ru: 'Сопутствующие товары',
                  de: 'Ähnliche Produkte',
                  fr: 'Produits associés'
                },
                admin: {
                  hidden: !features.enableRelatedProducts
                },
                filterOptions: ({ id }) => {
                  if (id) {
                    return {
                      id: {
                        not_in: [id]
                      }
                    }
                  }

                  // ID comes back as undefined during seeding so we need to handle that case
                  return {
                    id: {
                      exists: true
                    }
                  }
                },
                hasMany: true,
                relationTo: 'products'
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
      {
        name: 'categories',
        type: 'relationship',
        label: { en: 'Category', ru: 'Категория', de: 'Kategorie', fr: 'Catégorie' },
        admin: {
          position: 'sidebar',
          sortOptions: 'title'
        },
        hasMany: false,
        relationTo: 'categories'
      },
      {
        name: 'isPopular',
        label: {
          en: 'Popular Product',
          ru: 'Популярный товар',
          de: 'Beliebtes Produkt',
          fr: 'Produit populaire'
        },
        type: 'checkbox',
        defaultValue: false,
        admin: {
          position: 'sidebar',
          description: {
            en: 'Check this to display the product in the popular products section',
            ru: 'Отметьте, чтобы отображать товар в блоке популярных товаров',
            de: 'Aktivieren, um das Produkt im Bereich beliebte Produkte anzuzeigen',
            fr: 'Cochez pour afficher le produit dans la section des produits populaires'
          }
        }
      },
      slugField()
    ]
  }
}
