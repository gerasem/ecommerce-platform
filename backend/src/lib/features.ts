const readBooleanEnv = (name: string, defaultValue = false): boolean => {
  const value = process.env[name]
  if (value === undefined) return defaultValue

  return value.trim().toLowerCase() === 'true'
}

export type PaymentProvider = 'kustom' | 'none' | 'stripe'

const readPaymentProvider = (): PaymentProvider => {
  const legacyProvider = readBooleanEnv('ENABLE_STRIPE') ? 'stripe' : 'none'
  const value = (process.env.PAYMENT_PROVIDER || legacyProvider).trim().toLowerCase()

  if (value === 'kustom' || value === 'none' || value === 'stripe') return value

  throw new Error('PAYMENT_PROVIDER must be one of: none, stripe, kustom')
}

const paymentProvider = readPaymentProvider()

/**
 * Deployment-level capabilities. These values are read once when Payload starts,
 * so changing them requires restarting the backend container.
 */
export const features = Object.freeze({
  coupons: readBooleanEnv('ENABLE_COUPONS'),
  enableInventory: readBooleanEnv('ENABLE_INVENTORY'),
  enableRelatedProducts: readBooleanEnv('ENABLE_RELATED_PRODUCTS', true),
  // ENABLE_STRIPE remains a backwards-compatible fallback for existing stores.
  enableStripe: paymentProvider === 'stripe',
  enableVariants: readBooleanEnv('ENABLE_VARIANTS'),
  generateInvoices: readBooleanEnv('ENABLE_INVOICES'),
  multiCurrency: readBooleanEnv('ENABLE_MULTI_CURRENCY'),
  news: readBooleanEnv('ENABLE_NEWS'),
  paymentProvider,
  referrals: readBooleanEnv('ENABLE_REFERRALS')
})

export type RuntimeFeature = 'coupons' | 'news' | 'referrals'
