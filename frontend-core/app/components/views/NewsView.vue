<script setup lang="ts">
import type { Page } from '@/generated/graphql'

const props = defineProps<{
  pageData: Page
}>()

// Fetch the 50 latest products
const { data: latestProducts, pending } = await useAsyncData('news-page-products', () =>
  usePayloadLatestProducts(50)
)

usePayloadPageSeo(props.pageData)
</script>

<template>
  <BaseContainer>
    <div class="mb-12">
      <h1 class="text-3xl md:text-5xl font-normal mb-8">
        {{ pageData.subtitle || pageData.title }}
      </h1>

      <!-- Content Block, if there's any text on the page -->
      <PageBlocks v-if="pageData.layout" :layout="pageData.layout" class="mb-12" />

      <div v-if="pending" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>

      <div v-else-if="latestProducts && latestProducts.length > 0">
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          <ItemCard v-for="product in latestProducts" :key="product.id" :item="product" />
        </div>
      </div>

      <div v-else class="text-center py-12 bg-gray-50 rounded-lg text-gray-500">
        {{ $t('No new products yet') }}
      </div>
    </div>
  </BaseContainer>
</template>
