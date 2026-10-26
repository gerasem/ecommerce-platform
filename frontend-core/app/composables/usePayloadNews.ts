import newsQuery from '@/graphql/news.graphql?raw'
import type { NewsListQuery } from '@/generated/graphql'

/**
 * Fetch latest news, limited to max items, sorted by publishedOn descending
 */
export async function usePayloadNews(limit: number = 3) {
  const config = useRuntimeConfig()
  if (!config.public.enableNews) return []

  const data = await usePayloadQuery<NewsListQuery>(newsQuery, {
    limit
  })

  return data?.allNews?.docs || []
}
