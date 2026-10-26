<script setup lang="ts">
import type { RawHtmlBlock } from '@/generated/graphql'

defineProps<{
  block: RawHtmlBlock
}>()
</script>

<template>
  <div class="raw-html-block w-full" v-html="block.html" />
</template>
