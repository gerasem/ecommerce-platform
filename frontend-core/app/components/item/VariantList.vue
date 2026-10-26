<script setup lang="ts">
import type { IVariant } from '@/types'

defineProps<{
  variants: IVariant[] | null | undefined
  selectedVariantId?: number | null
  basePrice?: number | null
  baseCurrency?: 'EUR' | 'USD' | string | null
  canAddToCart?: boolean
  isOutOfStock?: boolean
}>()

const emit = defineEmits<{
  (e: 'select', variant: IVariant): void
}>()

const { t } = useI18n()

function variantLabel(variant: IVariant): string {
  if (variant.options?.length) {
    return variant.options.map(o => o.label).join(' / ')
  }
  return variant.title || `Variant #${variant.id}`
}
</script>

<template>
  <div v-if="variants && variants.length > 0" class="space-y-2">
    <label class="block text-sm font-medium text-gray-700 mb-2">
      {{ t('Variants') }}
    </label>

    <div class="grid grid-cols-2 gap-2">
      <button
        v-for="variant in variants"
        :key="variant.id"
        :disabled="variant.inventory === 0"
        class="flex flex-col gap-1.5 px-3 py-2.5 border border-default cursor-pointer transition-all text-left hover:not-disabled:border-primary hover:not-disabled:bg-(--ui-primary)/5"
        :class="{
          'border-(--ui-primary) bg-(--ui-primary)/5 ring-1 ring-(--ui-primary)':
            selectedVariantId === variant.id,
          'opacity-50 cursor-not-allowed': variant.inventory === 0
        }"
        @click="emit('select', variant)"
      >
        <!-- Title & Price -->
        <div class="flex items-center justify-between gap-2">
          <span class="font-medium text-(--ui-text)">{{ variantLabel(variant) }}</span>

          <UBadge v-if="variant.inventory === 0" color="error" variant="subtle" size="xs">
            {{ t('Out of stock') }}
          </UBadge>

          <BasePrice
            class="font-semibold text-(--ui-text) whitespace-nowrap"
            :amount="
              baseCurrency === 'USD'
                ? (variant.priceInUSD ?? basePrice)
                : (variant.priceInEUR ?? basePrice)
            "
            :currency="baseCurrency"
          />
        </div>
      </button>
    </div>

    <!-- Warning if variants not selected -->
    <UAlert
      v-if="!canAddToCart && !isOutOfStock"
      color="warning"
      variant="soft"
      :title="t('Please select all product options')"
    />

    <!-- Out of stock message -->
    <UAlert
      v-if="isOutOfStock"
      color="error"
      variant="soft"
      :title="t('This product is currently out of stock')"
      icon="i-bi-exclamation-circle"
    />
  </div>
</template>
