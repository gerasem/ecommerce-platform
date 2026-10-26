<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import type { INews } from '@/types'

defineProps<{ news: INews[] }>()
</script>

<template>
  <div class="-mx-4">
    <ClientOnly>
      <swiper
        :slides-per-view="1.2"
        :space-between="16"
        :slides-offset-before="16"
        :slides-offset-after="16"
      >
        <swiper-slide v-for="item in news" :key="item.id">
          <NewsCard :news="item" />
        </swiper-slide>
      </swiper>
    </ClientOnly>
  </div>
</template>
