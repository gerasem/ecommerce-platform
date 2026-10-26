import systemPagesQuery from '../graphql/systemPages.graphql?raw'

interface SystemPagesQueryResponse {
  Pages?: {
    docs: {
      slug: string
      systemRole: string
    }[]
  }
}

export default defineNuxtPlugin(async () => {
  const { data: systemPages } = await useAsyncData('system-pages', async () => {
    const pages: Record<string, string> = {}

    try {
      const data = await usePayloadQuery<SystemPagesQueryResponse>(systemPagesQuery)
      if (data?.Pages?.docs) {
        for (const doc of data.Pages.docs) {
          if (doc.systemRole && doc.systemRole !== 'none') {
            pages[doc.systemRole] = doc.slug
          }
        }
      }
    } catch (error) {
      console.error('Failed to load system pages', error)
    }

    return pages
  })

  useState<Record<string, string>>('systemPages').value = systemPages.value ?? {}
})
