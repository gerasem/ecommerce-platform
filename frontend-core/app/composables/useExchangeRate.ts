import exchangeRateQuery from '@/graphql/exchangeRate.graphql?raw'
import type { ExchangeRateQuery } from '@/generated/graphql'

export async function useExchangeRate() {
  const nuxtApp = useNuxtApp()
  const data = await usePayloadQuery<ExchangeRateQuery>(exchangeRateQuery, {})
  const rate = data?.ExchangeRate?.rate || 83
  const usdRate = data?.ExchangeRate?.usdRate || 80

  // Store globally so formatEuro can access it synchronously
  // Run with context because we are after an await
  nuxtApp.runWithContext(() => {
    useState<number>('exchangeRate').value = rate
    useState<number>('usdExchangeRate').value = usdRate
  })

  return rate
}
