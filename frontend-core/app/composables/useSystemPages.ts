import systemPagesQuery from '@/graphql/systemPages.graphql?raw'

interface SystemPagesQueryResponse {
  Pages?: {
    docs: {
      slug: string
      systemRole: string
    }[]
  }
}

/**
 * Fetch and cache system pages slugs
 */
export async function useSystemPages() {
  const systemPages = useState<Record<string, string>>('systemPages', () => ({}))

  if (Object.keys(systemPages.value).length === 0) {
    const data = await usePayloadQuery<SystemPagesQueryResponse>(systemPagesQuery)
    if (data?.Pages?.docs) {
      const map: Record<string, string> = {}
      for (const doc of data.Pages.docs) {
        if (doc.systemRole && doc.systemRole !== 'none') {
          map[doc.systemRole] = doc.slug
        }
      }
      systemPages.value = map
    }
  }

  return systemPages
}
