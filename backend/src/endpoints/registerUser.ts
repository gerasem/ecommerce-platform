import type { Endpoint } from 'payload'

import { verifyCaptcha } from '@/lib/captcha'

const RATE_LIMIT = 5
const RATE_WINDOW_MS = 15 * 60_000
const MAX_RATE_LIMIT_ENTRIES = 10_000

type RateLimitEntry = {
  count: number
  resetAt: number
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
        if (entry.resetAt <= now) {
          rateLimits.delete(key)
        }
      }

      if (rateLimits.size >= MAX_RATE_LIMIT_ENTRIES) {
        rateLimits.clear()
      }
    }

    rateLimits.set(ip, {
      count: 1,
      resetAt: now + RATE_WINDOW_MS
    })
    return true
  }

  if (current.count >= RATE_LIMIT) {
    return false
  }

  current.count += 1
  return true
}

const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const getPayloadEmailError = (error: unknown): { error: string; status: number } | undefined => {
  if (typeof error !== 'object' || error === null || !('data' in error)) return

  const data = error.data
  if (typeof data !== 'object' || data === null || !('errors' in data)) return
  if (!Array.isArray(data.errors)) return

  const emailError = data.errors.find(
    fieldError =>
      typeof fieldError === 'object' &&
      fieldError !== null &&
      'path' in fieldError &&
      fieldError.path === 'email'
  )

  if (!emailError || typeof emailError !== 'object' || !('message' in emailError)) return

  const message = typeof emailError.message === 'string' ? emailError.message : ''
  if (message.toLowerCase().includes('already') || message.toLowerCase().includes('unique')) {
    return {
      error: 'A user with this email is already registered.',
      status: 409
    }
  }

  return { error: 'Invalid email', status: 400 }
}

export const registerUser: Endpoint = {
  path: '/register',
  method: 'post',
  handler: async req => {
    const ip = getClientIP(req.headers)

    if (!isRateLimitAllowed(ip)) {
      return Response.json({ error: 'Too many registration attempts' }, { status: 429 })
    }

    try {
      const body = (typeof req.json === 'function' ? await req.json() : req.body) as {
        captchaToken?: unknown
        email?: unknown
        name?: unknown
        password?: unknown
        passwordConfirm?: unknown
      }
      const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
      const name = typeof body.name === 'string' ? body.name.trim() : ''
      const password = typeof body.password === 'string' ? body.password : ''
      const passwordConfirm = typeof body.passwordConfirm === 'string' ? body.passwordConfirm : ''
      const captchaToken =
        typeof body.captchaToken === 'string' ? body.captchaToken.trim() : undefined

      if (
        !email ||
        !isValidEmail(email) ||
        !name ||
        name.length > 200 ||
        password.length < 6 ||
        password.length > 128 ||
        password !== passwordConfirm
      ) {
        return Response.json({ error: 'Invalid registration data' }, { status: 400 })
      }

      const captchaError = await verifyCaptcha({
        expectedAction: 'register_form',
        ip,
        requireConfigured: true,
        token: captchaToken
      })

      if (captchaError) {
        return Response.json({ error: captchaError.error }, { status: captchaError.status })
      }

      const user = await req.payload.create({
        collection: 'users',
        context: {
          skipFirstUserAdmin: true
        },
        data: {
          email,
          name,
          password,
          roles: ['customer']
        },
        overrideAccess: true,
        req
      })

      return Response.json(
        {
          user: {
            email: user.email,
            id: user.id,
            name: user.name
          }
        },
        { status: 201 }
      )
    } catch (error) {
      const emailError = getPayloadEmailError(error)
      if (emailError) {
        return Response.json({ error: emailError.error }, { status: emailError.status })
      }

      let status = 500
      if (typeof error === 'object' && error !== null) {
        if ('status' in error && typeof error.status === 'number') {
          status = error.status
        } else if ('statusCode' in error && typeof error.statusCode === 'number') {
          status = error.statusCode
        }
      }

      req.payload.logger.error(error, 'User registration failed')

      return Response.json(
        {
          error: status < 500 && error instanceof Error ? error.message : 'Registration failed'
        },
        { status }
      )
    }
  }
}
