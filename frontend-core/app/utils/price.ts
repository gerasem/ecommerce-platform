/**
 * Minimal product shape accepted by price utilities.
 * Works with both IItem (list query) and IProductFull (detail query).
 */
export interface CartPriceItem {
  baseCurrency?: 'EUR' | 'USD' | string | null
  priceInEUR?: number | null
  priceInUSD?: number | null
}

export interface ExchangeRates {
  eurRate: number
  usdRate: number
}

interface ProductLike extends CartPriceItem {
  enableVariants?: boolean | null
  variants?: { docs: Array<{ priceInEUR?: number | null; priceInUSD?: number | null }> } | null
}

/**
 * Format an amount in its natural currency. Store-specific projects can
 * override this utility when their checkout currency is different.
 */
export function formatPrice(
  amount: number | null | undefined,
  currency: 'EUR' | 'USD' | 'RUB' | string | null = 'EUR'
): string {
  if (amount === null || amount === undefined || !Number.isFinite(amount)) return '—'

  const normalizedCurrency = currency === 'USD' || currency === 'RUB' ? currency : 'EUR'
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: normalizedCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

/** Natural amount used by cart totals and category price filters. */
export function getCartItemAmount(item: CartPriceItem, _rates: ExchangeRates): number {
  const amount = item.baseCurrency === 'USD' ? item.priceInUSD : item.priceInEUR
  return amount ?? 0
}

/** Currency used for cart and checkout values in the base project. */
export function getCartCurrency(): 'EUR' | 'USD' | 'RUB' {
  return 'EUR'
}

/**
 * Convert price to a decimal string for structured data (JSON-LD).
 * Example: 49 → "49.00"
 */
export const moneyToDecimal = (amount: number | null | undefined): string =>
  (amount ?? 0).toFixed(2)

/**
 * Get minimum natural price from product and its variants.
 */
export function getMinPrice(product: ProductLike | null | undefined): number | null {
  if (!product) return null

  const baseCurrency = product.baseCurrency === 'USD' ? 'USD' : 'EUR'
  const prices: number[] = []

  // Add base product price
  const basePrice = baseCurrency === 'USD' ? product.priceInUSD : product.priceInEUR
  if (basePrice != null) {
    prices.push(basePrice)
  }

  // Add variant prices
  if (product.enableVariants && product.variants?.docs) {
    for (const variant of product.variants.docs) {
      const variantPrice = baseCurrency === 'USD' ? variant?.priceInUSD : variant?.priceInEUR
      if (variantPrice != null) {
        prices.push(variantPrice)
      }
    }
  }

  return prices.length > 0 ? Math.min(...prices) : null
}

/**
 * Get formatted minimum price
 */
export function getMinPriceFormatted(product: ProductLike | null | undefined): string {
  const minPrice = getMinPrice(product)
  if (minPrice === null) return '—'

  return formatPrice(minPrice, product?.baseCurrency)
}

/**
 * Check if all prices (product + variants) are equal
 */
export function areAllPricesEqual(product: ProductLike | null | undefined): boolean {
  if (!product) return false

  const baseCurrency = product.baseCurrency === 'USD' ? 'USD' : 'EUR'
  const prices: number[] = []

  // Collect all prices
  const basePrice = baseCurrency === 'USD' ? product.priceInUSD : product.priceInEUR
  if (basePrice != null) {
    prices.push(basePrice)
  }

  if (product.enableVariants && product.variants?.docs) {
    for (const variant of product.variants.docs) {
      const variantPrice = baseCurrency === 'USD' ? variant?.priceInUSD : variant?.priceInEUR
      if (variantPrice != null) {
        prices.push(variantPrice)
      }
    }
  }

  if (prices.length === 0) return true

  // Check if all prices are the same
  return prices.every(price => price === prices[0])
}
