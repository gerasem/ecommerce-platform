import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  applyPercentageDiscount,
  calculateRubShipping,
  calculateShippingInCheckoutCurrency,
  convertNaturalCurrency,
  isMinimumOrderAmountMet,
  toMinorUnits
} from './money'

const rates = {
  EUR: 100,
  USD: 90
}

describe('natural currency amounts', () => {
  it('converts normal EUR and USD prices to normal RUB amounts', () => {
    assert.equal(convertNaturalCurrency({ amount: 49.99, from: 'EUR', rates, to: 'RUB' }), 4999)
    assert.equal(convertNaturalCurrency({ amount: 25, from: 'USD', rates, to: 'RUB' }), 2250)
  })

  it('applies a percentage discount without rounding to whole currency units', () => {
    assert.equal(applyPercentageDiscount(49.99, 10), 44.99)
  })

  it('compares the free-delivery threshold in normal RUB amounts', () => {
    assert.deepEqual(
      calculateRubShipping({
        cartCurrency: 'RUB',
        freeShippingThresholdRub: 5000,
        rates,
        shippingPriceRub: 500,
        subtotal: 4999
      }),
      {
        isFree: false,
        shippingCost: 500,
        subtotalRub: 4999
      }
    )

    assert.deepEqual(
      calculateRubShipping({
        cartCurrency: 'RUB',
        freeShippingThresholdRub: 5000,
        rates,
        shippingPriceRub: 500,
        subtotal: 5000
      }),
      {
        isFree: true,
        shippingCost: 0,
        subtotalRub: 5000
      }
    )
  })

  it('disables the minimum-order check when its value is zero', () => {
    assert.equal(isMinimumOrderAmountMet({ minimumOrderAmount: 0, subtotal: 1 }), true)
    assert.equal(isMinimumOrderAmountMet({ minimumOrderAmount: 50, subtotal: 49.99 }), false)
    assert.equal(isMinimumOrderAmountMet({ minimumOrderAmount: 50, subtotal: 50 }), true)
  })

  it('does not make shipping free when its threshold is zero', () => {
    assert.deepEqual(
      calculateShippingInCheckoutCurrency({
        freeShippingThreshold: 0,
        shippingPrice: 5,
        subtotal: 100
      }),
      {
        isFree: false,
        shippingCost: 5
      }
    )
  })

  it('keeps Stripe checkout and delivery in normal EUR until the API boundary', () => {
    const delivery = calculateShippingInCheckoutCurrency({
      freeShippingThreshold: 50,
      shippingPrice: 5,
      subtotal: 49.99
    })

    assert.equal(delivery.shippingCost, 5)
    assert.equal(toMinorUnits(49.99 + delivery.shippingCost), 5499)

    const freeDelivery = calculateShippingInCheckoutCurrency({
      freeShippingThreshold: 50,
      shippingPrice: 5,
      subtotal: 50
    })

    assert.equal(freeDelivery.shippingCost, 0)
    assert.equal(freeDelivery.isFree, true)
  })
})
