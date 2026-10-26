import type { ICategory, IItem } from '@/types'

export const useCategoryPage = async (slug: string) => {
  const nuxtApp = useNuxtApp() // Capture context before any await
  const route = useRoute()
  const config = useRuntimeConfig()
  const siteUrl = useRequestURL().origin

  // === Structured Data (JSON-LD) ===
  // Must be called before any await to preserve context
  const { injectSchema } = useJsonLd()

  const { data: categories } = await useAsyncData('categories-for-products', () =>
    usePayloadCategories()
  )

  const currentCategory = computed(() =>
    categories.value?.find((cat: ICategory) => cat.slug === slug)
  )

  if (!currentCategory.value) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Category not found'
    })
  }

  const sort = ref('title')
  const priceRange = ref<[number, number] | null>(null)

  // Restore context for the second useAsyncData
  const { data: productsData } = await nuxtApp.runWithContext(() =>
    useAsyncData(
      `products-${slug}`,
      async () => {
        if (!currentCategory.value?.id) {
          return { products: [], totalDocs: 0 }
        }
        return usePayloadProducts(String(currentCategory.value.id), sort.value, null)
      },
      {
        watch: [sort]
      }
    )
  )

  const allItems = computed(() => productsData.value?.products || [])

  const getItemPrice = (item: IItem) => {
    const eurRate = useState<number>('exchangeRate').value || 83
    const usdRate = useState<number>('usdExchangeRate').value || 80
    return getCartItemAmount(item, { eurRate, usdRate })
  }

  // Calculate dynamic min/max in the shop currency.
  const minProductPrice = computed(() => {
    const prices = allItems.value.map(getItemPrice)
    if (!prices.length) return 0
    return Math.min(...prices)
  })

  const maxProductPrice = computed(() => {
    const prices = allItems.value.map(getItemPrice)
    if (!prices.length) return 5000000
    return Math.max(...prices)
  })

  // Initialize price range once data is loaded
  // Watch for data changes to set initial range if not set
  watch(
    productsData,
    data => {
      if (data?.products?.length && !priceRange.value) {
        priceRange.value = [minProductPrice.value, maxProductPrice.value]
      }
    },
    { immediate: true }
  )

  const items = computed(() => {
    let filtered = allItems.value

    // Client-side price filtering
    if (priceRange.value) {
      filtered = filtered.filter(item => {
        const price = getItemPrice(item)
        return price >= priceRange.value![0] && price <= priceRange.value![1]
      })
    }

    return filtered
  })

  // Convert rich text description to HTML
  const descriptionHTML = computed(() => {
    if (!currentCategory.value?.description) return ''
    return richTextToHTML(currentCategory.value.description)
  })

  // Restore context for usePageSeo
  nuxtApp.runWithContext(() => {
    usePageSeo({
      title: computed(() => `${currentCategory.value?.title || slug} | Store`),
      description: computed(() => currentCategory.value?.description || `Browse ${slug} products`)
    })
  })

  nuxtApp.runWithContext(() => {
    // BreadcrumbList Schema
    injectSchema(() => ({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: siteUrl
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: currentCategory.value?.title || slug,
          item: `${siteUrl}${route.fullPath}`
        }
      ]
    }))

    // CollectionPage and ItemList Schema
    injectSchema(() => {
      const cat = currentCategory.value
      if (!cat) return null

      const itemListElement = items.value.map((item, index) => {
        let imageUrl = undefined
        if (item.gallery && item.gallery.length > 0) {
          const img = item.gallery[0]
          const url = img?.url || img?.thumbnailURL
          if (url) {
            imageUrl = url.startsWith('http') ? url : `${config.public.payloadUrl}${url}`
          }
        }

        return {
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Product',
            name: item.title,
            url: `${siteUrl}/item/${item.slug}`,
            image: imageUrl,
            offers: {
              '@type': 'Offer',
              price: (
                (item.baseCurrency === 'USD' ? item.priceInUSD : item.priceInEUR) ?? 0
              ).toFixed(2),
              priceCurrency: item.baseCurrency === 'USD' ? 'USD' : 'EUR'
            }
          }
        }
      })

      return {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: cat.title,
        url: `${siteUrl}${route.fullPath}`,
        mainEntity: {
          '@type': 'ItemList',
          itemListElement
        }
      }
    })
  })

  return {
    categories,
    currentCategory,
    slug,
    sort,
    priceRange,
    allItems,
    items,
    minProductPrice,
    maxProductPrice,
    descriptionHTML
  }
}
