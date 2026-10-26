import type { Endpoint } from 'payload'

import {
  calculateRubShipping,
  convertNaturalCurrency,
  type CurrencyCode,
  isMinimumOrderAmountMet,
  roundMoney,
  toMinorUnits
} from '@/lib/money'
import { features } from '@/lib/features'

const RATE_LIMIT = 10
const RATE_WINDOW_MS = 15 * 60_000
const MAX_RATE_LIMIT_ENTRIES = 10_000
const MAX_CART_ITEMS = 100

type RateLimitEntry = {
  count: number
  resetAt: number
}

type ShippingAddressInput = {
  address: string
  address2?: string
  city: string
  country: string
  firstName: string
  lastName: string
  phone?: string
  postalCode: string
}

const rateLimits = new Map<string, RateLimitEntry>()

const getClientIP = (headers: Headers): string => {
  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown'
  }

  return headers.get('x-real-ip')?.trim() || 'unknown'
}

const isRateLimitAllowed = (ip: string): boolean => {
  const now = Date.now()
  const current = rateLimits.get(ip)

  if (!current || current.resetAt <= now) {
    if (rateLimits.size >= MAX_RATE_LIMIT_ENTRIES) {
      for (const [key, entry] of rateLimits) {
        if (entry.resetAt <= now) rateLimits.delete(key)
      }

      if (rateLimits.size >= MAX_RATE_LIMIT_ENTRIES) rateLimits.clear()
    }

    rateLimits.set(ip, {
      count: 1,
      resetAt: now + RATE_WINDOW_MS
    })
    return true
  }

  if (current.count >= RATE_LIMIT) return false

  current.count += 1
  return true
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const getRequiredString = (
  source: Record<string, unknown>,
  field: string,
  minLength: number,
  maxLength: number
): string | null => {
  const value = source[field]
  if (typeof value !== 'string') return null

  const normalized = value.trim()
  return normalized.length >= minLength && normalized.length <= maxLength ? normalized : null
}

const getOptionalString = (
  source: Record<string, unknown>,
  field: string,
  maxLength: number
): string | undefined | null => {
  const value = source[field]
  if (value === undefined || value === null || value === '') return undefined
  if (typeof value !== 'string') return null

  const normalized = value.trim()
  return normalized.length <= maxLength ? normalized || undefined : null
}

const parseShippingAddress = (value: unknown): ShippingAddressInput | null => {
  if (!isRecord(value)) return null

  const firstName = getRequiredString(value, 'firstName', 2, 100)
  const lastName = getRequiredString(value, 'lastName', 2, 100)
  const address = getRequiredString(value, 'address', 5, 300)
  const postalCode = getRequiredString(value, 'postalCode', 4, 20)
  const city = getRequiredString(value, 'city', 2, 100)
  const country = getRequiredString(value, 'country', 2, 100)
  const address2 = getOptionalString(value, 'address2', 300)
  const phone = getOptionalString(value, 'phone', 50)

  if (
    !firstName ||
    !lastName ||
    !address ||
    !postalCode ||
    !city ||
    !country ||
    address2 === null ||
    phone === null
  ) {
    return null
  }

  return {
    address,
    address2,
    city,
    country,
    firstName,
    lastName,
    phone,
    postalCode
  }
}

const isValidEmail = (email: string): boolean =>
  email.length <= 320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

const parsePositiveInteger = (value: unknown): number | null => {
  const normalized =
    typeof value === 'string' && /^\d+$/.test(value.trim()) ? Number(value.trim()) : value

  return typeof normalized === 'number' && Number.isSafeInteger(normalized) && normalized > 0
    ? normalized
    : null
}

const findOrderByCart = async (req: any, cartID: number) => {
  const result = await req.payload.find({
    collection: 'orders',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    req,
    where: {
      sourceCart: {
        equals: cartID
      }
    }
  })

  return result.docs?.[0]
}

const processedOrderResponse = (orderID: number | string) =>
  Response.json({
    alreadyProcessed: true,
    message: 'Order has already been created',
    orderID,
    success: true
  })

export const createOrderNoStripe: Endpoint = {
  path: '/create-order-no-stripe',
  method: 'post',
  handler: async req => {
    // A deployment with any online payment provider must not expose a second
    // path that can create an unpaid order.
    if (features.paymentProvider !== 'none') {
      return Response.json({ error: 'Offline checkout is disabled' }, { status: 404 })
    }

    const ip = getClientIP(req.headers)
    if (!isRateLimitAllowed(ip)) {
      return Response.json({ error: 'Too many order attempts' }, { status: 429 })
    }

    try {
      let body: unknown
      try {
        body = typeof req.json === 'function' ? await req.json() : req.body
      } catch {
        return Response.json({ error: 'Invalid request body' }, { status: 400 })
      }

      if (!isRecord(body)) {
        return Response.json({ error: 'Invalid request body' }, { status: 400 })
      }

      const customerEmail =
        typeof body.customerEmail === 'string' ? body.customerEmail.trim().toLowerCase() : ''
      const shippingAddress = parseShippingAddress(body.shippingAddress)
      const cartID = parsePositiveInteger(body.cartID)
      const secret = getOptionalString(body, 'secret', 500)
      const shippingMethodId = getRequiredString(body, 'shippingMethodId', 1, 200)
      const company = getOptionalString(body, 'company', 200)

      if (
        !isValidEmail(customerEmail) ||
        !shippingAddress ||
        !cartID ||
        !shippingMethodId ||
        secret === null ||
        company === null
      ) {
        return Response.json({ error: 'Invalid order data' }, { status: 400 })
      }

      // Verify cart
      const cart = await req.payload.findByID({
        collection: 'carts',
        id: cartID,
        depth: 2
      })

      if (!cart) {
        return Response.json({ error: 'Cart not found' }, { status: 404 })
      }

      const isOwner =
        req.user &&
        cart.customer &&
        req.user.id === (typeof cart.customer === 'object' ? cart.customer.id : cart.customer)

      if (!isOwner && (!secret || cart.secret !== secret)) {
        return Response.json({ error: 'Invalid or missing cart secret' }, { status: 403 })
      }

      if (cart.purchasedAt) {
        const existingOrder = await findOrderByCart(req, cartID)
        return existingOrder
          ? processedOrderResponse(existingOrder.id)
          : Response.json({ error: 'Cart has already been purchased' }, { status: 409 })
      }

      // Fetch exchange rate to convert EUR and USD to RUB
      const exchangeRateRes = await req.payload.findGlobal({
        slug: 'exchange-rate',
        depth: 0
      })
      const rates = {
        EUR: typeof exchangeRateRes?.rate === 'number' ? exchangeRateRes.rate : Number.NaN,
        USD: typeof exchangeRateRes?.usdRate === 'number' ? exchangeRateRes.usdRate : Number.NaN
      }

      const getItemPriceRub = (item: any): number => {
        const product = typeof item.product === 'object' ? item.product : null
        const variant = typeof item.variant === 'object' ? item.variant : null
        if (!product || !product.id || (product._status && product._status !== 'published')) {
          throw new Error('Cart contains an unavailable product')
        }
        if (item.variant && (!variant || (variant._status && variant._status !== 'published'))) {
          throw new Error('Cart contains an unavailable product variant')
        }

        const baseCurrency: CurrencyCode =
          (variant?.baseCurrency || product?.baseCurrency) === 'USD' ? 'USD' : 'EUR'
        const rawPrice =
          baseCurrency === 'USD'
            ? (variant?.priceInUSD ?? product?.priceInUSD ?? 0)
            : (variant?.priceInEUR ?? product?.priceInEUR ?? 0)
        if (typeof rawPrice !== 'number' || !Number.isFinite(rawPrice) || rawPrice <= 0) {
          throw new Error('Cart contains a product without a valid price')
        }

        return convertNaturalCurrency({
          amount: rawPrice,
          from: baseCurrency,
          rates,
          to: 'RUB'
        })
      }

      // Calculate subtotal from cart items
      let subtotal = 0
      const items = cart.items || []
      if (!Array.isArray(items) || items.length === 0 || items.length > MAX_CART_ITEMS) {
        return Response.json({ error: 'Cart must contain valid items' }, { status: 400 })
      }

      const pricedItems = items.map((item: any) => {
        const quantity = Number(item.quantity)
        if (!Number.isSafeInteger(quantity) || quantity <= 0 || quantity > 1000) {
          throw new Error('Cart contains an invalid quantity')
        }

        const amount = getItemPriceRub(item)
        subtotal += amount * quantity

        return {
          amount,
          currency: 'RUB',
          product: typeof item.product === 'object' ? item.product.id : item.product,
          quantity,
          variant: typeof item.variant === 'object' ? item.variant?.id : item.variant || undefined
        }
      })

      // Product prices and the converted subtotal use normal currency units.
      subtotal = roundMoney(subtotal)
      if (!Number.isFinite(subtotal) || subtotal <= 0) {
        return Response.json({ error: 'Cart total must be greater than zero' }, { status: 400 })
      }

      // Calculate shipping cost (already in RUB from ShippingSettings)
      let shippingCost = 0
      const shippingSettingsRes = await req.payload.findGlobal({
        slug: 'shipping-settings',
        depth: 0
      })
      const shippingMethods = shippingSettingsRes?.shippingMethods || []
      if (shippingMethods.length === 0) {
        return Response.json({ error: 'Shipping is not configured' }, { status: 503 })
      }

      if (
        !isMinimumOrderAmountMet({
          minimumOrderAmount: shippingSettingsRes?.minimumOrderAmount,
          subtotal
        })
      ) {
        return Response.json(
          {
            currency: 'RUB',
            error: 'Order subtotal is below the minimum order amount',
            minimumOrderAmount: shippingSettingsRes.minimumOrderAmount,
            subtotal
          },
          { status: 400 }
        )
      }

      const selectedMethod = shippingMethods.find((m: any) => m.id === shippingMethodId)
      if (!selectedMethod) {
        return Response.json({ error: 'Invalid shipping method' }, { status: 400 })
      }

      shippingCost = calculateRubShipping({
        cartCurrency: 'RUB',
        freeShippingThresholdRub: shippingSettingsRes?.freeShippingThreshold,
        rates,
        shippingPriceRub: selectedMethod.price,
        subtotal
      }).shippingCost

      const total = roundMoney(subtotal + shippingCost)

      // Create order
      let orderRes
      try {
        orderRes = await req.payload.create({
          collection: 'orders',
          data: {
            customer: cart.customer || undefined,
            items: pricedItems,
            // The ecommerce order field is an API boundary and expects minor units.
            // Payload's admin PriceInput converts this back and displays normal RUB.
            amount: toMinorUnits(total),
            subtotal,
            currency: 'RUB',
            shippingAddress: {
              addressLine1: shippingAddress.address,
              addressLine2: shippingAddress.address2 || '',
              city: shippingAddress.city,
              country: shippingAddress.country,
              firstName: shippingAddress.firstName,
              lastName: shippingAddress.lastName,
              phone: shippingAddress.phone,
              postalCode: shippingAddress.postalCode
            },
            shippingMethodName: selectedMethod.name,
            shippingCost,
            sourceCart: cartID,
            customerEmail,
            company
          },
          req
        })
      } catch (error) {
        // sourceCart has a database-level unique constraint. If two requests
        // race, the second one returns the order created by the first request.
        const existingOrder = await findOrderByCart(req, cartID)
        if (existingOrder) return processedOrderResponse(existingOrder.id)
        throw error
      }

      // Mark cart as purchased
      try {
        await req.payload.update({
          collection: 'carts',
          id: cartID,
          data: {
            purchasedAt: new Date().toISOString()
          },
          req
        })
      } catch (e) {
        req.payload.logger.error(e, 'Non-critical: Failed to update cart with purchasedAt')
      }

      return Response.json({
        success: true,
        orderID: orderRes.id,
        message: 'Order created successfully'
      })
    } catch (err: unknown) {
      req.payload.logger.error(err, 'Error creating order without stripe')
      return Response.json({ error: 'Order creation failed' }, { status: 500 })
    }
  }
}
