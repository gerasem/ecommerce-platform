// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import sharp from 'sharp'
import { ru } from '@payloadcms/translations/languages/ru'
import { en } from '@payloadcms/translations/languages/en'
import { de } from '@payloadcms/translations/languages/de'
import { fr } from '@payloadcms/translations/languages/fr'

import {
  BoldFeature,
  EXPERIMENTAL_TableFeature,
  IndentFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  UnderlineFeature,
  UnorderedListFeature,
  lexicalEditor,
  ParagraphFeature,
  HeadingFeature,
  FixedToolbarFeature
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from '@/collections/Categories'
import { Media } from '@/collections/Media'
import { SvgMedia } from '@/collections/SvgMedia'
import { Pages } from '@/collections/Pages'
import { Users } from '@/collections/Users'
import { Footer } from '@/globals/Footer'
import { Header } from '@/globals/Header'
import { plugins } from './plugins'
import { InformationBanner } from '@/globals/InformationBanner'
import { ShopSettings } from '@/globals/ShopSettings'
import { ShippingSettings } from '@/globals/ShippingSettings'
import { ExchangeRate } from '@/globals/ExchangeRate'
import { Coupons } from '@/collections/Coupons'
import { Referrals } from '@/collections/Referrals'
import { News } from '@/collections/News/index'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

import { createOrderNoStripe } from './endpoints/createOrderNoStripe'

import { updateExchangeRate } from './endpoints/updateExchangeRate'
import { contactForm } from './endpoints/contactForm'
import { registerUser } from './endpoints/registerUser'

export default buildConfig({
  serverURL:
    process.env.NEXT_PUBLIC_SERVER_URL ||
    process.env.PAYLOAD_PUBLIC_SERVER_URL ||
    'http://localhost:3000',
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeLogin` statement on line 15.
      beforeLogin: ['@/components/BeforeLogin#BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeDashboard` statement on line 15.
      beforeDashboard: ['@/components/BeforeDashboard#BeforeDashboard'],
      actions: [
        ...(process.env.FRONTEND_DEPLOY_HOOK_URL ? ['@/components/DeployButton#DeployButton'] : []),
        '@/components/BackupButton#BackupButton'
      ]
    },
    user: Users.slug
  },
  collections: [Users, Pages, Categories, Media, SvgMedia, Coupons, Referrals, News],
  db: postgresAdapter({
    push: process.env.NODE_ENV !== 'production', // Disable push schema in production to rely on migrations
    pool: {
      connectionString: process.env.DATABASE_URI || '',
      // On Vercel set DATABASE_POOL_SIZE=2 to avoid serverless connection limits.
      // Locally we use a higher default so operations like media delete don't time out.
      max: process.env.DATABASE_POOL_SIZE ? parseInt(process.env.DATABASE_POOL_SIZE) : 10,
      idleTimeoutMillis: 10000, // 10 seconds (default was 0/infinite)
      connectionTimeoutMillis: 15000 // 15 seconds — room for ecommerce plugin hooks with remote Supabase
    }
  }),
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => {
      const defaultFeaturesFiltered = defaultFeatures.filter(
        feature =>
          feature.key !== 'link' && feature.key !== 'paragraph' && feature.key !== 'heading'
      )

      return [
        ...defaultFeaturesFiltered,
        FixedToolbarFeature(),
        ParagraphFeature(),
        HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }),
        LinkFeature({
          enabledCollections: ['pages'],
          fields: ({ defaultFields }) => {
            const defaultFieldsWithoutUrl = defaultFields.filter(field => {
              if ('name' in field && field.name === 'url') return false
              return true
            })

            return [
              ...defaultFieldsWithoutUrl,
              {
                name: 'url',
                type: 'text',
                admin: {
                  condition: (_data, siblingData) => siblingData?.linkType !== 'internal'
                },
                label: {
                  en: 'Enter URL',
                  ru: 'Введите URL',
                  de: 'URL eingeben',
                  fr: "Entrez l'URL"
                },
                required: true
              }
            ]
          }
        }),
        EXPERIMENTAL_TableFeature()
      ]
    }
  }),
  email: nodemailerAdapter({
    defaultFromAddress: process.env.SMTP_FROM_ADDRESS || 'info@payload-vue-shop.local',
    defaultFromName: process.env.SMTP_FROM_NAME || 'Payload Shop',
    // If SMTP_HOST is provided, configure SMTP. Otherwise, Payload will log emails to console (mock).
    ...(process.env.SMTP_HOST
      ? {
          transportOptions: {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
            secure: process.env.SMTP_PORT === '465',
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS
            }
          }
        }
      : {
          transportOptions: {
            streamTransport: true
          }
        })
  }),
  endpoints: [createOrderNoStripe, updateExchangeRate, contactForm, registerUser],
  globals: [Header, Footer, InformationBanner, ShopSettings, ShippingSettings, ExchangeRate],
  i18n: {
    supportedLanguages: { en, de, fr, ru },
    translations: {
      en: {
        'plugin-ecommerce:products': 'Products',
        'plugin-ecommerce:product': 'Product',
        'plugin-ecommerce:orders': 'Orders',
        'plugin-ecommerce:order': 'Order',
        'plugin-form-builder:forms': 'Forms',
        'plugin-form-builder:form': 'Form',
        'plugin-form-builder:form-submissions': 'Form Submissions',
        'plugin-form-builder:form-submission': 'Form Submission'
      },
      de: {
        'plugin-ecommerce:products': 'Produkte',
        'plugin-ecommerce:product': 'Produkt',
        'plugin-ecommerce:orders': 'Bestellungen',
        'plugin-ecommerce:order': 'Bestellung',
        'plugin-form-builder:forms': 'Formulare',
        'plugin-form-builder:form': 'Formular',
        'plugin-form-builder:form-submissions': 'Einsendungen',
        'plugin-form-builder:form-submission': 'Einsendung'
      },
      fr: {
        'plugin-ecommerce:products': 'Produits',
        'plugin-ecommerce:product': 'Produit',
        'plugin-ecommerce:orders': 'Commandes',
        'plugin-ecommerce:order': 'Commande',
        'plugin-form-builder:forms': 'Formulaires',
        'plugin-form-builder:form': 'Formulaire',
        'plugin-form-builder:form-submissions': 'Soumissions',
        'plugin-form-builder:form-submission': 'Soumission'
      },
      ru: {
        'plugin-ecommerce:products': 'Товары',
        'plugin-ecommerce:product': 'Товар',
        'plugin-ecommerce:orders': 'Заказы',
        'plugin-ecommerce:order': 'Заказ',
        'plugin-form-builder:forms': 'Формы',
        'plugin-form-builder:form': 'Форма',
        'plugin-form-builder:form-submissions': 'Заявки',
        'plugin-form-builder:form-submission': 'Заявка'
      }
    }
  },
  plugins: [
    ...plugins
    // storage-adapter-placeholder
  ],
  secret: (() => {
    if (!process.env.PAYLOAD_SECRET) {
      throw new Error('PAYLOAD_SECRET environment variable is required')
    }
    return process.env.PAYLOAD_SECRET
  })(),
  typescript: {
    // A single backend repository serves stores with different locale sets.
    // Generate the shared superset explicitly with `npm run generate:types`.
    autoGenerate: false,
    outputFile: path.resolve(dirname, 'payload-types.ts')
  },
  // Sharp is now an optional dependency -
  // if you want to resize images, crop, set focal point, etc.
  // make sure to install it and pass it to the config.
  sharp,
  localization: {
    locales: process.env.PAYLOAD_LOCALES ? process.env.PAYLOAD_LOCALES.split(',') : ['en', 'de', 'ru'],
    defaultLocale: process.env.PAYLOAD_DEFAULT_LOCALE || 'en',
    fallback: true
  },
  cors: [
    ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : []),
    process.env.NEXT_PUBLIC_SERVER_URL || '',
    process.env.FRONTEND_URL || ''
  ].filter(Boolean),
  csrf: [
    ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : []),
    process.env.NEXT_PUBLIC_SERVER_URL || '',
    process.env.FRONTEND_URL || ''
  ].filter(Boolean),
  graphQL: {
    // Both are true by default, but set explicitly to guarantee playground
    // and introspection are off in production even if NODE_ENV is misconfigured.
    disablePlaygroundInProduction: true,
    disableIntrospectionInProduction: true
  }
})
