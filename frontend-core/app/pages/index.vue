<script setup lang="ts">
const { t } = useI18n()

const [
  { data: categories },
  { data: homePage },
  { data: popularProducts },
  { data: latestProducts },
  { data: latestNews }
] = await Promise.all([
  useAsyncData('home-categories', () => usePayloadCategories()),
  useAsyncData('home-page-content', () => usePayloadPage('home')),
  useAsyncData('popular-products', () => usePayloadPopularProducts(8)),
  useAsyncData('latest-products', () => usePayloadLatestProducts(4)),
  useAsyncData('latest-news', () => usePayloadNews(3))
])

usePayloadPageSeo(homePage)

// === Structured Data (JSON-LD) ===
const { injectSchema } = useJsonLd()
const siteUrl = useRequestURL().origin

injectSchema(() => {
  if (!categories.value || categories.value.length === 0) return null

  // Create an ItemList for the featured categories
  const itemListElement = categories.value.map((catData, index) => {
    return {
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'CollectionPage',
        name: catData.title,
        url: `${siteUrl}/category/${catData.slug}`
      }
    }
  })

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Featured Categories',
    itemListElement
  }
})

const isDesktop = useIsDesktop()
</script>

<template>
  <BaseContainer>
    <!-- Grid layout: categories on left, content on right -->
    <div class="lg:grid lg:grid-cols-16 lg:gap-12">
      <!-- Left sidebar: Category List -->
      <aside class="lg:col-span-3 mb-8 lg:mb-0">
        <CategoryList :categories="categories || []" />
      </aside>

      <!-- Main content area -->
      <section class="lg:col-span-13 min-w-0">
        <div v-if="popularProducts && popularProducts.length > 0" class="mb-12">
          <h2 class="text-3xl md:text-4xl mb-6">
            {{ t('Popular products') }}
          </h2>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <ItemCard v-for="product in popularProducts" :key="product.id" :item="product" />
          </div>
        </div>

        <div v-if="latestProducts && latestProducts.length > 0" class="mb-12">
          <h2 class="text-3xl md:text-4xl mb-6">
            {{ t('New arrivals') }}
          </h2>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <ItemCard v-for="product in latestProducts" :key="product.id" :item="product" />
          </div>
        </div>

        <div v-if="latestNews && latestNews.length > 0" class="mb-12">
          <h2 class="text-3xl md:text-4xl mb-6">
            {{ t('News') }}
          </h2>
          <LazyNewsMobileSwiper v-if="!isDesktop" :news="latestNews" />
          <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <NewsCard v-for="news in latestNews" :key="news.id" :news="news" />
          </div>
        </div>

        <!-- Dynamic Page Layout Blocks -->
        <PageBlocks :layout="homePage?.layout" />
      </section>
    </div>
  </BaseContainer>
</template>
