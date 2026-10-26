<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'

defineProps<{
  images: Array<{
    id: number
    url?: string
    thumbnailURL?: string
    alt?: string
    width?: number
    height?: number
  }>
}>()
</script>

<template>
  <div class="-mx-4 min-w-0">
    <ClientOnly>
      <swiper
        :slides-per-view="1.4"
        :space-between="16"
        :slides-offset-before="16"
        :slides-offset-after="16"
      >
        <swiper-slide v-for="(image, index) in images" :key="image.id">
          <a
            :href="usePayloadImageUrl(image.url)"
            :data-pswp-width="image.width"
            :data-pswp-height="image.height"
            target="_blank"
            rel="noreferrer"
            class="block w-full aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-zoom-in"
          >
            <img
              :src="usePayloadImageUrl(image.url)"
              :alt="image.alt || `Product image ${index + 1}`"
              :width="image.width"
              :height="image.height"
              loading="lazy"
              class="w-full h-full object-cover"
            />
          </a>
        </swiper-slide>
      </swiper>
    </ClientOnly>
  </div>
</template>
