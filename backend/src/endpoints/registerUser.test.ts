import assert from 'node:assert/strict'
import test from 'node:test'

import { Users } from '@/collections/Users'

import { registerUser } from './registerUser'

type CreateCall = {
  collection: string
  context: {
    skipFirstUserAdmin: boolean
  }
  data: {
    email: string
    name: string
    password: string
    roles: string[]
  }
  overrideAccess: boolean
  req: unknown
}

const originalFetch = global.fetch
const originalServerProvider = process.env.CAPTCHA_PROVIDER
const originalProvider = process.env.NUXT_PUBLIC_CAPTCHA_PROVIDER
const originalGoogleSecret = process.env.RECAPTCHA_SECRET_KEY

const restoreEnvironment = () => {
  global.fetch = originalFetch

  if (originalServerProvider === undefined) delete process.env.CAPTCHA_PROVIDER
  else process.env.CAPTCHA_PROVIDER = originalServerProvider

  if (originalProvider === undefined) delete process.env.NUXT_PUBLIC_CAPTCHA_PROVIDER
  else process.env.NUXT_PUBLIC_CAPTCHA_PROVIDER = originalProvider

  if (originalGoogleSecret === undefined) delete process.env.RECAPTCHA_SECRET_KEY
  else process.env.RECAPTCHA_SECRET_KEY = originalGoogleSecret
}

const callEndpoint = async ({
  body,
  create,
  ip
}: {
  body: unknown
  create: (args: CreateCall) => Promise<{ email: string; id: number; name: string }>
  ip: string
}) => {
  const request = Object.assign(
    new Request('http://localhost/api/register', {
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
  ) as unknown as Parameters<typeof registerUser.handler>[0]

  return registerUser.handler(request)
}

test('registers a customer only after server-side CAPTCHA verification', async t => {
  t.after(restoreEnvironment)

  delete process.env.CAPTCHA_PROVIDER
  process.env.NUXT_PUBLIC_CAPTCHA_PROVIDER = 'google'
  process.env.RECAPTCHA_SECRET_KEY = 'google-secret'
  global.fetch = async () =>
    Response.json({
      action: 'register_form',
      score: 0.9,
      success: true
    })

  let createCall: CreateCall | undefined
  const response = await callEndpoint({
    body: {
      captchaToken: 'valid-token',
      email: ' Customer@Example.com ',
      name: ' Customer ',
      password: 'secret-password',
      passwordConfirm: 'secret-password'
    },
    create: async args => {
      createCall = args
      return {
        email: args.data.email,
        id: 7,
        name: args.data.name
      }
    },
    ip: '192.0.2.20'
  })

  assert.equal(response.status, 201)
  assert.equal(createCall?.collection, 'users')
  assert.deepEqual(createCall?.context, {
    skipFirstUserAdmin: true
  })
  assert.deepEqual(createCall?.data, {
    email: 'customer@example.com',
    name: 'Customer',
    password: 'secret-password',
    roles: ['customer']
  })
  assert.equal(createCall?.overrideAccess, true)
  assert.ok(createCall?.req)
})

test('rejects registration without a CAPTCHA token', async t => {
  t.after(restoreEnvironment)

  delete process.env.CAPTCHA_PROVIDER
  process.env.NUXT_PUBLIC_CAPTCHA_PROVIDER = 'google'
  process.env.RECAPTCHA_SECRET_KEY = 'google-secret'

  let createCalled = false
  const response = await callEndpoint({
    body: {
      email: 'customer@example.com',
      name: 'Customer',
      password: 'secret-password',
      passwordConfirm: 'secret-password'
    },
    create: async () => {
      createCalled = true
      return {
        email: 'customer@example.com',
        id: 7,
        name: 'Customer'
      }
    },
    ip: '192.0.2.21'
  })

  assert.equal(response.status, 400)
  assert.equal(createCalled, false)
})

test('returns a clear error when the email is already registered', async t => {
  t.after(restoreEnvironment)

  process.env.CAPTCHA_PROVIDER = 'google'
  process.env.RECAPTCHA_SECRET_KEY = 'google-secret'
  global.fetch = async () =>
    Response.json({
      action: 'register_form',
      score: 0.9,
      success: true
    })

  const response = await callEndpoint({
    body: {
      captchaToken: 'valid-token',
      email: 'existing@example.com',
      name: 'Existing Customer',
      password: 'secret-password',
      passwordConfirm: 'secret-password'
    },
    create: async () => {
      throw Object.assign(new Error('The following field is invalid: email'), {
        data: {
          errors: [
            {
              message: 'A user with the given email is already registered.',
              path: 'email'
            }
          ]
        },
        status: 400
      })
    },
    ip: '192.0.2.22'
  })

  assert.equal(response.status, 409)
  assert.deepEqual(await response.json(), {
    error: 'A user with this email is already registered.'
  })
})

test('blocks direct public user creation through the Payload collection endpoint', async () => {
  const access = Users.access?.create
  assert.equal(typeof access, 'function')

  if (typeof access !== 'function') {
    return
  }

  assert.equal(
    await access({ req: { user: undefined } } as unknown as Parameters<typeof access>[0]),
    false
  )
  assert.equal(
    await access({
      req: { user: { roles: ['customer'] } }
    } as unknown as Parameters<typeof access>[0]),
    false
  )
  assert.equal(
    await access({
      req: { user: { roles: ['admin'] } }
    } as unknown as Parameters<typeof access>[0]),
    true
  )
})
