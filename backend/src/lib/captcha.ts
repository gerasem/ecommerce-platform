export type CaptchaVerificationError = {
  error: string
  status: number
}

type VerifyCaptchaArgs = {
  expectedAction?: string
  ip: string
  requireConfigured?: boolean
  token?: string
}

const getProvider = (): 'google' | 'yandex' | null => {
  const provider = (
    process.env.CAPTCHA_PROVIDER ||
    process.env.NUXT_PUBLIC_CAPTCHA_PROVIDER ||
    'google'
  ).toLowerCase()

  if (provider === 'google' || provider === 'yandex') {
    return provider
  }

  return null
}

export const verifyCaptcha = async ({
  expectedAction,
  ip,
  requireConfigured = false,
  token
}: VerifyCaptchaArgs): Promise<CaptchaVerificationError | null> => {
  const provider = getProvider()

  if (!provider) {
    return { error: 'Captcha provider is not configured correctly', status: 503 }
  }

  const secret =
    provider === 'yandex' ? process.env.YANDEX_CAPTCHA_SECRET_KEY : process.env.RECAPTCHA_SECRET_KEY

  if (!secret) {
    return requireConfigured ? { error: 'Captcha is not configured', status: 503 } : null
  }

  if (!token) {
    return { error: 'Captcha is required', status: 400 }
  }

  try {
    if (provider === 'yandex') {
      const body = new URLSearchParams({
        secret,
        token
      })
      if (ip !== 'unknown') {
        body.set('ip', ip)
      }

      const response = await fetch('https://smartcaptcha.cloud.yandex.ru/validate', {
        body,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        method: 'POST'
      })
      const result = (await response.json()) as { message?: string; status?: string }

      if (!response.ok || result.status !== 'ok') {
        if (result.message?.toLowerCase().includes('invalid or expired token')) {
          return { error: 'Captcha expired. Please complete it again.', status: 400 }
        }

        return { error: 'Captcha verification failed', status: 400 }
      }

      return null
    }

    const body = new URLSearchParams({
      response: token,
      secret
    })
    if (ip !== 'unknown') {
      body.set('remoteip', ip)
    }

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      body,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: 'POST'
    })
    const result = (await response.json()) as {
      action?: string
      score?: number
      success?: boolean
    }

    if (
      !response.ok ||
      !result.success ||
      (typeof result.score === 'number' && result.score < 0.5) ||
      (expectedAction && result.action !== expectedAction)
    ) {
      return { error: 'Captcha verification failed', status: 400 }
    }

    return null
  } catch {
    return { error: 'Captcha verification service is unavailable', status: 503 }
  }
}
