<script setup lang="ts">
import { reactive, watch, computed } from 'vue'
import { gsap } from 'gsap'

const props = withDefaults(
  defineProps<{
    value: number
    duration?: number
    currency?: 'EUR' | 'USD' | 'RUB' | string | null
  }>(),
  {
    duration: 0.5,
    currency: 'EUR'
  }
)

const tweened = reactive({
  value: props.value
})

watch(
  () => props.value,
  newValue => {
    gsap.to(tweened, {
      duration: props.duration,
      value: newValue,
      ease: 'power2.out'
    })
  }
)

const widthStyle = computed(() => {
  const price = Math.abs(props.value)
  const digits = Math.max(1, Math.floor(Math.log10(price || 1)) + 1)
  const width = 54 + (digits - 1) * 18
  return {
    width: `${width}px`
  }
})
</script>

<template>
  <BasePrice
    class="inline-block text-right tabular-nums"
    :style="widthStyle"
    :amount="tweened.value"
    :currency="props.currency"
  />
</template>
