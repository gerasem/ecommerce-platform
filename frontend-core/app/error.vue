<script setup lang="ts">
import { de } from '@nuxt/ui/locale'
import type { NuxtError } from '#app'

defineProps({
  error: Object as () => NuxtError
})

const { t, locale } = useI18n()
const config = useRuntimeConfig()

// Re-use dynamic favicon logic from app.vue for consistency (optional for error page,
// but good if we want the exact same head)
const { data: shopSettings } = await useAsyncData('error-shop-settings', () => useShopSettings())

const faviconUrl = computed(() => {
  const mediaObj = shopSettings.value?.favicon
  if (mediaObj && 'url' in mediaObj && mediaObj.url) {
    const url = mediaObj.url
    return url.startsWith('http') ? url : `${config.public.payloadUrl}${url}`
  }
  return '/favicon.ico'
})

useHead({
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
  link: [{ rel: 'icon', href: faviconUrl }],
  htmlAttrs: {
    lang: locale
  }
})

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <UApp :locale="de">
    <NuxtLoadingIndicator color="var(--color-secondary)" />
    <Header />

    <PageBar />

    <UMain>
      <!-- Centralized Error State mimicking Empty Cart -->
      <BaseContainer class="py-24 text-center">
        <BaseHeader>
          {{ error?.statusCode || 500 }}
        </BaseHeader>

        <p class="mb-8 text-lg text-gray-600">
          {{
            error?.statusCode === 404
              ? t('Page not found')
              : error?.message || t('An error occurred')
          }}
        </p>

        <UButton color="primary" size="lg" @click="handleError">
          {{ t('Return Home') }}
        </UButton>
      </BaseContainer>
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
