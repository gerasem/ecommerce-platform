import { defineStore } from 'pinia'

interface User {
  id: number
  email: string
  name?: string
  surname?: string
  roles?: string[]
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const loggedIn = computed(() => !!user.value)
  const loading = ref(false)

  // Helper for API calls was replaced by usePayloadFetch

  async function login(email: string, password: string) {
    loading.value = true
    try {
      // $fetch throws on error automatically
      const data = await $payloadFetch<{ user: User; token?: string }>('/api/users/login', {
        method: 'POST',
        body: { email, password }
      })

      if (data?.user) {
        user.value = data.user
        if (data.token) token.value = data.token
      }
    } catch (err: unknown) {
      console.error('Login error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    try {
      await $payloadFetch('/api/users/logout', { method: 'POST' })
      user.value = null
      token.value = null
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      loading.value = false
    }
  }

  async function register(email: string, password: string, name: string, captchaToken: string) {
    loading.value = true
    try {
      await $payloadFetch('/api/register', {
        method: 'POST',
        body: { email, password, passwordConfirm: password, name, captchaToken }
      })
      // Auto login after registration
      await login(email, password)
    } catch (err: unknown) {
      console.error('Registration error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function forgotPassword(email: string) {
    loading.value = true
    try {
      await $payloadFetch('/api/users/forgot-password', {
        method: 'POST',
        body: { email }
      })
    } catch (err: unknown) {
      console.error('Forgot password error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchUser(headers: Record<string, string> = {}) {
    try {
      const data = await $payloadFetch<{ user: User }>('/api/users/me', {
        headers
      })
      if (data?.user) {
        user.value = data.user
      } else {
        user.value = null
      }
    } catch {
      user.value = null
    }
  }

  return {
    user,
    token,
    loggedIn,
    loading,
    login,
    logout,
    register,
    forgotPassword,
    fetchUser
  }
})
