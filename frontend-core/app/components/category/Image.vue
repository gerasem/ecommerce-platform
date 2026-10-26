<script setup lang="ts">
import type { ICategory } from '@/types'

const localePath = useLocalePath()

const props = defineProps<{
  category: ICategory
}>()

const imageUrl = computed(() => {
  const image = props.category.image as NonNullable<typeof props.category.image>
  return image?.sizes?.categoryPreview?.url
    ? usePayloadImageUrl(image.sizes.categoryPreview.url)
    : usePayloadImageUrl(image?.url)
})
</script>

<template>
  <NuxtLink
    v-if="category.image"
    :to="localePath(`/category/${category.slug}`)"
    class="block relative aspect-video overflow-hidden group bg-gray-100"
  >
    <img
      :src="imageUrl"
      :alt="category.image?.alt || category.title || ''"
      class="w-full h-full object-cover transition-transform group-hover:scale-105"
    />
  </NuxtLink>
</template>
