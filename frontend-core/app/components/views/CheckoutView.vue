<script setup lang="ts">
import { useCartStore } from '../../stores/useCartStore'
import { useCheckoutStore } from '../../stores/useCheckoutStore'
import type { CheckoutFormData } from '../../stores/useCheckoutStore'
import { getCheckoutErrorTranslationKey } from '../../utils/checkoutError'
import type { IPageDocument, IShippingMethod } from '@/types'

const { t } = useI18n()
const localePath = useLocalePath()
const cartStore = useCartStore()
const checkoutStore = useCheckoutStore()
const router = useRouter()
const toast = useToast()
const config = useRuntimeConfig()
const cartCurrency = getCartCurrency()

const props = defineProps<{
  pageData: IPageDocument | null
}>()

const page = computed(() => props.pageData)

// SEO
usePayloadPageSeo(page)
useSeoMeta({ robots: 'noindex, nofollow' })

const checkoutFormRef = ref<{ submit: () => void } | null>(null)

function submitForm() {
  if (checkoutFormRef.value) {
    checkoutFormRef.value.submit()
  }
}

// Ensure we have the latest shipping methods loaded
onMounted(async () => {
  if (cartStore.hasItems) {
    await cartStore.fetchShippingSettings()
  }
})

async function handleFormSubmit(formData: CheckoutFormData) {
  if (!cartStore.hasItems) {
    toast.add({
      title: t('Error'),
      description: t('Your cart is empty.'),
      color: 'error',
      icon: 'i-bi-exclamation-circle'
    })
    return
  }

  if (!cartStore.isMinimumOrderAmountMet) {
    toast.add({
      title: t('Error'),
      description: t('Minimum order amount is {amount}', {
        amount: formatPrice(cartStore.minimumOrderAmount, cartCurrency)
      }),
      color: 'error',
      icon: 'i-bi-exclamation-circle'
    })
    return
  }

  const result = await checkoutStore.createOrder(formData)

  if (!result.success) {
    toast.add({
      title: t('Error'),
      description: t(result.errorKey || getCheckoutErrorTranslationKey(result.error)),
      color: 'error',
      icon: 'i-bi-exclamation-circle'
    })
    return
  }

  router.push(localePath('/payment'))
}
</script>

<template>
  <div>
    <ClientOnly>
      <BaseContainer>
        <BaseHeader>
          {{ page?.title || t('Checkout') }}
        </BaseHeader>

        <div class="grid gap-8 lg:grid-cols-3">
          <!-- Checkout Form (Left Column) -->
          <div class="lg:col-span-2 space-y-8">
            <CheckoutForm
              ref="checkoutFormRef"
              :loading="checkoutStore.loading"
              @submit="handleFormSubmit"
            />

            <!-- Shipping Methods Selection -->
            <div
              v-if="cartStore.shippingMethods && cartStore.shippingMethods.length > 0"
              class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm"
            >
              <h2 class="text-xl font-medium mb-4">
                {{ t('Shipping Method') }}
              </h2>
              <URadioGroup
                v-model="cartStore.selectedShippingMethodId"
                :items="
                  cartStore.shippingMethods.map((method: IShippingMethod) => ({
                    value: method.id || '',
                    label: method.name || '',
                    price: method.price,
                    description: method.description || undefined
                  }))
                "
                name="shipping-method"
                class="space-y-4"
              >
                <template #label="{ item }">
                  <span class="font-medium text-gray-900 dark:text-white">{{ item.label }}</span>
                  <template v-if="typeof item.price === 'number'">
                    <span class="font-medium text-gray-900 dark:text-white"> — </span>
                    <BasePrice :amount="item.price" />
                  </template>
                </template>
              </URadioGroup>
            </div>
          </div>

          <!-- Order Summary (Right Column) — button inside the block like on cart page -->
          <div class="lg:col-span-1 space-y-4">
            <UButton
              icon="i-bi-arrow-left"
              variant="ghost"
              color="neutral"
              :to="localePath(useSystemPath('cart'))"
              class="mb-2"
            >
              {{ t('Back to Cart') }}
            </UButton>

            <CartSummary :show-checkout-button="false" :show-continue-shopping="false">
              <template #action>
                <UButton
                  class="py-3"
                  block
                  size="xl"
                  color="primary"
                  icon="i-bi-lock"
                  :loading="checkoutStore.loading"
                  :disabled="
                    checkoutStore.loading ||
                    !cartStore.hasItems ||
                    !cartStore.isMinimumOrderAmountMet
                  "
                  data-test="continue-to-payment-button"
                  @click="submitForm"
                >
                  {{
                    checkoutStore.loading
                      ? config.public.enableStripe
                        ? t('Processing payment...')
                        : t('Adding...')
                      : config.public.enableStripe
                        ? t('Continue to Payment')
                        : t('Complete your order')
                  }}
                </UButton>
              </template>
            </CartSummary>
          </div>
        </div>
      </BaseContainer>
    </ClientOnly>
  </div>
</template>

<style scoped>
/* Force single column for the text in checkout, matching cart page */
:deep(.text-content p) {
  column-count: 1 !important;
}
</style>
