<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { CodeFile } from '../types';

const props = defineProps<{
  files: CodeFile[];
  highlightTerm: string;
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
  <div v-if="files.length" class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 mt-4">
    <div class="flex bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
      <button
        v-for="file in files"
        :key="file.name"
        type="button"
        @click="activeTab = file.name"
        :class="[
          'px-4 py-2 text-xs font-mono border-r border-gray-200 dark:border-gray-700 transition-colors whitespace-nowrap',
          activeFile?.name === file.name
            ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 font-bold border-b-2 border-b-blue-500'
            : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
        ]"
      >
        {{ file.name }}
      </button>
    </div>
    <div class="bg-[#1e1e1e] p-4 overflow-auto max-h-[500px]">
      <pre class="text-sm font-mono text-[#d4d4d4] whitespace-pre-wrap">{{ activeFile?.content }}</pre>
    </div>
  </div>
</template>
