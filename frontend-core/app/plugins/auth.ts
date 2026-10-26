import { useUserStore } from '../stores/useUserStore'
import type { Pinia } from 'pinia'

export default defineNuxtPlugin({
  name: 'auth',
  dependsOn: ['pinia'],
  async setup(nuxtApp) {
    // Pass pinia instance directly to avoid getActivePinia errors during SSR
    const userStore = useUserStore(nuxtApp.$pinia as Pinia)

    // Fetch user if not already logged in
    // This runs on server (for SSR) and client (initial load)
    if (!userStore.loggedIn) {
      try {
        const headers = useRequestHeaders(['cookie'])
        await userStore.fetchUser(headers)
      } catch (e) {
        console.error('Auth plugin error:', e)
      }
    }
  }
})
