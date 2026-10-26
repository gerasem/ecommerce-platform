/**
 * Reads checkout session data stored in the httpOnly cookie.
 * Called by the payment success page to retrieve data needed for order confirmation.
 * The cookie is cleared separately only after the backend confirms the order,
 * allowing a transient confirmation failure to be retried safely.
 */
export default defineEventHandler(async event => {
  const raw = getCookie(event, 'checkout-session')

  if (!raw) {
    return {
      customerEmail: '',
      cartID: '',
      cartSecret: '',
      referralCode: ''
    }
  }

  try {
    return JSON.parse(raw)
  } catch {
    return {
      customerEmail: '',
      cartID: '',
      cartSecret: '',
      referralCode: ''
    }
  }
})
