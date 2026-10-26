<script setup lang="ts">
import type { ICategory } from '@/types'

const localePath = useLocalePath()

defineProps<{
  categories: ICategory[]
}>()
</script>

<template>
  <nav class="category-list">
    <ul class="flex flex-col space-y-2">
      <li v-for="category in categories" :key="category.id">
        <NuxtLink
          :to="localePath(`/category/${category.slug}`)"
          class="block py-2 text-gray-700 hover:text-primary transition-colors border-b border-gray-100 last:border-0"
          active-class="!text-primary font-medium"
        >
          {{ category.title }}
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>
