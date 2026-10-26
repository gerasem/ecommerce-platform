import assert from 'node:assert/strict'
import test from 'node:test'

import { contactForm } from './contactForm'

const originalFetch = global.fetch
const originalServerProvider = process.env.CAPTCHA_PROVIDER
const originalProvider = process.env.NUXT_PUBLIC_CAPTCHA_PROVIDER
const originalGoogleSecret = process.env.RECAPTCHA_SECRET_KEY

type CreateCall = {
  collection: string
  data: {
    form: number
    submissionData: Array<{
      field: string
      value: string
    }>
  }
  overrideAccess: boolean
  req: unknown
}

const callEndpoint = async ({
  body,
  create,
  ip
}: {
  body: unknown
  create: (args: CreateCall) => Promise<{ id: number }>
  ip: string
}) => {
  const request = Object.assign(
    new Request('http://localhost/api/contact', {
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': ip
      },
      method: 'POST'
    }),
    {
      payload: {
        create,
        logger: {
          error: () => undefined
        }
      }
    }
  ) as unknown as Parameters<typeof contactForm.handler>[0]

  return contactForm.handler(request)
}

const configureCaptcha = () => {
  process.env.CAPTCHA_PROVIDER = 'google'
  process.env.NUXT_PUBLIC_CAPTCHA_PROVIDER = 'google'
  process.env.RECAPTCHA_SECRET_KEY = 'test-secret'
  global.fetch = async () =>
    Response.json({
      action: 'submit_form',
      score: 0.9,
      success: true
    })
}

const restoreCaptcha = () => {
  global.fetch = originalFetch

  if (originalServerProvider === undefined) delete process.env.CAPTCHA_PROVIDER
  else process.env.CAPTCHA_PROVIDER = originalServerProvider

  if (originalProvider === undefined) delete process.env.NUXT_PUBLIC_CAPTCHA_PROVIDER
  else process.env.NUXT_PUBLIC_CAPTCHA_PROVIDER = originalProvider

  if (originalGoogleSecret === undefined) delete process.env.RECAPTCHA_SECRET_KEY
  else process.env.RECAPTCHA_SECRET_KEY = originalGoogleSecret
}

test('creates a normalized form submission after CAPTCHA verification', async t => {
  configureCaptcha()
  t.after(restoreCaptcha)

  let createCall: CreateCall | undefined

  const response = await callEndpoint({
    body: {
      formId: '12',
      recaptchaToken: 'valid-token',
      submissionData: [
        { field: 'name', value: 'Alex' },
        { field: 'privacyAccepted', value: true }
      ]
    },
    create: async args => {
      createCall = args
      return { id: 42 }
    },
    ip: '192.0.2.1'
  })

  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), {
    data: {
      id: 42
    },
    success: true
  })
  assert.equal(createCall?.collection, 'form-submissions')
  assert.equal(createCall?.overrideAccess, true)
  assert.deepEqual(createCall?.data, {
    form: 12,
    submissionData: [
      { field: 'name', value: 'Alex' },
      { field: 'privacyAccepted', value: 'true' }
    ]
  })
})

test('rejects malformed submissions before creating a document', async () => {
  let createCalled = false

  const response = await callEndpoint({
    body: {
      formId: 12,
      submissionData: [{ value: 'Missing field name' }]
    },
    create: async () => {
      createCalled = true
      return { id: 42 }
    },
    ip: '192.0.2.2'
  })

  assert.equal(response.status, 400)
  assert.equal(createCalled, false)
})

test('fails closed when contact CAPTCHA is not configured', async t => {
  delete process.env.CAPTCHA_PROVIDER
  process.env.NUXT_PUBLIC_CAPTCHA_PROVIDER = 'google'
  delete process.env.RECAPTCHA_SECRET_KEY
  t.after(restoreCaptcha)

  let createCalled = false
  const response = await callEndpoint({
    body: {
      formId: 12,
      recaptchaToken: 'token',
      submissionData: [{ field: 'name', value: 'Alex' }]
    },
    create: async () => {
      createCalled = true
      return { id: 42 }
    },
    ip: '192.0.2.3'
  })

  assert.equal(response.status, 503)
  assert.equal(createCalled, false)
})
