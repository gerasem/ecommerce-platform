import { describe, expect, it } from 'vitest'

import { getOrderConfirmationState } from './orderConfirmation'

describe('order confirmation state', () => {
  it('requires an actual confirmation source', () => {
    expect(getOrderConfirmationState({})).toBe('missing')
  })

  it('accepts a completed no-Stripe order', () => {
    expect(getOrderConfirmationState({ completedOrderId: 123 })).toBe('completed-order')
  })

  it('accepts a successful Stripe redirect with a payment intent', () => {
    expect(
      getOrderConfirmationState({
        paymentIntentId: 'pi_123',
        redirectStatus: 'succeeded'
      })
    ).toBe('stripe')
  })

  it('does not accept a successful redirect without a payment intent', () => {
    expect(getOrderConfirmationState({ redirectStatus: 'succeeded' })).toBe('missing')
  })
})
