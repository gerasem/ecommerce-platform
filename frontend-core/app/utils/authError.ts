import { getApiErrorMessage } from './checkoutError'

export function getAuthErrorTranslationKey(error: unknown): string {
  const message = getApiErrorMessage(error).toLowerCase()

  if (
    message.includes('already registered') ||
    message.includes('value must be unique') ||
    message.includes('following field is invalid: email')
  ) {
    return 'A user with this email is already registered.'
  }

  if (message.includes('captcha expired') || message.includes('invalid or expired token')) {
    return 'Captcha expired. Please complete it again.'
  }

  if (message.includes('captcha verification failed')) {
    return 'Captcha verification failed'
  }

  if (message.includes('captcha is required') || message.includes('complete the captcha')) {
    return 'Please complete the CAPTCHA'
  }

  if (
    message.includes('captcha is not configured') ||
    message.includes('captcha provider is not configured') ||
    message.includes('captcha verification service is unavailable')
  ) {
    return 'Registration is temporarily unavailable. Please try again later.'
  }

  if (message.includes('too many registration attempts') || message.includes('rate limit')) {
    return 'Too many registration attempts. Please try again later.'
  }

  if (message.includes('invalid registration data')) {
    return 'Please check the entered data and try again.'
  }

  if (
    message.includes('failed to fetch') ||
    message.includes('network error') ||
    message.includes('load failed') ||
    message.includes('fetch failed')
  ) {
    return 'Could not connect to the server. Please check your connection and try again.'
  }

  return 'Registration failed'
}
