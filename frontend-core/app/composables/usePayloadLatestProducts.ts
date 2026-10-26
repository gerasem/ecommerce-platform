import latestProductsQuery from '@/graphql/latestProducts.graphql?raw'
import type { LatestProductsQuery } from '@/generated/graphql'

/**
 * Fetch latest products, limited to max items, sorted by createdAt descending
 */
export async function usePayloadLatestProducts(limit: number = 50) {
  const data = await usePayloadQuery<LatestProductsQuery>(latestProductsQuery, {
    limit
  })

  return data?.Products?.docs || []
}
