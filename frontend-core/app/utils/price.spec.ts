import { describe, it, expect } from 'vitest'

// Import functions to test
import { formatPrice, getMinPrice, areAllPricesEqual } from './price'

describe('Price Utils', () => {
  describe('formatPrice', () => {
    it('should format EUR without conversion', () => {
      const res = formatPrice(1, 'EUR')
      expect(res.replace(/\s/g, '')).toContain('1,00')
      expect(res).toContain('€')
    })

    it('should format USD without conversion', () => {
      const res = formatPrice(1, 'USD')
      expect(res.replace(/\s/g, '')).toContain('1,00')
      expect(res).toContain('$')
    })

    it('should format RUB to RUB correctly', () => {
      const res = formatPrice(100, 'RUB')
      expect(res.replace(/\s/g, '')).toContain('100,00')
    })

    it('should return default dash for null values', () => {
      expect(formatPrice(null)).toBe('—')
    })
  })

  describe('getMinPrice', () => {
    it('should ignore EUR fields if baseCurrency is USD', () => {
      const product = {
        baseCurrency: 'USD' as const,
        priceInUSD: 10,
        priceInEUR: 9,
        enableVariants: true,
        variants: {
          docs: [
            { priceInUSD: 5, priceInEUR: 4 },
            { priceInUSD: 15, priceInEUR: 1 }
          ]
        }
      }
      const result = getMinPrice(product)
      expect(result).toBe(5)
    })

    it('should ignore USD fields if baseCurrency is EUR', () => {
      const product = {
        baseCurrency: 'EUR' as const,
        priceInUSD: 1,
        priceInEUR: 9,
        enableVariants: true,
        variants: {
          docs: [
            { priceInUSD: 0.5, priceInEUR: 4 },
            { priceInUSD: 0.1, priceInEUR: 15 }
          ]
        }
      }
      const result = getMinPrice(product)
      expect(result).toBe(4)
    })
  })

  describe('areAllPricesEqual', () => {
    it('should return true if only USD fields match and EUR differ (when USD is base)', () => {
      const product = {
        baseCurrency: 'USD' as const,
        priceInUSD: 1000,
        priceInEUR: 900,
        enableVariants: true,
        variants: {
          docs: [
            { priceInUSD: 1000, priceInEUR: 400 },
            { priceInUSD: 1000, priceInEUR: 100 }
          ]
        }
      }
      expect(areAllPricesEqual(product)).toBe(true)
    })

    it('should return false if USD fields differ (when USD is base)', () => {
      const product = {
        baseCurrency: 'USD' as const,
        priceInUSD: 1000,
        priceInEUR: 900,
        enableVariants: true,
        variants: {
          docs: [
            { priceInUSD: 1000, priceInEUR: 900 },
            { priceInUSD: 1500, priceInEUR: 900 }
          ]
        }
      }
      expect(areAllPricesEqual(product)).toBe(false)
    })
  })
})
