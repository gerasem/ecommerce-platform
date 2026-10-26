import type { Endpoint } from 'payload'

import { verifyCaptcha } from '@/lib/captcha'

const RATE_LIMIT = 20
const RATE_WINDOW_MS = 60_000
const MAX_SUBMISSION_FIELDS = 50
const MAX_SUBMISSION_SIZE = 50_000
const MAX_RATE_LIMIT_ENTRIES = 10_000

type RateLimitEntry = {
  count: number
  resetAt: number
}


type SubmissionDataEntry = {
  field: string
  value: unknown
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

const normalizeValue = (value: unknown): string => {
  if (typeof value === 'string') return value
  if (value === null || value === undefined) return ''
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)

  return JSON.stringify(value)
}

export const contactForm: Endpoint = {
  path: '/contact',
  method: 'post',
  handler: async req => {
    const ip = getClientIP(req.headers)

    if (!isRateLimitAllowed(ip)) {
      return Response.json({ error: 'Too many requests' }, { status: 429 })
    }

    try {
      const body = (typeof req.json === 'function' ? await req.json() : req.body) as {
        formId?: number | string
        recaptchaToken?: unknown
        submissionData?: unknown
      }
      const formId =
        typeof body.formId === 'string' && /^\d+$/.test(body.formId)
          ? Number(body.formId)
          : body.formId

      if (!Number.isInteger(formId) || Number(formId) <= 0 || !Array.isArray(body.submissionData)) {
        return Response.json({ error: 'Invalid form submission' }, { status: 400 })
      }

      if (body.submissionData.length === 0 || body.submissionData.length > MAX_SUBMISSION_FIELDS) {
        return Response.json({ error: 'Invalid form submission' }, { status: 400 })
      }

      const hasInvalidField = body.submissionData.some(
        (entry: unknown) =>
          !entry ||
          typeof entry !== 'object' ||
          !('field' in entry) ||
          typeof (entry as SubmissionDataEntry).field !== 'string' ||
          !(entry as SubmissionDataEntry).field.trim()
      )

      if (hasInvalidField) {
        return Response.json({ error: 'Invalid form submission' }, { status: 400 })
      }

      const submissionData = (body.submissionData as SubmissionDataEntry[]).map(entry => {
        const submissionEntry = entry as SubmissionDataEntry
        return {
          field: submissionEntry.field.trim(),
          value: normalizeValue(submissionEntry.value)
        }
      })

      if (JSON.stringify(submissionData).length > MAX_SUBMISSION_SIZE) {
        return Response.json({ error: 'Form submission is too large' }, { status: 413 })
      }

      const recaptchaToken =
        typeof body.recaptchaToken === 'string' ? body.recaptchaToken : undefined
      const captchaError = await verifyCaptcha({
        expectedAction: 'submit_form',
        ip,
        requireConfigured: true,
        token: recaptchaToken
      })

      if (captchaError) {
        return Response.json({ error: captchaError.error }, { status: captchaError.status })
      }

      const submission = await req.payload.create({
        collection: 'form-submissions',
        data: {
          form: Number(formId),
          submissionData
        },
        // Public collection access is intentionally disabled. This endpoint is
        // the only public creation path and performs validation, rate limiting,
        // and CAPTCHA verification before using the Local API.
        overrideAccess: true,
        req
      })

      return Response.json({
        data: {
          id: submission.id
        },
        success: true
      })
    } catch (error) {
      let status = 500
      if (typeof error === 'object' && error !== null) {
        if ('status' in error && typeof error.status === 'number') {
          status = error.status
        } else if ('statusCode' in error && typeof error.statusCode === 'number') {
          status = error.statusCode
        }
      }

      req.payload.logger.error(error, 'Contact form submission failed')

      return Response.json(
        {
          error: status < 500 && error instanceof Error ? error.message : 'Failed to send message'
        },
        { status }
      )
    }
  }
}
