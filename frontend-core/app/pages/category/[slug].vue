<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string
const { t } = useI18n()

// All SEO, data fetching, filtering, and Schema.org logic is abstracted away!
const {
  currentCategory,
  sort,
  priceRange,
  allItems,
  items,
  minProductPrice,
  maxProductPrice,
  descriptionHTML
} = await useCategoryPage(slug)
</script>

<template>
  <BaseContainer>
    <!-- Category Header -->
    <BaseHeader>
      {{ currentCategory?.title || slug }}
    </BaseHeader>

    <!-- Items Grid -->
    <CategoryFilters
      v-if="priceRange && allItems.length > 0"
      v-model="sort"
      v-model:price-range="priceRange"
      :min="minProductPrice"
      :max="maxProductPrice"
    />

    <div
      v-if="items.length > 0"
      class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-12"
    >
      <ItemCard v-for="item in items" :key="item.id" :item="item" />
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12 mb-12">
      <p class="text-gray-500">
        {{ t('No products in category') }}
      </p>
    </div>

    <!-- Category Description (2 columns) -->
    <section v-if="descriptionHTML" class="prose prose-gray max-w-none">
      <div v-html="descriptionHTML" />
    </section>
  </BaseContainer>
</template>
