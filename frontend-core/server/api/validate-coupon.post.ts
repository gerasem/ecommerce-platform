import { z } from 'zod'

interface CouponDocument {
  code: string
  discountPercentage: number
  expirationDate?: string | null
}

/**
 * Server-side coupon validation endpoint.
 * Queries Payload CMS internally (server-to-server, with API key) and returns only
 * { valid, discountPercentage } — never exposing coupon codes or full data.
 */
export default defineEventHandler(async event => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  if (!config.public.enableCoupons) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Coupons are disabled'
    })
  }

  const payloadUrl = config.payloadUrl || config.public.payloadUrl || 'http://localhost:3000'

  // Validate input
  const schema = z.object({
    code: z.string().min(1).max(50)
  })

  const result = schema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid coupon code format'
    })
  }

  const code = result.data.code.toUpperCase()

  try {
    // Query Payload REST API server-to-server with API key for admin access
    // Since coupons collection has `read: adminOnly`, we need admin credentials
    const headers: Record<string, string> = {}
    const apiKey = config.payloadApiKey
    if (apiKey) {
      headers['Authorization'] = `users API-Key ${apiKey}`
    }

    const response = await $fetch<{ docs: CouponDocument[] }>('/api/coupons', {
      baseURL: payloadUrl,
      params: {
        'where[code][equals]': code,
        limit: 1,
        depth: 0
      },
      headers
    })

    const coupon = response?.docs?.[0]

    if (!coupon) {
      return {
        valid: false,
        error: 'Gutschein nicht gefunden'
      }
    }

    // Check expiration
    if (coupon.expirationDate && new Date(coupon.expirationDate) < new Date()) {
      return {
        valid: false,
        error: 'Gutschein ist abgelaufen'
      }
    }

    // Return only what the client needs — never the full coupon object
    return {
      valid: true,
      code: coupon.code,
      discountPercentage: coupon.discountPercentage
    }
  } catch (error: unknown) {
    console.error('Coupon validation error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Fehler bei der Überprüfung des Gutscheins'
    })
  }
})
