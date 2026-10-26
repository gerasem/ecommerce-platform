import { defineStore } from 'pinia'
import {
  getApiErrorMessage,
  getCheckoutErrorTranslationKey,
  isRecoverableCartReferenceError
} from '@/utils/checkoutError'

export interface CheckoutFormData {
  firstName: string
  lastName: string
  email: string
  address: string
  postalCode: string
  city: string
  country: string
  phone?: string
  differentBillingAddress?: boolean
  billingAddress?: {
    firstName: string
    lastName: string
    address: string
    postalCode: string
    city: string
    country: string
  }
}

type CheckoutResult =
  | { success: true; clientSecret: string }
  | { success: false; error: string; errorKey: string }

export const useCheckoutStore = defineStore('checkout', () => {
  const clientSecret = ref<string | null>(null)
  const paymentIntentId = ref<string | null>(null)
  const completedOrderId = ref<number | string | null>(null)
  const customerEmail = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const cartStore = useCartStore()
  const config = useRuntimeConfig()

  /**
   * Calls the Payload ecommerce `initiatePayment` endpoint:
   * POST /api/payments/stripe/initiate
   *
   * The plugin reads the cart from the user's session automatically (server-side cart).
   * It returns { clientSecret, paymentIntentID } from Stripe.
   */
  async function createOrder(formData: CheckoutFormData): Promise<CheckoutResult> {
    // Idempotency: don't create a new payment intent if we already have one
    if (clientSecret.value) {
      return { success: true, clientSecret: clientSecret.value }
    }

    loading.value = true
    error.value = null
    completedOrderId.value = null
    customerEmail.value = formData.email // Persist for confirm-order step

    try {
      await cartStore.flushServerCart()

      const shippingAddress = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        address: formData.address,
        postalCode: formData.postalCode,
        city: formData.city,
        country: formData.country,
        phone: formData.phone
      }

      const billingAddress =
        formData.differentBillingAddress && formData.billingAddress
          ? {
              firstName: formData.billingAddress.firstName,
              lastName: formData.billingAddress.lastName,
              email: formData.email,
              address: formData.billingAddress.address,
              postalCode: formData.billingAddress.postalCode,
              city: formData.billingAddress.city,
              country: formData.billingAddress.country,
              phone: formData.phone
            }
          : shippingAddress

      // The plugin endpoint uses:
      // - cartID from request body OR from the authenticated user's linked cart
      // - shippingAddress passed in body
      // - customerEmail required for guest checkout (no session), also helpful for logged-in users
      async function initiatePayment() {
        const body: Record<string, unknown> = {
          customerEmail: formData.email,
          shippingAddress,
          billingAddress,
          shippingMethodId: cartStore.selectedShippingMethodId,
          ...(config.public.enableCoupons ? { couponCode: cartStore.couponCode } : {}),
          ...(config.public.enableReferrals
            ? { referralCode: useCookie('referral_code').value || undefined }
            : {})
        }

        // Always use the current server cart reference. It may change if an old
        // cart is replaced after the API reports that it was already purchased.
        if (cartStore.serverCartId) {
          body.cartID = cartStore.serverCartId
        }

        if (cartStore.cartSecret) {
          body.secret = cartStore.cartSecret
        }

        return $payloadFetch<{
          clientSecret: string
          paymentIntentID: string
          message: string
        }>('/api/payments/stripe/initiate', {
          method: 'POST',
          body
        })
      }

      let response

      try {
        response = await initiatePayment()
      } catch (requestError) {
        if (!isRecoverableCartReferenceError(requestError)) throw requestError

        await cartStore.recreateServerCart()
        response = await initiatePayment()
      }

      if (!response.clientSecret || !response.paymentIntentID) {
        throw new Error('Payment initiation returned an incomplete response')
      }

      clientSecret.value = response.clientSecret
      paymentIntentId.value = response.paymentIntentID

      return {
        success: true,
        clientSecret: response.clientSecret
      }
    } catch (err: unknown) {
      const message = getApiErrorMessage(err) || 'Failed to initiate payment'
      error.value = message
      return {
        success: false,
        error: message,
        errorKey: getCheckoutErrorTranslationKey(err)
      }
    } finally {
      loading.value = false
    }
  }

  function clear() {
    clientSecret.value = null
    paymentIntentId.value = null
    completedOrderId.value = null
    customerEmail.value = null
    error.value = null
    loading.value = false
  }

  return {
    clientSecret,
    paymentIntentId,
    completedOrderId,
    customerEmail,
    loading,
    error,
    createOrder,
    clear
  }
})
