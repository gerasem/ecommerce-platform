<script setup lang="ts">
import { sanitizeSvg } from '@/utils/svg'

const localePath = useLocalePath()

const { data: headerData } = await useAsyncData('payload-header', usePayloadHeader)

const headerPages = computed(() => headerData.value?.headerPages || [])
</script>

<template>
  <div class="lg:mb-16 mb-8">
    <BaseContainer>
      <nav
        v-if="headerPages.length > 0"
        class="hidden lg:block bg-gray-50 mb-6 border-gray-200 rounded-lg"
      >
        <ul class="flex flex-wrap items-center justify-around py-6 gap-2 md:gap-4">
          <!-- Header Pages -->
          <li v-for="page in headerPages" :key="`page-${page.id}`">
            <NuxtLink
              :to="localePath(`/${page.slug}`)"
              class="page-link font-medium text-gray-600 hover:text-primary transition-all"
            >
              {{ page.title }}
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </BaseContainer>
    <!-- Important Notice Block -->
    <BaseContainer
      v-if="headerData?.importantNotice?.showNotice && headerData.importantNotice.noticeText"
      class="w-full mb-6"
    >
      <div
        class="bg-[#FFF9F1] rounded-lg flex items-center justify-center gap-3 p-8 text-center border-[#ffdba5] border-dashed border-2"
      >
        <div
          v-if="headerData.importantNotice.noticeIcon?.svgContent"
          class="w-6 h-6 shrink-0 text-[#DFA44C]"
          v-html="sanitizeSvg(headerData.importantNotice.noticeIcon.svgContent)"
        />
        <div
          class="text-[#DFA44C]"
          v-html="richTextToHTML(headerData.importantNotice.noticeText)"
        />
      </div>
    </BaseContainer>
  </div>
</template>

<style scoped lang="scss">
.page-link {
  &.router-link-active {
    color: var(--color-primary);
  }
}
</style>
