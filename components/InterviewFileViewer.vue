<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { CodeFile } from '../types';

const props = defineProps<{
  files: CodeFile[];
}>();

const activeTab = ref(props.files[0]?.name || '');

watch(
  () => props.files,
  (newFiles) => {
    if (!newFiles?.length) {
      activeTab.value = '';
      return;
    }
    const stillExists = newFiles.some((file) => file.name === activeTab.value);
    if (!stillExists) {
      activeTab.value = newFiles[0]?.name || '';
    }
  },
  { immediate: true }
);

const activeFile = computed(() => {
  return props.files.find((file) => file.name === activeTab.value) || props.files[0];
});
</script>

<template>
  <div v-if="files.length" class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mt-2">
    <div class="flex bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
      <button
        v-for="file in files"
        :key="file.name"
        type="button"
        @click="activeTab = file.name"
        :class="[
          'px-3 py-1 text-xs font-mono border-r border-gray-200 dark:border-gray-700',
          activeFile?.name === file.name
            ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 font-bold'
            : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
        ]"
      >
        {{ file.name }}
      </button>
    </div>
    <div class="bg-gray-900 p-3 overflow-auto max-h-60">
      <pre class="text-xs font-mono text-green-400 whitespace-pre-wrap">{{ activeFile?.content }}</pre>
    </div>
  </div>
</template>
