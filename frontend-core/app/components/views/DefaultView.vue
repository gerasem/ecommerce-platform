<script setup lang="ts">
import type { IPageDocument } from '@/types'

const props = defineProps<{
  pageData: IPageDocument | null
}>()

// Set page SEO metadata
usePayloadPageSeo(computed(() => props.pageData))
</script>

<template>
  <BaseContainer>
    <article v-if="pageData">
      <!-- Page Title -->
      <BaseHeader>{{ pageData.subtitle || pageData.title }}</BaseHeader>

      <!-- Dynamic Page Layout Blocks -->
      <PageBlocks :layout="pageData.layout" />
    </article>
  </BaseContainer>
</template>
