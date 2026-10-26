import { z } from 'zod'

// Simple in-memory rate limiter: max 20 requests per IP per minute
type ContactProxyError = {
  data?: {
    error?: string
    message?: string
  }
  response?: {
    status?: number
  }
  status?: number
  statusCode?: number
  statusMessage?: string
}

type ContactProxyResponse = {
  data: {
    id: number | string
  }
  success: boolean
}

const rateLimitMap = new Map<string, { count: number; reset: number }>()
const RATE_LIMIT = 20
const RATE_WINDOW_MS = 60_000

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.reset) {
    rateLimitMap.set(ip, { count: 1, reset: now + RATE_WINDOW_MS })
    return true
  }

  if (record.count >= RATE_LIMIT) return false

  record.count++
  return true
}

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const config = useRuntimeConfig()
  // Use the private backend URL so CAPTCHA verification and submission
  // creation happen at the same trusted API boundary.
  const payloadUrl = config.payloadUrl || 'http://localhost:3000'

  // Rate limiting by IP
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  if (!checkRateLimit(ip)) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests'
    })
  }

  // Generic schema expecting formId and submissionData array
  const schema = z.object({
    formId: z.number().or(z.string()),
    submissionData: z.array(
      z.object({
        field: z.string(),
        value: z.any()
      })
    ),
    recaptchaToken: z.string().optional()
  })

  // Validate request structure
  const result = schema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation Failed',
      data: result.error.issues
    })
  }

  try {
    const response = await $fetch<ContactProxyResponse>('/api/contact', {
      baseURL: payloadUrl as string,
      method: 'POST',
      headers: {
        'x-forwarded-for': ip
      },
      body: result.data
    })

    return response
  } catch (error: unknown) {
    console.error('Contact submission error:', error)
    const fetchError = error as ContactProxyError
    const statusCode =
      fetchError.statusCode || fetchError.status || fetchError.response?.status || 500
    const responseMessage = fetchError.data?.error || fetchError.data?.message
    const statusMessage = responseMessage || fetchError.statusMessage || 'Failed to send message'

    throw createError({
      statusCode,
      statusMessage,
      data: fetchError.data
    })
  }
})
