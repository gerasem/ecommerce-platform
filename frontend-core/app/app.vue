<script setup lang="ts">
import { useCartStore } from './stores/useCartStore'
import { useFavoritesStore } from './stores/useFavoritesStore'

import { de, en, fr, ru } from '@nuxt/ui/locale'

// Initialize persisted client stores without blocking hydration
onMounted(() => {
  const cartStore = useCartStore()
  const favoritesStore = useFavoritesStore()

  void Promise.all([cartStore.init(), favoritesStore.init()])
})

const { locale } = useI18n()

const nuxtUiLocales = { de, en, fr, ru } as const
const nuxtUiLocale = computed(() => nuxtUiLocales[locale.value as keyof typeof nuxtUiLocales] ?? ru)

const toaster = { position: 'bottom-center' as const, expand: false, progress: false }

const config = useRuntimeConfig()

// Only currency-converting projects need exchange rates. Natural-currency
// shops should not make this request or inherit the conversion behavior.
if (config.public.pricingMode === 'rub') {
  await useAsyncData('exchange-rate-init', () => useExchangeRate())
}

// Fetch global shop settings for SEO fields and favicon
const { data: shopSettings } = await useAsyncData('shop-settings-app', () => useShopSettings())

const faviconUrl = computed(() => {
  const mediaObj = shopSettings.value?.favicon
  if (mediaObj && 'url' in mediaObj && mediaObj.url) {
    const url = mediaObj.url
    return url.startsWith('http') ? url : `${config.public.payloadUrl}${url}`
  }
  return '/favicon.ico' // Fallback to local default
})

type HeadAttribute = Record<string, string | boolean>

const headConfig = computed(() => {
  const config: {
    meta: HeadAttribute[]
    link: HeadAttribute[]
    htmlAttrs: { lang: string }
    script: HeadAttribute[]
  } = {
    meta: [
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'default' }
    ],
    link: [
      { rel: 'icon', href: faviconUrl.value },
      { rel: 'apple-touch-icon', href: faviconUrl.value },
      { rel: 'apple-touch-icon', sizes: '180x180', href: faviconUrl.value }
    ],
    htmlAttrs: {
      lang: locale.value
    },
    script: []
  }

  // Handle SEO indexing
  const isSearchable = shopSettings.value?.isSearchable ?? true
  if (!isSearchable) {
    config.meta.push({ name: 'robots', content: 'noindex, nofollow' })
  }

  // Handle custom HTML injections (meta and scripts)
  const headHtml = shopSettings.value?.headHtml
  if (headHtml) {
    const metaRegex = /<meta\s+([^>]+)>/gi
    let match
    while ((match = metaRegex.exec(headHtml)) !== null) {
      const attrsString = match[1] ?? ''
      const attrs: HeadAttribute = {}
      const attrRegex = /(\w+)(?:=["']([^"']*)["'])?/g
      let attrMatch
      while ((attrMatch = attrRegex.exec(attrsString)) !== null) {
        const attributeName = attrMatch[1]
        if (attributeName) {
          attrs[attributeName] = attrMatch[2] !== undefined ? attrMatch[2] : true
        }
      }
      config.meta.push(attrs)
    }

    const scriptRegex = /<script([^>]*)>([\s\S]*?)<\/script>/gi
    while ((match = scriptRegex.exec(headHtml)) !== null) {
      const attrsString = match[1] ?? ''
      const content = match[2]
      const attrs: HeadAttribute = {}
      const attrRegex = /(\w+)(?:=["']([^"']*)["'])?/g
      let attrMatch
      while ((attrMatch = attrRegex.exec(attrsString)) !== null) {
        const attributeName = attrMatch[1]
        if (attributeName) {
          attrs[attributeName] = attrMatch[2] !== undefined ? attrMatch[2] : true
        }
      }
      if (content) attrs.innerHTML = content
      config.script.push(attrs)
    }
  }

  return config
})

useHead(headConfig)

// === SEO JSON-LD Markup ===
const { injectSchema } = useJsonLd()

const storeName = config.public.siteName || 'NuxtShop Demo'
const siteUrl = useRequestURL().origin

// WebSite Schema
injectSchema(() => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: storeName,
  url: siteUrl,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${siteUrl}/all-items?q={search_term_string}`,
    'query-input': 'required name=search_term_string'
  }
}))

// Organization Schema
injectSchema(() => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: storeName,
  url: siteUrl,
  logo: faviconUrl.value !== '/favicon.ico' ? faviconUrl.value : undefined
}))
</script>

<template>
  <UApp :locale="nuxtUiLocale" :toaster="toaster">
    <NuxtLoadingIndicator color="var(--color-secondary)" />
    <Header />

    <!-- Page bar - shown on all pages below header -->
    <PageBar />

    <UMain>
      <NuxtPage />
    </UMain>

    <Footer />

    <!-- GDPR Cookie Banner -->
    <ClientOnly>
      <CookieConsentNotice />
    </ClientOnly>
  </UApp>
</template>

<style>
/* Page transition animations */
.page-enter-active,
.page-leave-active {
  transition: all 0.2s ease-in-out;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
