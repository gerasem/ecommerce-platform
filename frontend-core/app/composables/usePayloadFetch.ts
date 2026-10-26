function mergeHeaders(
  requestHeaders: Record<string, string | undefined>,
  optionHeaders?: HeadersInit
): Headers {
  const merged = new Headers()

  for (const [name, value] of Object.entries(requestHeaders)) {
    if (value) merged.set(name, value)
  }
  new Headers(optionHeaders).forEach((value, name) => merged.set(name, value))

  return merged
}

/**
 * Wrapper around $fetch for Payload CMS API calls (non-reactive)
 * Useful for actions like form submissions, login, etc.
 */
type PayloadFetchOptions = NonNullable<Parameters<typeof $fetch>[1]>

export async function $payloadFetch<T>(url: string, options: PayloadFetchOptions = {}) {
  const config = useRuntimeConfig()
  const headers = useRequestHeaders(['cookie'])

  const mergedOptions: PayloadFetchOptions = {
    ...options,
    baseURL: (import.meta.server ? config.payloadUrl : config.public.payloadUrl) as string,
    credentials: 'include',
    headers: mergeHeaders(headers, options.headers)
  }

  return await $fetch<T>(url, mergedOptions)
}
