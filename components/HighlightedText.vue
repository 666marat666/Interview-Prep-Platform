<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  text: string;
  highlight: string;
}>();

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parts = computed(() => {
  const term = props.highlight.trim();
  if (!term) {
    return [{ text: props.text, match: false }];
  }
  const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
  return props.text.split(regex).map((part) => ({
    text: part,
    match: part.toLowerCase() === term.toLowerCase()
  }));
});
</script>

<template>
  <span>
    <template v-for="(part, idx) in parts" :key="idx">
      <span
        v-if="part.match"
        class="bg-yellow-200 dark:bg-yellow-900/50 text-gray-900 dark:text-white font-bold px-0.5 rounded"
      >
        {{ part.text }}
      </span>
      <span v-else>{{ part.text }}</span>
    </template>
  </span>
</template>
