<script setup lang="ts">
import type { IPageDocument } from '@/types'

const { t } = useI18n()

const props = defineProps<{
  pageData: IPageDocument | null
}>()

const pageData = computed(() => props.pageData)

const { data: categoriesWithItems } = await useAsyncData('all-items-catalog', async () => {
  return usePayloadCategoriesWithItems(8)
})

usePayloadPageSeo(pageData)
</script>

<template>
  <BaseContainer>
    <!-- Page Header (using CMS title if available) -->
    <div class="mb-6">
      <BaseHeader>{{ pageData?.title || t('All Items') }}</BaseHeader>
    </div>

    <div v-if="categoriesWithItems && categoriesWithItems.length > 0">
      <CategorySection
        v-for="section in categoriesWithItems"
        :key="section.category.id"
        :category="section.category"
        :items="section.items"
      />
    </div>
  </BaseContainer>
</template>
