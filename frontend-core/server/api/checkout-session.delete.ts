/**
 * Clears checkout session data after the order has been confirmed.
 */
export default defineEventHandler(event => {
  deleteCookie(event, 'checkout-session', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  })

  return { success: true }
})
