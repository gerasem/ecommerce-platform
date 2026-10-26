<script setup lang="ts">
import { useCartStore } from '../../stores/useCartStore'
import type { IPageDocument } from '@/types'

const { t } = useI18n()
const localePath = useLocalePath()
const cartStore = useCartStore()

const props = defineProps<{
  pageData: IPageDocument | null
}>()

const page = computed(() => props.pageData)

usePayloadPageSeo(page)
</script>

<template>
  <div>
    <ClientOnly>
      <BaseContainer>
        <BaseHeader>
          {{ page?.title || t('Shopping Cart') }}
        </BaseHeader>

        <div v-if="!cartStore.hasItems" class="py-12 text-center">
          <UIcon name="i-bi-cart" class="mx-auto mb-4 h-16 w-16 text-gray-400" />

          <p class="mb-4 text-lg">
            {{ t('Your cart is empty.') }}
          </p>

          <UButton :to="localePath(useSystemPath('all_items'))" color="primary" size="lg">
            {{ t('Continue Shopping') }}
          </UButton>
        </div>

        <div v-else class="grid gap-8 lg:gap-16 grid-cols-1 lg:grid-cols-3">
          <div class="col-span-1 lg:col-span-2 space-y-4 lg:order-1">
            <CartItem
              v-for="item in cartStore.items"
              :key="`${item.productId}-${item.variantId}`"
              :item="item"
            />
          </div>

          <div class="col-span-1 lg:order-2">
            <CartSummary :show-total="false" />
          </div>
        </div>
      </BaseContainer>
    </ClientOnly>
  </div>
</template>
