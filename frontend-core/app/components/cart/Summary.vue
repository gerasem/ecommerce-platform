<script setup lang="ts">
import { useCartStore } from '../../stores/useCartStore'

const { t } = useI18n()
const localePath = useLocalePath()
const cartStore = useCartStore()
const config = useRuntimeConfig()
const cartCurrency = getCartCurrency()

withDefaults(
  defineProps<{
    showCheckoutButton?: boolean
    showTotal?: boolean
    showContinueShopping?: boolean
  }>(),
  {
    showCheckoutButton: true,
    showTotal: true,
    showContinueShopping: true
  }
)

const couponInput = ref('')
const applying = ref(false)

watch(
  () => cartStore.couponCode,
  newVal => {
    if (newVal && !couponInput.value) {
      couponInput.value = newVal
    }
  },
  { immediate: true }
)

async function applyCouponCode() {
  applying.value = true
  await cartStore.applyCoupon(couponInput.value)
  applying.value = false
}

function removeCoupon() {
  cartStore.removeCoupon()
  couponInput.value = ''
}
</script>

<template>
  <div class="sticky top-24 shadow-[0_0_40px_10px_rgba(0,0,0,0.05)] bg-white">
    <template v-if="cartStore.freeShippingThreshold > 0">
      <div
        v-if="cartStore.totalInRub < cartStore.freeShippingThreshold"
        class="flex bg-secondary-100 px-6 h-14 justify-center items-center"
      >
        <i18n-t keypath="Free shipping over {amount}" tag="span" class="font-medium text-secondary">
          <template #amount>
            <BasePrice :amount="cartStore.freeShippingThreshold" :currency="cartCurrency" />
          </template>
        </i18n-t>
      </div>

      <div v-else class="flex bg-green-50 px-6 h-14 justify-center items-center">
        <span class="font-medium text-green-700"> {{ t('Free shipping applied!') }} </span>
      </div>
    </template>

    <div
      v-if="cartStore.minimumOrderAmount > 0 && !cartStore.isMinimumOrderAmountMet"
      class="flex bg-amber-50 px-6 min-h-14 justify-center items-center text-amber-800"
    >
      <i18n-t keypath="Minimum order amount is {amount}" tag="span" class="font-medium">
        <template #amount>
          <BasePrice :amount="cartStore.minimumOrderAmount" :currency="cartCurrency" />
        </template>
      </i18n-t>
    </div>

    <div class="p-6">
      <div class="mb-3 flex gap-4">
        <span class="text-gray-500 flex-1">{{ t('Subtotal') }}</span>

        <div class="flex flex-1">
          <USkeleton v-if="cartStore.isHydrating && !cartStore.count" class="h-5 w-20" />

          <BaseAnimatedPrice
            v-else
            :value="cartStore.totalInRub"
            :currency="cartCurrency"
            class="font-bold"
          />
        </div>
      </div>

      <div v-if="cartStore.discountPercentage > 0" class="mb-3 flex gap-4 text-green-600">
        <span class="flex-1">{{ t('Discount') }} ({{ cartStore.couponCode }})</span>

        <div class="flex flex-1">
          <span class="font-bold"
            >-<BaseAnimatedPrice :value="cartStore.discountAmount" :currency="cartCurrency"
          /></span>
        </div>
      </div>

      <div v-if="showTotal" class="mb-3 flex gap-4">
        <span class="text-gray-500 flex-1">{{ t('Shipping') }}</span>

        <div class="flex flex-1">
          <span v-if="cartStore.shippingTotal == null" class="text-sm text-gray-500">
            {{ t('Shipping is paid separately by the customer') }}
          </span>

          <span v-else-if="cartStore.shippingTotal === 0" class="font-bold text-green-600">
            {{ t('Free') }}
          </span>

          <BaseAnimatedPrice
            v-else
            :value="cartStore.shippingTotal"
            :currency="cartCurrency"
            class="font-bold"
          />
        </div>
      </div>

      <div v-if="showTotal" class="mb-8 flex gap-4">
        <span class="text-gray-500 flex-1">{{ t('Total') }}</span>

        <div class="flex flex-1">
          <USkeleton v-if="cartStore.isHydrating && !cartStore.count" class="h-7 w-28" />

          <BaseAnimatedPrice
            v-else
            :value="cartStore.grandTotal"
            :currency="cartCurrency"
            class="font-bold text-primary"
          />
        </div>
      </div>

      <div v-if="config.public.enableCoupons" class="mb-6">
        <form class="flex gap-2 relative" @submit.prevent="applyCouponCode">
          <UInput
            v-model="couponInput"
            :placeholder="t('Coupon Code')"
            class="flex-1"
            :disabled="applying"
          />

          <UButton type="submit" :loading="applying" color="neutral" variant="outline">
            {{ t('Apply') }}
          </UButton>
        </form>

        <p v-if="cartStore.couponError" class="text-red-500 text-sm mt-2">
          {{ cartStore.couponError }}
        </p>

        <div
          v-if="cartStore.couponCode && !cartStore.couponError"
          class="text-sm mt-2 flex items-center justify-between text-green-600"
        >
          <span>{{ t('Coupon applied:') }} {{ cartStore.couponCode }}</span>

          <button
            type="button"
            class="text-gray-400 hover:text-red-500 underline text-sm"
            @click="removeCoupon"
          >
            {{ t('Remove') }}
          </button>
        </div>
      </div>

      <slot name="action">
        <UButton
          v-if="showCheckoutButton && cartStore.isMinimumOrderAmountMet"
          :to="localePath(useSystemPath('checkout'))"
          color="primary"
          size="xl"
          block
          :disabled="!cartStore.hasItems"
          class="py-3"
          data-test="checkout-button"
        >
          {{ t('Proceed to Checkout') }}
        </UButton>
      </slot>
    </div>
  </div>
</template>
