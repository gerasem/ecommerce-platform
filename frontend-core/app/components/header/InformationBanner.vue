<script setup lang="ts">
import { sanitizeSvg } from '@/utils/svg'

const { data: bannerData } = await useAsyncData('payload-info-banner', () =>
  usePayloadInformationBanner()
)

const isDesktop = useIsDesktop()
</script>

<template>
  <div v-if="bannerData?.items?.length" class="bg-primary-50 overflow-hidden">
    <div class="container mx-auto px-4 py-2">
      <!-- Desktop version -->
      <div class="hidden md:flex items-center justify-center gap-12 text-sm text-gray-500">
        <div
          v-for="(item, index) in bannerData.items"
          :key="item.id || index"
          class="flex items-center gap-2"
        >
          <div
            v-if="item.icon?.svgContent"
            class="w-4 h-4 shrink-0"
            v-html="sanitizeSvg(item.icon.svgContent)"
          />
          <span>{{ item.text }}</span>
        </div>
      </div>

      <!-- Mobile version (Carousel) -->
      <div class="md:hidden h-6 text-xs text-gray-500 flex justify-center text-center">
        <LazyHeaderInformationBannerMobileSwiper
          v-if="bannerData.items.length > 1 && !isDesktop"
          :items="bannerData.items"
        />
        <div v-else class="flex items-center justify-center gap-2 px-4 h-full min-w-0">
          <div
            v-if="bannerData.items[0]?.icon?.svgContent"
            class="w-4 h-4 shrink-0"
            v-html="sanitizeSvg(bannerData.items[0].icon.svgContent)"
          />
          <span class="truncate">{{ bannerData.items[0]?.text }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
