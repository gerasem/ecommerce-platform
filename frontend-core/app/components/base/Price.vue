<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    amount?: number | null
    currency?: 'EUR' | 'USD' | 'RUB' | string | null
  }>(),
  {
    currency: 'EUR'
  }
)
</script>

<template>
  <span>{{ formatPrice(props.amount, props.currency) }}</span>
</template>
