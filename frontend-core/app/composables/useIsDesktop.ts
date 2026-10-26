const DESKTOP_MEDIA_QUERY = '(min-width: 768px)'

export function useIsDesktop() {
  const isDesktop = ref(true)
  let mediaQuery: MediaQueryList | undefined

  const update = () => {
    if (mediaQuery) {
      isDesktop.value = mediaQuery.matches
    }
  }

  onMounted(() => {
    mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY)
    update()
    mediaQuery.addEventListener('change', update)
  })

  onUnmounted(() => {
    mediaQuery?.removeEventListener('change', update)
  })

  return readonly(isDesktop)
}
