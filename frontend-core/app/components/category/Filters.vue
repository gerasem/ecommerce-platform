<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: string
    priceRange: [number, number]
    min?: number // Amount in the shop's display currency
    max?: number // Amount in the shop's display currency
  }>(),
  {
    min: 0,
    max: 50000
  }
)

const emit = defineEmits(['update:modelValue', 'update:priceRange'])

const { t } = useI18n()

const minAmount = computed(() => Math.floor(props.min))
const maxAmount = computed(() => Math.ceil(props.max))
const priceFormatOptions = computed(() => ({
  style: 'currency' as const,
  currency: getCartCurrency(),
  currencySign: 'standard' as const
}))

const localPrice = computed({
  get: () => [...props.priceRange],
  set: (value: number[]) => {
    if (
      value &&
      value.length === 2 &&
      typeof value[0] === 'number' &&
      typeof value[1] === 'number'
    ) {
      emit('update:priceRange', [value[0], value[1]])
    }
  }
})

const minPrice = computed({
  get: () => localPrice.value[0] ?? minAmount.value,
  set: val => {
    const currentMax = localPrice.value[1] ?? maxAmount.value
    localPrice.value = [Number(val), currentMax]
  }
})

const maxPrice = computed({
  get: () => localPrice.value[1] ?? maxAmount.value,
  set: val => {
    const currentMin = localPrice.value[0] ?? minAmount.value
    localPrice.value = [currentMin, Number(val)]
  }
})

const sortOptions = computed(() => [
  { label: t('Alphabetical (A-Z)'), value: 'title' },
  { label: t('Alphabetical (Z-A)'), value: '-title' },
  { label: t('Price: Low to High'), value: 'priceInEUR' },
  { label: t('Price: High to Low'), value: '-priceInEUR' }
])

const selectedSort = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
})
</script>

<template>
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-8">
    <!-- Left: Price Range -->
    <div class="flex gap-2 w-full">
      <div class="flex items-center gap-2 min-w-96">
        <UInputNumber
          v-model="minPrice"
          class="w-36"
          :min="minAmount"
          :max="maxPrice"
          :increment="false"
          :decrement="false"
          variant="ghost"
          size="xl"
          :format-options="priceFormatOptions"
        />

        <USlider v-model="localPrice" :min="minAmount" :max="maxAmount" :step="1" />

        <UInputNumber
          v-model="maxPrice"
          class="w-36"
          :min="minPrice"
          :max="maxAmount"
          :increment="false"
          :decrement="false"
          variant="ghost"
          size="xl"
          :format-options="priceFormatOptions"
        />
      </div>
    </div>

    <!-- Right: Sort -->
    <div class="flex items-center gap-2">
      <USelect
        v-model="selectedSort"
        :items="sortOptions"
        option-attribute="label"
        value-attribute="value"
        variant="ghost"
        icon="bi-filter"
        size="xl"
        class="w-full sm:min-w-52"
      />
    </div>
  </div>
</template>
