import newsBySlugQuery from '@/graphql/newsBySlug.graphql?raw'
import type { NewsBySlugQuery } from '@/generated/graphql'

/**
 * Fetch a single news item by its slug
 */
export async function usePayloadNewsBySlug(slug: string) {
  const config = useRuntimeConfig()
  if (!config.public.enableNews) return null

  const data = await usePayloadQuery<NewsBySlugQuery>(newsBySlugQuery, {
    slug
  })

  const docs = data?.allNews?.docs || []
  return docs.length > 0 ? docs[0] : null
}
