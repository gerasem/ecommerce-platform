import assert from 'node:assert/strict'
import test from 'node:test'

import { verifyCaptcha } from './captcha'

const originalFetch = global.fetch
const originalServerProvider = process.env.CAPTCHA_PROVIDER
const originalProvider = process.env.NUXT_PUBLIC_CAPTCHA_PROVIDER
const originalGoogleSecret = process.env.RECAPTCHA_SECRET_KEY
const originalYandexSecret = process.env.YANDEX_CAPTCHA_SECRET_KEY

const restoreEnvironment = () => {
  global.fetch = originalFetch

  if (originalServerProvider === undefined) delete process.env.CAPTCHA_PROVIDER
  else process.env.CAPTCHA_PROVIDER = originalServerProvider

  if (originalProvider === undefined) delete process.env.NUXT_PUBLIC_CAPTCHA_PROVIDER
  else process.env.NUXT_PUBLIC_CAPTCHA_PROVIDER = originalProvider

  if (originalGoogleSecret === undefined) delete process.env.RECAPTCHA_SECRET_KEY
  else process.env.RECAPTCHA_SECRET_KEY = originalGoogleSecret

  if (originalYandexSecret === undefined) delete process.env.YANDEX_CAPTCHA_SECRET_KEY
  else process.env.YANDEX_CAPTCHA_SECRET_KEY = originalYandexSecret
}

test('verifies the configured Google or Yandex CAPTCHA provider', async t => {
  t.after(restoreEnvironment)

  await t.test('Google reCAPTCHA v3', async () => {
    delete process.env.CAPTCHA_PROVIDER
    process.env.NUXT_PUBLIC_CAPTCHA_PROVIDER = 'google'
    process.env.RECAPTCHA_SECRET_KEY = 'google-secret'
    delete process.env.YANDEX_CAPTCHA_SECRET_KEY

    global.fetch = async (_input, init) => {
      assert.equal(init?.method, 'POST')
      assert.match(String(init?.body), /secret=google-secret/)
      assert.match(String(init?.body), /response=google-token/)

      return Response.json({
        action: 'register_form',
        score: 0.9,
        success: true
      })
    }

    assert.equal(
      await verifyCaptcha({
        expectedAction: 'register_form',
        ip: '192.0.2.10',
        requireConfigured: true,
        token: 'google-token'
      }),
      null
    )
  })

  await t.test('Yandex SmartCaptcha', async () => {
    delete process.env.CAPTCHA_PROVIDER
    process.env.NUXT_PUBLIC_CAPTCHA_PROVIDER = 'yandex'
    process.env.YANDEX_CAPTCHA_SECRET_KEY = 'yandex-secret'
    delete process.env.RECAPTCHA_SECRET_KEY

    global.fetch = async (input, init) => {
      assert.equal(String(input), 'https://smartcaptcha.cloud.yandex.ru/validate')
      assert.equal(init?.method, 'POST')
      assert.equal(
        new Headers(init?.headers).get('Content-Type'),
        'application/x-www-form-urlencoded'
      )

      const body = new URLSearchParams(String(init?.body))
      assert.equal(body.get('secret'), 'yandex-secret')
      assert.equal(body.get('token'), 'yandex-token')
      assert.equal(body.get('ip'), '192.0.2.11')

      return Response.json({ status: 'ok' })
    }

    assert.equal(
      await verifyCaptcha({
        ip: '192.0.2.11',
        requireConfigured: true,
        token: 'yandex-token'
      }),
      null
    )
  })
})

test('reports an expired Yandex token separately', async t => {
  t.after(restoreEnvironment)

  process.env.CAPTCHA_PROVIDER = 'yandex'
  process.env.YANDEX_CAPTCHA_SECRET_KEY = 'yandex-secret'
  global.fetch = async () =>
    Response.json({
      message: 'Invalid or expired Token.',
      status: 'failed'
    })

  assert.deepEqual(
    await verifyCaptcha({
      ip: '192.0.2.13',
      requireConfigured: true,
      token: 'expired-token'
    }),
    {
      error: 'Captcha expired. Please complete it again.',
      status: 400
    }
  )
})

test('fails closed when registration CAPTCHA is not configured', async t => {
  t.after(restoreEnvironment)

  delete process.env.CAPTCHA_PROVIDER
  process.env.NUXT_PUBLIC_CAPTCHA_PROVIDER = 'google'
  delete process.env.RECAPTCHA_SECRET_KEY

  assert.deepEqual(
    await verifyCaptcha({
      ip: '192.0.2.12',
      requireConfigured: true,
      token: 'token'
    }),
    {
      error: 'Captcha is not configured',
      status: 503
    }
  )
})
