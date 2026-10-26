/**
 * Build a full image URL from a Payload CMS relative path
 */
export function usePayloadImageUrl(relativePath: string | null | undefined): string {
  if (!relativePath) return ''
  const config = useRuntimeConfig()

  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath
  }
  return `${config.public.payloadUrl}${relativePath}`
}
