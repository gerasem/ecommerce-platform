<script setup lang="ts">
import { useCartStore } from '../../stores/useCartStore'
import { useCheckoutStore } from '../../stores/useCheckoutStore'
import { getOrderConfirmationState } from '../../utils/orderConfirmation'

definePageMeta({
  layout: 'default',
  ssr: false
})

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const cartStore = useCartStore()
const checkoutStore = useCheckoutStore()

usePageSeo({
  title: computed(() => t('Order confirmed')),
  description: computed(() => t('Thank you for your order!'))
})
useSeoMeta({ robots: 'noindex, nofollow' })

// Stripe redirects here with ?payment_intent=pi_xxx&redirect_status=succeeded
// Sensitive data (email, cart, secret) is stored in a secure httpOnly cookie
const paymentIntentId = route.query.payment_intent as string | undefined
const redirectStatus = route.query.redirect_status as string | undefined

const confirming = ref(true)
const orderId = ref<string | number | null>(null)
const confirmError = ref<string | null>(null)

onMounted(async () => {
  const confirmationState = getOrderConfirmationState({
    completedOrderId: checkoutStore.completedOrderId,
    paymentIntentId,
    redirectStatus
  })

  if (confirmationState === 'stripe' && paymentIntentId) {
    const confirmed = await confirmOrder(paymentIntentId)
    if (confirmed) {
      await finalizeSuccessfulOrder()
    }
  } else if (confirmationState === 'payment-failed') {
    confirmError.value = t('Payment failed, please try again.')
    confirming.value = false
  } else if (confirmationState === 'completed-order') {
    // No-Stripe orders are created before navigating to this page.
    orderId.value = checkoutStore.completedOrderId
    confirming.value = false
    await finalizeSuccessfulOrder()
  } else {
    // Direct navigation must not display a false success state or clear a cart.
    confirmError.value = t('Order confirmation is missing.')
    confirming.value = false
  }
})

async function finalizeSuccessfulOrder() {
  await cartStore.clear()
  checkoutStore.clear()
}

async function confirmOrder(intentId: string): Promise<boolean> {
  try {
    // Read checkout session data from the secure httpOnly cookie (set before Stripe redirect)
    const session = await $fetch<{
      customerEmail: string
      cartID: string
      cartSecret: string
      referralCode: string
    }>('/api/checkout-session')

    const response = await $payloadFetch<{
      orderID: number | string
      transactionID: number | string
      message: string
    }>('/api/payments/stripe/confirm-order', {
      method: 'POST',
      body: {
        paymentIntentID: intentId,
        ...(session.customerEmail ? { customerEmail: session.customerEmail } : {}),
        ...(session.cartID ? { cartID: session.cartID } : {}),
        ...(session.cartSecret ? { secret: session.cartSecret } : {}),
        ...(session.referralCode ? { referralCode: session.referralCode } : {})
      }
    })

    orderId.value = response.orderID

    try {
      await $fetch('/api/checkout-session', { method: 'DELETE' })
    } catch (error) {
      console.warn('Failed to clear checkout session:', error)
    }

    return true
  } catch (error: unknown) {
    const msg = getApiErrorMessage(error) || 'Failed to confirm order'
    confirmError.value = msg
    console.error('confirmOrder failed:', msg)
    return false
  } finally {
    confirming.value = false
  }
}

async function retryConfirmation() {
  if (!paymentIntentId) return

  confirmError.value = null
  confirming.value = true
  const confirmed = await confirmOrder(paymentIntentId)
  if (confirmed) {
    await finalizeSuccessfulOrder()
  }
}
</script>

<template>
  <BaseContainer class="py-16">
    <div class="max-w-md mx-auto text-center">
      <!-- Confirming spinner -->
      <template v-if="confirming">
        <div class="flex justify-center mb-6">
          <UIcon name="i-bi-arrow-repeat" class="w-12 h-12 animate-spin text-primary-500" />
        </div>
        <p class="text-gray-500">
          {{ t('Processing payment...') }}
        </p>
      </template>

      <!-- Error state -->
      <template v-else-if="confirmError">
        <div class="flex justify-center mb-6">
          <div class="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
            <UIcon name="i-bi-x" class="w-10 h-10 text-red-600" />
          </div>
        </div>
        <h1 class="text-2xl mb-4">
          {{ t('Payment error') }}
        </h1>
        <p class="text-red-500 mb-8">
          {{ confirmError }}
        </p>
        <UButton v-if="paymentIntentId" color="primary" block size="lg" @click="retryConfirmation">
          {{ t('Try again') }}
        </UButton>
        <UButton v-else :to="localePath(useSystemPath('cart'))" color="primary" block size="lg">
          {{ t('Back to Cart') }}
        </UButton>
      </template>

      <!-- Success state -->
      <template v-else>
        <div class="flex justify-center mb-6">
          <div class="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <UIcon name="i-bi-check" class="w-10 h-10 text-green-600" />
          </div>
        </div>

        <BaseHeader>
          {{ t('Order placed successfully!') }}
        </BaseHeader>

        <p class="text-gray-500 mb-2">
          {{ t('Thank you for your order!') }}
        </p>

        <p v-if="orderId" class="text-sm font-medium text-gray-700 mb-8">
          {{ t('Your order #') }}{{ orderId }}
        </p>
        <p v-else class="text-sm text-gray-500 mb-8">
          {{ t('You will receive a confirmation email shortly.') }}
        </p>

        <div class="flex flex-col gap-3">
          <UButton :to="localePath('/cabinet')" color="primary" block size="lg">
            {{ t('View my orders') }}
          </UButton>
          <UButton :to="localePath('/')" color="neutral" variant="outline" block size="lg">
            {{ t('Return to shop') }}
          </UButton>
        </div>
      </template>
    </div>
  </BaseContainer>
</template>
