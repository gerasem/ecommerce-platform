<script setup lang="ts">
import { Page_View } from '@/generated/graphql'

const route = useRoute()
const slug = computed(() => route.params.slug as string)

// Fetch page data with SSR
const { data: pageData } = await useAsyncData(`page-${slug.value}`, () =>
  usePayloadPage(slug.value)
)

// Handle page not found
if (!pageData.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page Not Found',
    fatal: true
  })
}

const viewComponent = computed(() => {
  switch (pageData.value?.view) {
    case Page_View.Favorites:
      return resolveComponent('ViewsFavoritesView')
    case Page_View.Checkout:
      return resolveComponent('ViewsCheckoutView')
    case Page_View.Cart:
      return resolveComponent('ViewsCartView')
    case Page_View.AllItems:
      return resolveComponent('ViewsAllItemsView')
    case Page_View.News:
      return resolveComponent('ViewsNewsView')
    default:
      return resolveComponent('ViewsDefaultView')
  }
})
</script>

<template>
  <component :is="viewComponent" :page-data="pageData" />
</template>
