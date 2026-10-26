<script setup lang="ts">
import type { ConversionBoxesBlock } from '@/generated/graphql'

defineProps<{
  boxes?: ConversionBoxesBlock['boxes']
}>()
</script>

<template>
  <div v-if="boxes && boxes.length > 0" class="my-12">
    <div class="grid gap-6 md:grid-cols-2">
      <div
        v-for="(box, index) in boxes"
        :key="box.id || index"
        class="bg-gray-50 flex h-full rounded-2xl overflow-hidden"
      >
        <!-- Image Section (Left) -->
        <div class="w-1/4 sm:w-5/12 relative">
          <img
            v-if="box.image"
            :src="usePayloadImageUrl(box.image.url)"
            :alt="box.image.alt || ''"
            class="w-full h-full object-cover"
          />
        </div>

        <!-- Content Section (Right) -->
        <div class="w-3/4 sm:w-7/12 p-4 sm:p-6 flex flex-col justify-center content-section">
          <ContentRichText v-if="box.content" :text="richTextToHTML(box.content)" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.content-section :deep(h1),
.content-section :deep(h2),
.content-section :deep(h3),
.content-section :deep(h4),
.content-section :deep(h5),
.content-section :deep(h6) {
  font-size: 1.25rem;
  line-height: 1.75rem;
  font-family: 'Kurale', serif;
  margin-bottom: 0.5rem;
}

@media (min-width: 640px) {
  .content-section :deep(h1),
  .content-section :deep(h2),
  .content-section :deep(h3),
  .content-section :deep(h4),
  .content-section :deep(h5),
  .content-section :deep(h6) {
    font-size: 1.875rem;
    line-height: 2.25rem;
  }
}
</style>
