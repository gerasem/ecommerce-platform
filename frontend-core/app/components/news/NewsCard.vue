<script setup lang="ts">
import type { News } from '@/generated/graphql'
import { extractLexicalText } from '@/utils/richtext'

const props = defineProps<{
  news: News
}>()

const { locale } = useI18n()
const localePath = useLocalePath()

const imageUrl = computed(() => {
  const img = props.news.image
  if (!img) return ''
  return usePayloadImageUrl(img.thumbnailURL || img.url || '')
})

const publishedDate = computed(() => {
  if (!props.news.publishedOn) return ''
  const date = new Date(props.news.publishedOn)
  return new Intl.DateTimeFormat(locale.value, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
})

const excerpt = computed(() => {
  if (!props.news.content) return ''
  return extractLexicalText(props.news.content, 150)
})
</script>

<template>
  <NuxtLink :to="localePath(`/news/${news.slug}`)" class="group flex flex-col mb-4">
    <div v-if="imageUrl" class="relative mb-4">
      <div class="relative aspect-[16/9] bg-gray-100 overflow-hidden rounded-lg">
        <img
          :src="imageUrl"
          :alt="news.image?.alt || news.title || ''"
          loading="lazy"
          class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
    </div>

    <span class="text-sm text-gray-500 mb-2">{{ publishedDate }}</span>
    <h3 class="text-xl font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
      {{ news.title }}
    </h3>
    <p class="text-gray-600 line-clamp-3 mb-2">
      {{ excerpt }}
    </p>
    <span class="text-primary font-medium group-hover:underline mt-auto pt-2"
      >{{ $t('Read more') }} &rarr;</span
    >
  </NuxtLink>
</template>
