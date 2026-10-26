<script setup lang="ts">
import { Autoplay } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'

import type { InformationBannerQuery } from '@/generated/graphql'
import { sanitizeSvg } from '@/utils/svg'

type BannerItems = NonNullable<NonNullable<InformationBannerQuery['InformationBanner']>['items']>

defineProps<{
  items: BannerItems
}>()

const modules = [Autoplay]
</script>

<template>
  <Swiper
    :slides-per-view="1"
    :loop="true"
    :autoplay="{ delay: 3000, disableOnInteraction: false }"
    :modules="modules"
    class="w-full h-6"
  >
    <SwiperSlide v-for="(item, index) in items" :key="item.id || index">
      <div class="flex items-center justify-center gap-2 px-4 h-full">
        <div
          v-if="item.icon?.svgContent"
          class="w-4 h-4 shrink-0"
          v-html="sanitizeSvg(item.icon.svgContent)"
        />
        <span class="truncate">{{ item.text }}</span>
      </div>
    </SwiperSlide>
  </Swiper>
</template>
