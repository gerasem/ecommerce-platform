import { fileURLToPath } from 'node:url'

const masterAppDirectory = fileURLToPath(new URL('../frontend-core/app', import.meta.url))

export default defineNuxtConfig({
  extends: ['../frontend-core'],

  runtimeConfig: {
    public: {
      siteName: process.env.NUXT_PUBLIC_SITE_NAME || 'Aura Store',
      paymentProvider: process.env.NUXT_PUBLIC_PAYMENT_PROVIDER || 'kustom',
      pricingMode: process.env.NUXT_PUBLIC_PRICING_MODE || 'natural',
      enabledLocales: ['de', 'en', 'fr']
    }
  },

  alias: {
    '@/types': `${masterAppDirectory}/types`,
    '@/generated': `${masterAppDirectory}/generated`,
    // Theme layer using standard core pricing strategy without overrides.
    '@/utils/price': `${masterAppDirectory}/utils/price`,
    '@/utils/checkoutError': `${masterAppDirectory}/utils/checkoutError`,
    '@/utils/richtext': `${masterAppDirectory}/utils/richtext`,
    '@/utils/svg': `${masterAppDirectory}/utils/svg`,
    '@/composables/usePayloadLink': `${masterAppDirectory}/composables/usePayloadLink`,
    '@/composables/usePayloadNewsBySlug': `${masterAppDirectory}/composables/usePayloadNewsBySlug`
  },

  vite: {
    resolve: {
      dedupe: ['pinia', 'vue']
    },
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
        'isomorphic-dompurify',
        'swiper/modules',
        'swiper/vue'
      ]
    }
  },

  cookieControl: {
    locales: ['de', 'en', 'fr'],
    cookies: {
      necessary: [
        {
          id: 'necessary',
          name: {
            de: 'Technisch notwendige Cookies',
            en: 'Strictly necessary cookies',
            fr: 'Cookies strictement nécessaires'
          }
        }
      ],
      optional: [
        {
          id: 'analytics',
          name: {
            de: 'Analyse-Cookies',
            en: 'Analytics cookies',
            fr: 'Cookies analytiques'
          }
        }
      ]
    }
  },

  i18n: {
    locales: [
      { code: 'de', file: 'de.json', language: 'de-DE', name: 'Deutsch' },
      { code: 'en', file: 'en.json', language: 'en', name: 'English' },
      { code: 'fr', file: 'fr.json', language: 'fr', name: 'Français' }
    ],
    defaultLocale: 'de',
    strategy: 'prefix_except_default',
    langDir: '../../frontend-core/i18n/locales'
  },

  icon: {
    clientBundle: {
      scan: true
    }
  }
})
