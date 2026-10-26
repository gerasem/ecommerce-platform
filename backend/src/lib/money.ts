export type CurrencyCode = 'EUR' | 'RUB' | 'USD'

export type ExchangeRatesToRub = {
  EUR: number
  USD: number
}

const MONEY_DECIMALS = 2

const assertFiniteNumber = (value: number, name: string): void => {
  if (!Number.isFinite(value)) {
    throw new Error(`${name} must be a finite number`)
  }
}

const getRateToRub = (currency: CurrencyCode, rates: ExchangeRatesToRub): number => {
  if (currency === 'RUB') return 1

  const rate = rates[currency]
  assertFiniteNumber(rate, `${currency} exchange rate`)

  if (rate <= 0) {
    throw new Error(`${currency} exchange rate must be greater than zero`)
  }

  return rate
}

export const roundMoney = (amount: number, decimals = MONEY_DECIMALS): number => {
  assertFiniteNumber(amount, 'Money amount')
  const multiplier = 10 ** decimals

  return Math.round((amount + Number.EPSILON) * multiplier) / multiplier
}

/**
 * Catalog prices and delivery settings are stored in normal currency units.
 * Convert to minor units only when an external API (for example Stripe) requires it.
 */
export const toMinorUnits = (amount: number, decimals = MONEY_DECIMALS): number => {
  assertFiniteNumber(amount, 'Money amount')

  return Math.round((amount + Number.EPSILON) * 10 ** decimals)
}

export const convertNaturalCurrency = ({
  amount,
  from,
  rates,
  to
}: {
  amount: number
  from: CurrencyCode
  rates: ExchangeRatesToRub
  to: CurrencyCode
}): number => {
  assertFiniteNumber(amount, 'Money amount')

  if (from === to) return roundMoney(amount)

  const amountInRub = amount * getRateToRub(from, rates)
  const converted = amountInRub / getRateToRub(to, rates)

  return roundMoney(converted)
}

export const applyPercentageDiscount = (amount: number, percentage: number): number => {
  assertFiniteNumber(amount, 'Money amount')
  assertFiniteNumber(percentage, 'Discount percentage')

  const safePercentage = Math.min(100, Math.max(0, percentage))

  return roundMoney(amount * (1 - safePercentage / 100))
}

export const calculateRubShipping = ({
  cartCurrency,
  freeShippingThresholdRub,
  rates,
  shippingPriceRub,
  subtotal
}: {
  cartCurrency: CurrencyCode
  freeShippingThresholdRub?: null | number
  rates: ExchangeRatesToRub
  shippingPriceRub?: null | number
  subtotal: number
}): {
  isFree: boolean
  shippingCost: number
  subtotalRub: number
} => {
  assertFiniteNumber(subtotal, 'Cart subtotal')

  const subtotalRub = convertNaturalCurrency({
    amount: subtotal,
    from: cartCurrency,
    rates,
    to: 'RUB'
  })

  const hasFreeShippingThreshold =
    typeof freeShippingThresholdRub === 'number' &&
    Number.isFinite(freeShippingThresholdRub) &&
    freeShippingThresholdRub > 0

  const isFree = hasFreeShippingThreshold && subtotalRub >= freeShippingThresholdRub

  if (
    isFree ||
    typeof shippingPriceRub !== 'number' ||
    !Number.isFinite(shippingPriceRub) ||
    shippingPriceRub <= 0
  ) {
    return {
      isFree,
      shippingCost: 0,
      subtotalRub
    }
  }

  return {
    isFree: false,
    shippingCost: convertNaturalCurrency({
      amount: shippingPriceRub,
      from: 'RUB',
      rates,
      to: cartCurrency
    }),
    subtotalRub
  }
}

export const calculateShippingInCheckoutCurrency = ({
  freeShippingThreshold,
  shippingPrice,
  subtotal
}: {
  freeShippingThreshold?: null | number
  shippingPrice?: null | number
  subtotal: number
}): {
  isFree: boolean
  shippingCost: number
} => {
  assertFiniteNumber(subtotal, 'Cart subtotal')

  const hasFreeShippingThreshold =
    typeof freeShippingThreshold === 'number' &&
    Number.isFinite(freeShippingThreshold) &&
    freeShippingThreshold > 0
  const isFree = hasFreeShippingThreshold && subtotal >= freeShippingThreshold

  if (
    isFree ||
    typeof shippingPrice !== 'number' ||
    !Number.isFinite(shippingPrice) ||
    shippingPrice <= 0
  ) {
    return {
      isFree,
      shippingCost: 0
    }
  }

  return {
    isFree: false,
    shippingCost: roundMoney(shippingPrice)
  }
}

export const isMinimumOrderAmountMet = ({
  minimumOrderAmount,
  subtotal
}: {
  minimumOrderAmount?: null | number
  subtotal: number
}): boolean => {
  assertFiniteNumber(subtotal, 'Cart subtotal')

  if (
    typeof minimumOrderAmount !== 'number' ||
    !Number.isFinite(minimumOrderAmount) ||
    minimumOrderAmount <= 0
  ) {
    return true
  }

  return subtotal >= minimumOrderAmount
}
