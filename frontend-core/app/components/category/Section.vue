<script setup lang="ts">
import type { ICategory, IItem } from '@/types'

const localePath = useLocalePath()
const { t } = useI18n()

defineProps<{
  category: ICategory
  items: IItem[]
}>()

const isDesktop = useIsDesktop()
</script>

<template>
  <section class="mb-8">
    <div class="flex items-center justify-between mb-6 group">
      <h2 class="text-3xl md:text-4xl">
        {{ category.title }}
      </h2>

      <NuxtLink
        :to="localePath(`/category/${category.slug}`)"
        class="hover:text-primary transition-all opacity-0 group-hover:opacity-100 hidden md:block"
      >
        {{ t('View all') }} →
      </NuxtLink>
    </div>

    <!-- Mobile Swiper -->
    <LazyCategoryMobileSwiper v-if="!isDesktop" :items="items" />

    <!-- Desktop Grid -->
    <div v-else class="grid grid-cols-2 xl:grid-cols-4 gap-6">
      <LazyItemCard v-for="item in items" :key="item.id" :item="item" />
    </div>
  </section>
</template>
