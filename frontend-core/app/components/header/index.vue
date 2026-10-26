<script setup lang="ts">
import { useCartStore } from '../../stores/useCartStore'
import { useFavoritesStore } from '../../stores/useFavoritesStore'

import type { MappedLink } from '@/composables/usePayloadLink'
import { sanitizeSvg } from '@/utils/svg'

const localePath = useLocalePath()

const cartStore = useCartStore()
const favoritesStore = useFavoritesStore()

const { data: headerData } = await useAsyncData('payload-header', usePayloadHeader)

// Map navigation links from Payload
const navigationLinks = computed(
  () =>
    headerData.value?.navItems
      ?.map(item => usePayloadLink(item))
      .filter((link): link is MappedLink => link !== null) || []
)

const navButtons = computed(
  () =>
    headerData.value?.navButtons
      ?.map(item => usePayloadLink(item))
      .filter((link): link is MappedLink => link !== null) || []
)

const pageLinks = computed(() => {
  return (
    headerData.value?.headerPages?.map(page => ({
      label: page.title,
      to: localePath(`/${page.slug}`),
      target: undefined as string | undefined
    })) || []
  )
})

// Combine navigation links and nav buttons for the mobile menu
// UNavigationMenu expects a 2D array for groups
const mobileMenuGroups = computed(() => {
  const allLinks = [...navigationLinks.value, ...navButtons.value].map(link => ({
    label: link.label,
    to: link.href,
    target: link.openInNewTab ? '_blank' : undefined
  }))

  return [pageLinks.value, allLinks]
})

const slogan = computed(() => headerData.value?.slogan)
const logoSvg = computed(() => {
  const content = headerData.value?.icon?.svgContent || ''
  return sanitizeSvg(content)
})
</script>

<template>
  <div class="header-wrapper">
    <HeaderInformationBanner />

    <UHeader
      toggle-side="left"
      mode="slideover"
      :ui="{
        root: 'border-b-0 my-4 bg-white',
        container:
          'max-w-(--ui-container) mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between lg:gap-12',
        left: 'flex items-center min-w-0 lg:flex-1 lg:gap-12',
        center: 'hidden lg:hidden',
        right: 'flex items-center justify-end min-w-0 flex-shrink-0 gap-2 lg:gap-8'
      }"
    >
      <template #left>
        <!-- Logo - centered on mobile, left on desktop -->
        <NuxtLink
          :to="localePath('/')"
          class="flex items-center gap-3 absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 flex-shrink-0"
        >
          <!-- Render inline SVG to allow CSS styling -->
          <div v-if="logoSvg" class="header__logo h-24 flex py-1" v-html="logoSvg" />
        </NuxtLink>

        <!-- Desktop only content -->
        <div class="hidden lg:flex items-center gap-12 min-w-0">
          <!-- Slogan - hidden on tablet and below -->
          <div
            v-if="slogan"
            class="hidden xl:flex flex-col items-baseline gap-0 text-gray-400 text-sm whitespace-nowrap"
            v-html="richTextToHTML(slogan)"
          />

          <!-- Main navigation from Payload -->
          <SmartLink
            v-for="link in navigationLinks"
            :key="link.href"
            :link="link"
            class="hover:text-primary transition-colors whitespace-nowrap"
          />
        </div>
      </template>

      <template #right>
        <!-- Nav buttons - hidden on mobile -->
        <SmartLink
          v-for="button in navButtons"
          :key="button.href"
          :link="button"
          class="hidden lg:block hover:text-primary transition-colors whitespace-nowrap"
        />

        <!-- User, Favorites & Cart icons -->
        <div class="flex items-center">
          <!-- User icon - desktop only -->
          <NuxtLink
            :to="localePath('/cabinet')"
            class="hidden lg:flex items-center transition-all hover:text-secondary text-gray-400"
            aria-label="Account"
          >
            <UIcon name="i-bi-person" class="w-8 h-8" />
          </NuxtLink>

          <!-- Favorites icon - desktop only -->
          <div class="hidden lg:flex items-center justify-center min-w-[32px] ml-3">
            <ClientOnly>
              <template #fallback>
                <UIcon name="i-bi-arrow-repeat" class="w-5 h-5 animate-spin text-gray-400" />
              </template>

              <NuxtLink
                :to="localePath(useSystemPath('favorites'))"
                class="flex items-center gap-1.5 transition hover:text-secondary mr-1.5"
                aria-label="Favorites"
              >
                <UIcon
                  name="i-bi-heart"
                  class="w-7 h-7"
                  :class="(favoritesStore?.count || 0) > 0 ? 'text-secondary' : 'text-gray-400'"
                />
                <span v-if="favoritesStore && favoritesStore.count > 0" class="font-normal">
                  {{ favoritesStore.count }}
                </span>
              </NuxtLink>
            </ClientOnly>
          </div>

          <!-- Cart Icon -->
          <div class="flex items-center justify-center min-w-[32px] ml-3">
            <ClientOnly>
              <template #fallback>
                <UIcon name="i-bi-arrow-repeat" class="w-5 h-5 animate-spin text-gray-400" />
              </template>

              <NuxtLink
                :to="localePath(useSystemPath('cart'))"
                class="flex items-center gap-1.5 transition hover:text-secondary"
                :title="cartStore?.totalFormatted || ''"
                aria-label="Shopping Cart"
                data-test="cart-link"
              >
                <UIcon
                  name="i-bi-bag"
                  class="w-7 h-7 -mt-1"
                  :class="(cartStore?.count || 0) > 0 ? 'text-secondary' : 'text-gray-400'"
                />
                <span
                  v-if="cartStore && cartStore.count > 0"
                  class="font-normal"
                  data-test="cart-count"
                >
                  {{ cartStore.count }}
                </span>
              </NuxtLink>
            </ClientOnly>
          </div>
        </div>
      </template>

      <template #body>
        <div class="space-y-1">
          <!-- Mobile menu with Payload data (combines main links and buttons) -->
          <template v-for="(group, groupIdx) in mobileMenuGroups" :key="groupIdx">
            <NuxtLink
              v-for="link in group"
              :key="link.to"
              :to="link.to"
              :target="link.target"
              :class="[
                'flex items-center gap-3 px-2.5 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors',
                ['Contact', 'Kontakt', 'Контакт'].includes(link.label) ? 'my-4' : ''
              ]"
            >
              <span>{{ link.label }}</span>
            </NuxtLink>
          </template>

          <!-- User & Favorites links for mobile -->
          <NuxtLink
            :to="localePath('/cabinet')"
            class="flex items-center gap-3 px-2.5 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <UIcon name="i-bi-person" class="w-5 h-5 text-gray-400" />
            <span>{{ $t('Account') }}</span>
          </NuxtLink>

          <NuxtLink
            :to="localePath(useSystemPath('favorites'))"
            class="flex items-center gap-3 px-2.5 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <UIcon
              name="i-bi-heart"
              class="w-5 h-5"
              :class="(favoritesStore?.count || 0) > 0 ? 'text-secondary' : 'text-gray-400'"
            />
            <span>{{ $t('Favorites') }}</span>
            <span
              v-if="favoritesStore && favoritesStore.count > 0"
              class="text-sm text-secondary font-medium"
            >
              ({{ favoritesStore.count }})
            </span>
          </NuxtLink>
        </div>
      </template>
    </UHeader>
  </div>
</template>

<style lang="scss">
.header__logo {
  & svg {
    height: 100%;
    width: 100%;
  }
}
</style>
