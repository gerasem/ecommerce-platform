import { fileURLToPath } from 'node:url'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/hints',
    '@nuxt/scripts',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    '@dargmuesli/nuxt-cookie-control',
    '@nuxtjs/sitemap'
  ],
  imports: {
    dirs: [fileURLToPath(new URL('./app/stores', import.meta.url))]
  },

  devtools: {
    enabled: process.env.NODE_ENV !== 'production'
  },

  app: {
    pageTransition: { name: 'page', mode: 'out-in' }
  },
  css: [
    fileURLToPath(new URL('./app/assets/css/base.css', import.meta.url)),
    '~/assets/css/main.css'
  ],

  site: {
    url: process.env.NUXT_SITE_URL || process.env.SITE_URL || 'http://localhost:3001'
  },
  ui: {
    colorMode: false
  },

  runtimeConfig: {
    // Server-only: used in server routes (contact.post.ts, etc.)
    // NUXT_PAYLOAD_URL is the canonical runtime variable. The older names are
    // retained as local-development fallbacks.
    payloadUrl:
      process.env.NUXT_PAYLOAD_URL ||
      process.env.PAYLOAD_PRIVATE_URL ||
      process.env.PAYLOAD_URL ||
      'http://localhost:3000',
    payloadApiKey: process.env.NUXT_PAYLOAD_API_KEY || process.env.PAYLOAD_API_KEY || '',
    public: {
      siteName: process.env.NUXT_PUBLIC_SITE_NAME || 'NuxtShop Demo',
      payloadUrl:
        process.env.NUXT_PUBLIC_PAYLOAD_URL || process.env.PAYLOAD_URL || 'http://localhost:3000',
      recaptchaSiteKey: process.env.NUXT_PUBLIC_RECAPTCHA_SITE_KEY || '',
      yandexCaptchaSiteKey: process.env.NUXT_PUBLIC_YANDEX_CAPTCHA_SITE_KEY || '',
      captchaProvider: process.env.NUXT_PUBLIC_CAPTCHA_PROVIDER || 'google',
      stripeKey: process.env.NUXT_PUBLIC_STRIPE_KEY || '',
      enableCoupons: process.env.NUXT_PUBLIC_ENABLE_COUPONS === 'true',
      enableNews: process.env.NUXT_PUBLIC_ENABLE_NEWS === 'true',
      enableReferrals: process.env.NUXT_PUBLIC_ENABLE_REFERRALS === 'true',
      enableStripe: process.env.NUXT_PUBLIC_ENABLE_STRIPE === 'true',
      paymentProvider:
        process.env.NUXT_PUBLIC_PAYMENT_PROVIDER ||
        (process.env.NUXT_PUBLIC_ENABLE_STRIPE === 'true' ? 'stripe' : 'none'),
      pricingMode: process.env.NUXT_PUBLIC_PRICING_MODE || 'natural',
      cookieBannerStyle: process.env.NUXT_PUBLIC_COOKIE_BANNER_STYLE || 'eu',
      enableRelatedProducts: process.env.NUXT_PUBLIC_ENABLE_RELATED_PRODUCTS !== 'false',
      googleAnalyticsId: '',
      enabledLocales: []
    }
  },

  routeRules: {
    '/payment/**': { ssr: false }
  },
  devServer: {
    port: 3001
  },

  compatibilityDate: '2025-01-15',

  nitro: {
    devStorage: {
      cache: {
        driver: 'memory'
      }
    }
  },

  vite: {
    optimizeDeps: {
      include: ['swiper/modules', 'swiper/vue']
    }
  },

  cookieControl: {
    isCssEnabled: false,
    cookieExpiryOffsetMs: 1000 * 60 * 60 * 24 * 365, // one year
    isControlButtonEnabled: false, // hide the floating cookie icon — we use custom #bar slot only
    cookies: {
      necessary: [
        {
          id: 'necessary',
          name: {
            en: 'Strictly necessary cookies',
            de: 'Technisch notwendige Cookies',
            ru: 'Технически необходимые файлы cookie'
          }
        }
      ],
      optional: [
        {
          id: 'analytics',
          name: {
            en: 'Analytics cookies',
            de: 'Analyse-Cookies',
            ru: 'Аналитические файлы cookie'
          }
        }
      ]
    },
    locales: ['en', 'de', 'ru']
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  i18n: {
    locales: [
      { code: 'en', file: 'en.json', name: 'En' },
      { code: 'de', file: 'de.json', name: 'De' },
      { code: 'ru', file: 'ru.json', name: 'Ru' }
    ],
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    langDir: 'locales'
  },
  icon: {
    serverBundle: {
      collections: ['bi']
    }
  },
  pinia: {
    storesDirs: [fileURLToPath(new URL('./app/stores/**', import.meta.url))]
  },

  sitemap: {
    sources: ['/api/sitemap-routes'],
    exclude: ['/auth/**', '/warenkorb', '/checkout', '/payment', '/cabinet/**']
  }
})
