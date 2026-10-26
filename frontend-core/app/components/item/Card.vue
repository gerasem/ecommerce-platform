<script setup lang="ts">
import type { IItem } from '@/types'
import { useCartStore } from '../../stores/useCartStore'

const { t } = useI18n()
const localePath = useLocalePath()
const cartStore = useCartStore()
const toast = useToast()

const props = defineProps<{
  item: IItem
}>()

// ... (keep the rest unchanged)
const imageUrl = computed(() => {
  const firstImage = props.item.gallery?.[0]
  if (!firstImage) return ''
  const url = firstImage.thumbnailURL || firstImage.url
  if (!url) return ''
  return usePayloadImageUrl(url)
})

const pricePrefix = computed(() => {
  if (areAllPricesEqual(props.item)) {
    return ''
  }
  return `${t('priceFrom')} `
})

const priceAmount = computed(() => {
  return getMinPrice(props.item)
})

const adding = ref(false)

const addToCart = async (e: Event) => {
  e.preventDefault()
  e.stopPropagation()

  if (props.item.id) {
    adding.value = true
    try {
      await cartStore.add(props.item.id as number, 1)

      toast.add({
        title: t('Added to cart'),
        description: `${props.item.title} × 1`,
        actions: [
          {
            label: t('Show Shopping Cart'),
            onClick: () => {
              navigateTo(localePath(useSystemPath('cart')))
            }
          }
        ]
      })
    } catch (e) {
      console.error('Failed to add to cart:', e)
      toast.add({ title: t('Error'), description: t('Failed to add item to cart'), color: 'error' })
    } finally {
      adding.value = false
    }
  }
}
</script>

<template>
  <div class="relative group block">
    <NuxtLink :to="localePath(`/item/${item.slug}`)">
      <!-- Item Image -->
      <div class="relative aspect-square bg-gray-100 overflow-hidden mb-3">
        <!-- Popular Badge -->
        <div
          v-if="item.isPopular"
          class="absolute top-2 left-2 z-10 bg-primary/90 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 backdrop-blur-sm"
        >
          <UIcon name="i-bi-fire" class="w-3.5 h-3.5" />
          {{ t('Hit') }}
        </div>
        <img
          :src="imageUrl"
          :alt="item.gallery?.[0]?.alt || item.title || ''"
          width="400"
          height="400"
          loading="lazy"
          class="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
    </NuxtLink>

    <!-- Favorite Toggle -->
    <BaseFavoriteButton :product="item" class="absolute top-4 right-4 z-10" />

    <!-- Details -->
    <div class="flex justify-between items-end gap-2">
      <NuxtLink :to="localePath(`/item/${item.slug}`)" class="flex flex-col flex-1 min-w-0">
        <h3 class="text-sm font-medium line-clamp-2">
          {{ item.title }}
        </h3>
        <span class="font-semibold whitespace-nowrap mt-1">
          {{ pricePrefix }}<BasePrice :amount="priceAmount" :currency="item.baseCurrency" />
        </span>
      </NuxtLink>

      <div v-if="item.inventory === 0" class="text-xs font-medium text-red-500 whitespace-nowrap bg-red-50 px-2 py-1 rounded">
        {{ t('Out of stock') }}
      </div>
      <UButton
        v-else
        icon="i-bi-cart"
        :loading="adding"
        variant="ghost"
        color="primary"
        @click.prevent="addToCart"
      />
    </div>
  </div>
</template>
