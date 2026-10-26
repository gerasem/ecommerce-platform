import { ref, computed } from 'vue'

interface SmartCaptchaApi {
  render: (
    containerId: string,
    options: { sitekey: string; callback: (token: string) => void; hl?: 'ru' | 'en' }
  ) => number
  reset: (widgetId: number) => void
}

interface GoogleRecaptchaApi {
  execute: (siteKey: string, options: { action: string }) => Promise<string>
}

declare global {
  interface Window {
    smartCaptcha?: SmartCaptchaApi
    grecaptcha?: GoogleRecaptchaApi
  }
}

export const useCaptcha = () => {
  const config = useRuntimeConfig()
  const { locale } = useI18n()
  const captchaProvider = config.public.captchaProvider
  const recaptchaSiteKey = config.public.recaptchaSiteKey
  const yandexCaptchaSiteKey = config.public.yandexCaptchaSiteKey

  const shouldLoadCaptcha = ref(false)
  const yandexCaptchaToken = ref('')
  const yandexWidgetId = ref<number | undefined>(undefined)
  const captchaLanguage = computed<'ru' | 'en'>(() => (locale.value === 'ru' ? 'ru' : 'en'))

  const captchaScripts = computed(() => {
    if (!shouldLoadCaptcha.value) return []
    if (captchaProvider === 'yandex' && yandexCaptchaSiteKey) {
      return [
        {
          src: `https://smartcaptcha.yandexcloud.net/captcha.js?render=onload`,
          async: true,
          defer: true
        }
      ]
    } else if (captchaProvider === 'google' && recaptchaSiteKey) {
      return [
        {
          src: `https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`,
          async: true,
          defer: true
        }
      ]
    }
    return []
  })

  useHead({
    script: captchaScripts
  })

  const renderYandexCaptcha = (containerId: string) => {
    if (import.meta.client && captchaProvider === 'yandex' && yandexCaptchaSiteKey) {
      const checkAndRender = () => {
        if (window.smartCaptcha && yandexWidgetId.value === undefined) {
          yandexWidgetId.value = window.smartCaptcha.render(containerId, {
            sitekey: yandexCaptchaSiteKey,
            hl: captchaLanguage.value,
            callback: (token: string) => {
              yandexCaptchaToken.value = token
            }
          })
        } else if (yandexWidgetId.value === undefined) {
          setTimeout(checkAndRender, 100)
        }
      }
      checkAndRender()
    }
  }

  const resetYandexCaptcha = () => {
    if (import.meta.client && captchaProvider === 'yandex' && yandexWidgetId.value !== undefined) {
      window.smartCaptcha?.reset(yandexWidgetId.value)
      yandexCaptchaToken.value = ''
    }
  }

  const executeCaptcha = async (action: string = 'submit'): Promise<string> => {
    shouldLoadCaptcha.value = true

    if (captchaProvider === 'yandex' && yandexCaptchaSiteKey) {
      if (!yandexCaptchaToken.value) {
        throw new Error('Please complete the CAPTCHA')
      }
      return yandexCaptchaToken.value
    } else if (captchaProvider === 'google' && recaptchaSiteKey) {
      return new Promise<string>((resolve, reject) => {
        const checkGrecaptcha = () => {
          if (window.grecaptcha) {
            resolve(window.grecaptcha.execute(recaptchaSiteKey, { action }))
          } else {
            setTimeout(checkGrecaptcha, 100)
          }
        }
        checkGrecaptcha()
        setTimeout(() => reject(new Error('reCAPTCHA timeout')), 10000)
      })
    }
    return ''
  }

  return {
    shouldLoadCaptcha,
    executeCaptcha,
    captchaProvider,
    hasCaptcha:
      (captchaProvider === 'yandex' && yandexCaptchaSiteKey) ||
      (captchaProvider === 'google' && recaptchaSiteKey),
    renderYandexCaptcha,
    resetYandexCaptcha,
    yandexCaptchaToken
  }
}
