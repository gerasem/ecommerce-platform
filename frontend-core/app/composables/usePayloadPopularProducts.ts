import popularProductsQuery from '@/graphql/popularProducts.graphql?raw'
import type { PopularProductsQuery } from '@/generated/graphql'

/**
 * Fetch popular products, limited to max items, sorted by createdAt
 */
export async function usePayloadPopularProducts(limit: number = 8) {
  const data = await usePayloadQuery<PopularProductsQuery>(popularProductsQuery, {
    limit
  })

  return data?.Products?.docs || []
}
