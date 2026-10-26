/**
 * Composable for mapping Payload CMS link objects to usable link data
 * Handles both internal (reference) and external (custom) links
 */

export interface MappedLink {
  label: string
  href: string
  isExternal: boolean
  openInNewTab: boolean
}

interface PayloadLink {
  link?: {
    type?: 'reference' | 'custom' | null
    label?: string | null
    url?: string | null
    newTab?: boolean | null
    reference?: {
      value?: {
        slug?: string | null
      } | null
    } | null
  } | null
}

/**
 * Maps a Payload CMS link to a usable link object
 *
 * Link types:
 * - reference: Internal links to pages
 * - custom: External URLs (always external, e.g. https://google.com)
 */
export function usePayloadLink(item: PayloadLink | null | undefined): MappedLink | null {
  const localePath = useLocalePath()

  if (!item?.link) return null

  const link = item.link

  // Handle internal reference links (to pages/posts)
  if (link.type === 'reference' && link.reference?.value?.slug) {
    const page = link.reference.value
    const basePath = `/${page.slug}`

    return {
      label: link.label || '',
      href: localePath(basePath),
      isExternal: false,
      openInNewTab: link.newTab === true
    }
  }

  // Handle custom external URLs
  if (link.type === 'custom' && link.url) {
    return {
      label: link.label || '',
      href: link.url,
      isExternal: true, // Always external
      // Open in new tab if explicitly true OR if not explicitly false (default behavior for external)
      openInNewTab: link.newTab === true || link.newTab !== false
    }
  }

  return null
}
