<script setup lang="ts">
import type {
  Page_Layout,
  ContentBlock,
  ConversionBoxesBlock,
  FormBlock,
  RawHtmlBlock
} from '@/generated/graphql'
import FormBlockComponent from './blocks/FormBlock.vue'
import RawHtmlBlockComponent from './blocks/RawHtmlBlock.vue'

defineProps<{
  layout?: Page_Layout[] | null
}>()

// Type guards to help TypeScript understand the union types
// since GraphQL generated types use string for blockType instead of literals
const isContentBlock = (block: Page_Layout | null | undefined): block is ContentBlock =>
  block?.blockType === 'content'
const isConversionBoxesBlock = (
  block: Page_Layout | null | undefined
): block is ConversionBoxesBlock => block?.blockType === 'conversionBoxes'
const isFormBlock = (block: Page_Layout | null | undefined): block is FormBlock =>
  block?.blockType === 'formBlock'
const isRawHtmlBlock = (block: Page_Layout | null | undefined): block is RawHtmlBlock =>
  block?.blockType === 'rawHtml'

// Map the CMS width setting to Tailwind CSS column span classes
function getWidthClass(width?: string | null): string {
  switch (width) {
    case '_1_3':
    case '1/3':
      return 'col-span-12 lg:col-span-4'
    case '_1_2':
    case '1/2':
      return 'col-span-12 lg:col-span-6'
    case '_2_3':
    case '2/3':
      return 'col-span-12 lg:col-span-8'
    case '_1_1':
    case '1/1':
    default:
      return 'col-span-12'
  }
}

function getBlockWidth(block: any): string | null | undefined {
  if (isContentBlock(block)) return (block as any).contentWidth || block.width
  if (isConversionBoxesBlock(block)) return (block as any).boxesWidth || block.width
  if (isFormBlock(block)) return (block as any).formWidth || block.width
  return null
}

function getBlockClass(block: Page_Layout | null | undefined): string | null | undefined {
  if (isContentBlock(block) || isConversionBoxesBlock(block) || isFormBlock(block)) {
    return block.customClass
  }
  return null
}
</script>

<template>
  <div v-if="layout" class="grid grid-cols-12 gap-8">
    <template v-for="block in layout" :key="block?.id">
      <div :class="[getWidthClass(getBlockWidth(block)), getBlockClass(block)]">
        <!-- Content Block -->
        <template v-if="isContentBlock(block) && block.content">
          <ContentRichText :text="richTextToHTML(block.content)" />
        </template>

        <!-- Conversion Boxes Block -->
        <template v-else-if="isConversionBoxesBlock(block) && block.boxes">
          <HomeConversionBoxes :boxes="block.boxes" />
        </template>

        <!-- Form Block -->
        <template v-else-if="isFormBlock(block) && block.form">
          <FormBlockComponent :block="block" />
        </template>

        <!-- Raw HTML Block -->
        <template v-else-if="isRawHtmlBlock(block) && block.html">
          <RawHtmlBlockComponent :block="block" />
        </template>
      </div>
    </template>
  </div>
</template>
