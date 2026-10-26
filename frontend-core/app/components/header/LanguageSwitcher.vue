<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const { locales, locale, setLocale } = useI18n()
const switchLocalePath = useSwitchLocalePath()

// Handle language switch with page reload
const switchLanguage = async (localeCode: string) => {
  if (localeCode === locale.value) return

  // Update locale (this updates localStorage)
  await setLocale(localeCode as Parameters<typeof setLocale>[0])

  // Get the new URL and reload
  const newUrl = switchLocalePath(localeCode as Parameters<typeof switchLocalePath>[0])
  window.location.href = newUrl
}

const items = ref<DropdownMenuItem[]>()

const config = useRuntimeConfig()

// Get enabled locales from config, or fallback to all
const enabledLocales = (config.public.enabledLocales as string[]) || []
const activeLocales = computed(() => {
  if (enabledLocales.length > 0) {
    return locales.value.filter(l => enabledLocales.includes(l.code))
  }
  return locales.value
})

// Get current locale name
const currentLocaleName = computed(
  () => activeLocales.value.find(l => l.code === locale.value)?.name || locale.value
)

onMounted(() => {
  items.value = activeLocales.value.map(loc => ({
    label: loc.name,
    value: loc.code,
    color: loc.code === locale.value ? 'primary' : 'neutral',
    onSelect() {
      switchLanguage(loc.code)
    }
  }))
})
</script>

<template>
  <div v-if="activeLocales.length > 1" class="flex items-center gap-1">
    <UDropdownMenu
      :items="items"
      :content="{
        align: 'center',
        side: 'bottom',
        sideOffset: 8
      }"
      :ui="{
        content: 'w-24'
      }"
    >
      <UButton trailing-icon="i-bi-chevron-down" color="neutral" variant="link" size="xl">
        {{ currentLocaleName }}
      </UButton>
    </UDropdownMenu>
  </div>
</template>
