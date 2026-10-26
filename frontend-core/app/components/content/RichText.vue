<script setup lang="ts">
defineProps<{
  text: string
}>()
</script>

<template>
  <div class="my-4 w-full">
    <div class="text-content block w-full" v-html="text" />
  </div>
</template>

<style lang="scss"></style>
