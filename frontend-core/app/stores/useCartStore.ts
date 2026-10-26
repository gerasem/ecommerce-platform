import { defineStore, skipHydrate } from 'pinia'
import type {
  ICartItemRaw,
  ICartItem,
  IShippingMethod,
  IShippingSettings,
  IVariant
} from '../types'
import { isRecoverableCartReferenceError } from '../utils/checkoutError'
import { usePayloadProductsByIds } from '../composables/usePayloadProductsByIds'

interface ServerCartItem {
  product: number | { id: number }
  variant?: number | { id: number } | null
  quantity: number
}

interface ServerCart {
  id: number
  items?: ServerCartItem[] | null
}

interface CartPayload {
  currency: string
  items: Array<{
    product: number
    variant?: number
    quantity: number
  }>
  customer?: number
  secret?: string
}

export const useCartStore = defineStore('cart', () => {
  // Minimal data stored in localStorage
  // skipHydrate ensures the client value (from LS) isn't overwritten by the empty server value
  const rawItems = skipHydrate(ref<ICartItemRaw[]>([]))

  const userStore = useUserStore()
  const serverCartId = skipHydrate(ref<number | null>(null))
  // Guest cart access secret — returned by Payload on cart creation for unauthenticated carts
  const cartSecret = skipHydrate(ref<string | null>(null))

  // Full cart items enriched with product data
  const items = ref<ICartItem[]>([])

  // Flag to check if we have loaded from LS
  const isInitialized = ref(false)

  // Load cart from localStorage on app start
  function loadFromLS() {
    try {
      const saved = localStorage.getItem('payload-cart')
      if (saved) {
        rawItems.value = JSON.parse(saved)
      }
      const savedCoupon = localStorage.getItem('payload-cart-coupon')
      if (savedCoupon) {
        couponCode.value = savedCoupon
      }
      const savedCartId = localStorage.getItem('payload-cart-id')
      if (savedCartId) {
        serverCartId.value = parseInt(savedCartId, 10)
      }
      const savedCartSecret = localStorage.getItem('payload-cart-secret')
      if (savedCartSecret) {
        cartSecret.value = savedCartSecret
      }
    } catch (e) {
      console.warn('Failed to load cart from localStorage', e)
      rawItems.value = []
    }
  }

  // Initialize the cart — call once on app bootstrap (client-side)
  // We call loadFromLS synchronously during store creation so it's ready for middlewares!
  if (import.meta.client) {
    loadFromLS()
  }

  async function init() {
    isInitialized.value = true

    // If user is already logged in, fetch server cart
    if (userStore.loggedIn) {
      await fetchServerCart()
    }

    if (couponCode.value) {
      await applyCoupon(couponCode.value)
    }

    await fetchShippingSettings()
    await hydrate()
  }

  // Persist rawItems to localStorage whenever it changes
  watch(
    rawItems,
    () => {
      // Don't save if we haven't loaded yet (prevents overwriting LS with empty array on init)
      if (!isInitialized.value) return
      localStorage.setItem('payload-cart', JSON.stringify(rawItems.value))
    },
    { deep: true }
  )

  watch(serverCartId, newId => {
    if (!isInitialized.value) return
    if (newId) {
      localStorage.setItem('payload-cart-id', String(newId))
    } else {
      localStorage.removeItem('payload-cart-id')
    }
  })

  watch(cartSecret, newSecret => {
    if (!isInitialized.value) return
    if (newSecret) {
      localStorage.setItem('payload-cart-secret', newSecret)
    } else {
      localStorage.removeItem('payload-cart-secret')
    }
  })

  // Coupon state
  const couponCode = skipHydrate(ref<string>(''))
  const discountPercentage = ref<number>(0)
  const couponError = ref<string>('')

  watch(couponCode, newCode => {
    if (!isInitialized.value) return
    if (newCode) {
      localStorage.setItem('payload-cart-coupon', newCode)
    } else {
      localStorage.removeItem('payload-cart-coupon')
    }
  })

  async function applyCoupon(code: string) {
    if (!code) {
      removeCoupon()
      return { success: true }
    }

    couponError.value = ''
    try {
      // Validate coupon via server-side endpoint (never exposes full coupon data)
      const result = await $fetch<{
        valid: boolean
        code?: string
        discountPercentage?: number
        error?: string
      }>('/api/validate-coupon', {
        method: 'POST',
        body: { code: code.toUpperCase() }
      })

      if (!result.valid) {
        couponError.value = result.error || 'Gutschein nicht gefunden'
        removeCoupon()
        return { success: false }
      }

      couponCode.value = result.code || code.toUpperCase()
      discountPercentage.value = result.discountPercentage || 0
      return { success: true }
    } catch (e) {
      console.error('Failed to apply coupon', e)
      couponError.value = 'Fehler bei der Überprüfung des Gutscheins'
      removeCoupon()
      return { success: false }
    }
  }

  function removeCoupon() {
    couponCode.value = ''
    discountPercentage.value = 0
  }

  // Watch for user login to merge/fetch cart
  watch(
    () => userStore.loggedIn,
    async loggedIn => {
      if (loggedIn) {
        await mergeGuestCart()
      } else {
        // On logout, clear local items
        items.value = []
        rawItems.value = []
        serverCartId.value = null
      }
    }
  )

  // === Server Sync Logic ===

  async function fetchServerCart() {
    if (!userStore.user) return

    try {
      // Fetch cart for current user
      // Assuming 'carts' collection has 'customer' field
      const { docs } = await $payloadFetch<{ docs: ServerCart[] }>('/api/carts', {
        params: {
          'where[customer][equals]': userStore.user.id,
          'where[purchasedAt][exists]': false,
          depth: 0 // We only need IDs primarily, but depth 0 gives structure
        }
      })

      if (docs && docs.length > 0) {
        const cart = docs[0]
        if (!cart) return
        serverCartId.value = cart.id

        // Map server items to rawItems
        if (cart.items) {
          rawItems.value = cart.items.map(i => ({
            productId: i.product && typeof i.product === 'object' ? i.product.id : i.product,
            variantId:
              i.variant && typeof i.variant === 'object' ? i.variant.id : (i.variant ?? null),
            qty: i.quantity
          }))
        }
      }
    } catch (e) {
      console.error('Failed to fetch server cart', e)
    }
  }

  let saveTimeout: ReturnType<typeof setTimeout> | null = null
  let saveChain: Promise<void> = Promise.resolve()

  function enqueueServerSave() {
    const saveRequest = saveChain.catch(() => undefined).then(() => _saveToServer())
    saveChain = saveRequest
    return saveRequest
  }

  function saveToServer() {
    if (saveTimeout) clearTimeout(saveTimeout)
    saveTimeout = setTimeout(() => {
      saveTimeout = null
      void enqueueServerSave().catch(e => {
        console.error('Failed to save cart to server', e)
      })
    }, 500)
  }

  /**
   * Persist the latest cart state before checkout.
   * Any in-flight save is allowed to finish first, then the current state is
   * saved once more so the order endpoint cannot read a stale cart.
   */
  async function flushServerCart() {
    if (saveTimeout) {
      clearTimeout(saveTimeout)
      saveTimeout = null
    }

    await enqueueServerSave()
  }

  function resetServerCartReference() {
    serverCartId.value = null
    cartSecret.value = null
  }

  async function createServerCart(cartPayload: CartPayload) {
    const response = await $payloadFetch<{ doc: { id: number; secret?: string } }>('/api/carts', {
      method: 'POST',
      body: cartPayload
    })

    serverCartId.value = response.doc.id
    cartSecret.value = response.doc.secret || null
  }

  // Save cart to server — works for both logged-in users and guests
  async function _saveToServer() {
    const cartPayload: CartPayload = {
      currency: 'EUR', // Required by ecommerce plugin's beforeChange to compute subtotal
      items: rawItems.value.map(i => ({
        product: i.productId,
        variant: i.variantId ?? undefined,
        quantity: i.qty
      }))
    }

    // Add customer link for logged-in users
    if (userStore.loggedIn && userStore.user) {
      cartPayload.customer = userStore.user.id
    }

    if (serverCartId.value) {
      // Update existing cart (PATCH)
      const updateBody: CartPayload = { ...cartPayload }
      // Pass secret for guest cart access control
      if (cartSecret.value) {
        updateBody.secret = cartSecret.value
      }
      try {
        await $payloadFetch(`/api/carts/${serverCartId.value}`, {
          method: 'PATCH',
          body: updateBody
        })
        return
      } catch (error) {
        if (!isRecoverableCartReferenceError(error)) throw error

        resetServerCartReference()
      }
    }

    await createServerCart(cartPayload)
  }

  /**
   * Replace an expired, deleted or already purchased server cart while keeping
   * the customer's local items. Used only after the API identifies a stale cart.
   */
  async function recreateServerCart() {
    if (saveTimeout) {
      clearTimeout(saveTimeout)
      saveTimeout = null
    }

    await saveChain.catch(() => undefined)
    resetServerCartReference()
    await enqueueServerSave()
  }

  async function mergeGuestCart() {
    // 1. Fetch server cart first to see what's there
    // Save local items to a temp var.
    const localItems = [...rawItems.value] // Copy guest items

    await fetchServerCart() // This updates rawItems with server data

    if (localItems.length === 0) {
      // No local items to merge, but we still need to hydrate
      // so the server cart is displayed correctly
      await hydrate()
      return
    }

    // Merge logic
    localItems.forEach(localItem => {
      const existing = rawItems.value.find(
        i => i.productId === localItem.productId && i.variantId === localItem.variantId
      )
      if (existing) {
        existing.qty += localItem.qty
      } else {
        rawItems.value.push(localItem)
      }
    })

    saveToServer()
    await hydrate() // Refresh UI
  }

  // Hydration state
  const isHydrating = ref(false)

  // Rebuild full cart items using raw data + fresh product info
  async function hydrate() {
    // If no raw items, clear hydrated items
    if (rawItems.value.length === 0) {
      items.value = []
      return
    }

    isHydrating.value = true

    try {
      // Fetch all products needed for cart
      const productIds = [...new Set(rawItems.value.map(item => item.productId))]
      const products = await usePayloadProductsByIds(productIds)

      items.value = rawItems.value
        .map(raw => {
          const product = products.get(raw.productId)

          // If product fetch failed (or deleted), we temporarily hide it from "items" (view)
          // BUT we do NOT remove it from "rawItems" (storage) to prevent data loss on network error.
          if (!product) {
            console.warn(`Product ${raw.productId} not found during hydration`)
            return null
          }

          const variant = raw.variantId
            ? product.variants?.docs?.find(
                (variant): variant is IVariant => variant !== null && variant.id === raw.variantId
              )
            : null

          const baseCurrency = product.baseCurrency || 'EUR'

          const priceInEUR = variant?.priceInEUR ?? product.priceInEUR ?? 0
          const priceInUSD = variant?.priceInUSD ?? product.priceInUSD ?? 0

          const inventory = product.enableVariants ? variant?.inventory : product.inventory

          return {
            variantId: raw.variantId,
            productId: raw.productId,
            qty: raw.qty,
            title: product.title || 'Unknown Product',
            slug: product.slug || '',
            baseCurrency,
            priceInEUR,
            priceInUSD,
            image: product.gallery?.[0]?.thumbnailURL ?? product.gallery?.[0]?.url,
            variantTitle: product.enableVariants ? variant?.title : undefined,
            inventory
          }
        })
        .filter(Boolean) as ICartItem[]
    } catch (e) {
      console.error('Cart hydration failed:', e)
    } finally {
      isHydrating.value = false
    }
  }

  // Add item to cart (or update quantity if exists)
  async function add(
    productId: number | undefined,
    qty: number = 1,
    variantId: number | null = null
  ) {
    if (!productId || qty <= 0) return

    const existing = rawItems.value.find(
      i => i.productId === productId && i.variantId === variantId
    )

    if (existing) {
      existing.qty += qty
    } else {
      rawItems.value.push({ productId, variantId, qty })
    }

    // Sync to server (both logged-in and guest)
    saveToServer()

    await hydrate()
  }

  // Update item quantity
  async function updateQuantity(
    productId: number,
    variantId: number | null | undefined,
    qty: number
  ) {
    const item = rawItems.value.find(i => i.productId === productId && i.variantId === variantId)

    if (item) {
      item.qty = Math.max(1, qty) // Ensure at least 1

      saveToServer()

      await hydrate()
    }
  }

  // Remove item from cart
  async function remove(productId: number, variantId: number | null | undefined = null) {
    rawItems.value = rawItems.value.filter(
      item => !(item.productId === productId && item.variantId === variantId)
    )

    saveToServer()

    await hydrate()
  }

  // Clear entire cart (e.g. after successful purchase)
  async function clear() {
    if (saveTimeout) {
      clearTimeout(saveTimeout)
      saveTimeout = null
    }

    rawItems.value = []
    items.value = []
    cartSecret.value = null
    removeCoupon()

    // Reset the server cart reference — the old cart is now "purchased"
    // (confirm-order sets purchasedAt on it). Don't overwrite it with empty items.
    serverCartId.value = null
  }

  // Computed getters
  // Use rawItems for count/hasItems so they display INSTANTLY from localStorage
  const count = computed(() => rawItems.value.reduce((sum, i) => sum + i.qty, 0))

  const totalInRub = computed(() => {
    const eurRate = useState<number>('exchangeRate').value || 83
    const usdRate = useState<number>('usdExchangeRate').value || 80
    return items.value.reduce((sum, i) => {
      return sum + getCartItemAmount(i, { eurRate, usdRate }) * i.qty
    }, 0)
  })
  // Legacy names are kept for layer overrides; values are in the shop currency.
  const totalInRubles = totalInRub
  const cartCurrency = getCartCurrency()

  const totalFormatted = computed(() => formatPrice(totalInRub.value, cartCurrency))
  const hasItems = computed(() => rawItems.value.length > 0)

  // Discount
  const discountAmount = computed(() => {
    if (!discountPercentage.value) return 0
    return Math.round(totalInRub.value * (discountPercentage.value / 100) * 100) / 100
  })
  const discountFormatted = computed(() => formatPrice(discountAmount.value, cartCurrency))

  const totalWithDiscount = computed(() => Math.max(0, totalInRub.value - discountAmount.value))
  const totalWithDiscountFormatted = computed(() =>
    formatPrice(totalWithDiscount.value, cartCurrency)
  )
  const shippingSettingsData = ref<IShippingSettings | null>(null)
  const selectedShippingMethodId = ref<string | undefined>(undefined)

  // Fetch shipping settings from Payload on initialization
  async function fetchShippingSettings() {
    shippingSettingsData.value = await useShippingSettings()
    const methods = shippingSettingsData.value?.shippingMethods ?? []

    if (methods.length === 0) {
      selectedShippingMethodId.value = undefined
      return
    }

    const defaultMethod = methods.find(method => method.isDefault)
    selectedShippingMethodId.value = defaultMethod?.id ?? methods[0]?.id ?? undefined
  }

  const minimumOrderAmount = computed(() => {
    return shippingSettingsData.value?.minimumOrderAmount ?? 0
  })

  const freeShippingThreshold = computed(() => {
    return shippingSettingsData.value?.freeShippingThreshold ?? 0
  })

  const isMinimumOrderAmountMet = computed(() => {
    return minimumOrderAmount.value <= 0 || totalInRub.value >= minimumOrderAmount.value
  })

  // List of all active shipping methods from CMS
  const shippingMethods = computed(() => {
    return (shippingSettingsData.value?.shippingMethods || []).filter(
      (method): method is IShippingMethod => method !== null
    )
  })

  // The currently selected shipping method object
  const selectedShippingMethod = computed(() => {
    const methods = shippingMethods.value
    if (methods.length === 0) return null

    // Find the one user selected
    if (selectedShippingMethodId.value) {
      const selected = methods.find(method => method.id === selectedShippingMethodId.value)
      if (selected) return selected
    }

    // Otherwise find the default one
    const defaultMethod = methods.find(method => method.isDefault)
    if (defaultMethod) return defaultMethod

    // Fallback to the first one available
    return methods[0]
  })

  const shippingTotal = computed(() => {
    // A zero threshold disables automatic free shipping.
    if (freeShippingThreshold.value > 0 && totalInRub.value >= freeShippingThreshold.value) {
      return 0
    }
    return selectedShippingMethod.value?.price ?? null
  })

  const grandTotal = computed(() => totalWithDiscount.value + (shippingTotal.value ?? 0))
  const grandTotalFormatted = computed(() => formatPrice(grandTotal.value, cartCurrency))
  const shippingFormatted = computed(() => formatPrice(shippingTotal.value, cartCurrency))

  return {
    items,
    rawItems,
    count,
    totalInRub,
    totalInRubles,
    totalFormatted,
    hasItems,
    serverCartId,
    cartSecret,
    // Coupon fields
    couponCode,
    discountPercentage,
    couponError,
    discountAmount,
    discountFormatted,
    totalWithDiscount,
    totalWithDiscountFormatted,
    applyCoupon,
    removeCoupon,
    // Shipping fields
    shippingTotal,
    shippingFormatted,
    grandTotal,
    grandTotalFormatted,
    freeShippingThreshold,
    minimumOrderAmount,
    isMinimumOrderAmountMet,
    shippingMethods,
    selectedShippingMethod,
    selectedShippingMethodId,
    fetchShippingSettings,
    init,
    add,
    updateQuantity,
    remove,
    clear,
    flushServerCart,
    recreateServerCart,
    isHydrating,
    isInitialized,
    hydrate
  }
})
