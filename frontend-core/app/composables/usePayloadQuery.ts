import { useUserStore } from '../stores/useUserStore'

interface GraphQLError {
  message?: string
}

interface ErrorWithMessage {
  message?: string
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const { message } = error as ErrorWithMessage
    if (typeof message === 'string') return message
  }
  return ''
}

/**
 * Generic GraphQL query helper using $fetch
 * Automatically includes locale from i18n
 * Shows toast notifications on errors
 */
export async function usePayloadQuery<T = unknown>(
  query: string,
  variables: Record<string, unknown> = {},
  nuxtApp = useNuxtApp()
): Promise<T | null> {
  return nuxtApp.runWithContext(async () => {
    const config = useRuntimeConfig()

    // Safe access to i18n
    const i18n = nuxtApp.$i18n
    const locale = unref(i18n.locale)
    const toast = useToast()

    try {
      const userStore = useUserStore()
      const authHeaders: Record<string, string> = {}
      if (userStore.token) {
        authHeaders['Authorization'] = `JWT ${userStore.token}`
      }

      const response = await $fetch<{ data: T; errors?: GraphQLError[] }>(
        `${import.meta.server ? config.payloadUrl : config.public.payloadUrl}/api/graphql`,
        {
          method: 'POST',
          credentials: 'include', // Send Payload auth cookie (payload-token) with requests
          headers: authHeaders,
          body: {
            query,
            variables: {
              ...variables,
              locale
            }
          }
        }
      )

      if (response.errors) {
        const errorMessage = response.errors[0]?.message || 'GraphQL query failed'
        console.error('GraphQL errors:', response.errors)

        if (import.meta.client) {
          toast.add({
            id: `graphql-error-${Date.now()}`,
            title: 'API Error',
            description: errorMessage,
            color: 'error',
            actions: [
              {
                label: 'Reload Page',
                onClick: () => window.location.reload()
              }
            ]
          })
        }

        // Return null instead of throwing
        return null
      }

      return response.data
    } catch (error: unknown) {
      // Handle network errors and other fetch errors
      console.error('Payload API error:', error)
      const errorMessage = getErrorMessage(error)

      // Only show toast if it's not already a GraphQL error (to avoid duplicate toasts)
      if (import.meta.client && !errorMessage.includes('GraphQL')) {
        toast.add({
          id: `api-error-${Date.now()}`,
          title: 'Connection Error',
          description: errorMessage || 'Failed to connect to API',
          color: 'error',
          actions: []
        })
      }

      // Return null instead of throwing to prevent app crash
      return null
    }
  })
}
