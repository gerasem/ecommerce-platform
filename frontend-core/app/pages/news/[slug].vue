<script setup lang="ts">
import { usePayloadNewsBySlug } from '@/composables/usePayloadNewsBySlug'

const route = useRoute()
const slug = computed(() => route.params.slug as string)

// Fetch news data with SSR
const { data: newsItem } = await useAsyncData(`news-${slug.value}`, () =>
  usePayloadNewsBySlug(slug.value)
)

// Handle news not found
if (!newsItem.value) {
  throw createError({
    statusCode: 404,
    statusMessage: `Page not found: /news/${slug.value}`,
    fatal: true
  })
}

const { locale } = useI18n()

const imageUrl = computed(() => {
  const img = newsItem.value?.image
  if (!img) return ''
  return usePayloadImageUrl(img.url || img.thumbnailURL || '')
})

const publishedDate = computed(() => {
  if (!newsItem.value?.publishedOn) return ''
  const date = new Date(newsItem.value.publishedOn)
  return new Intl.DateTimeFormat(locale.value, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
})
</script>

<template>
  <BaseContainer v-if="newsItem">
    <div class="py-8">
      <span class="block text-sm text-gray-500 mb-2">{{ publishedDate }}</span>
      <h1 class="text-3xl sm:text-4xl font-bold mb-6">
        {{ newsItem.title }}
      </h1>

      <div v-if="imageUrl" class="mb-8">
        <img
          :src="imageUrl"
          :alt="newsItem.image?.alt || newsItem.title || ''"
          class="w-full h-auto rounded-lg object-cover max-h-[500px]"
        />
      </div>

      <div class="prose prose-lg max-w-none prose-img:rounded-xl">
        <ContentRichText v-if="newsItem.content" :text="richTextToHTML(newsItem.content)" />
      </div>
    </div>
  </BaseContainer>
</template>
