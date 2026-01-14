<script setup lang="ts">
import { computed, ref } from 'vue';
import type { HistoryItem } from '../types';
import InterviewFileViewer from './InterviewFileViewer.vue';

const props = defineProps<{
  item: HistoryItem;
}>();

const isOpen = ref(false);

const timestampLabel = computed(() =>
  new Date(props.item.timestamp).toLocaleTimeString()
);
</script>

<template>
  <div class="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-all">
    <button
      type="button"
      @click="isOpen = !isOpen"
      class="w-full text-left p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
    >
      <div class="overflow-hidden">
        <div class="flex items-center gap-2 mb-1">
          <span
            :class="[
              'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full',
              item.question.type === 'Theory'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-orange-100 text-orange-700'
            ]"
          >
            {{ item.question.type }}
          </span>
          <span class="text-xs font-mono text-gray-400">
            {{ timestampLabel }} • {{ item.question.topic }} • {{ item.question.complexity }}
          </span>
        </div>
        <p class="font-medium text-gray-700 dark:text-gray-300 line-clamp-1">
          {{ item.question.text }}
        </p>
      </div>
      <div class="flex items-center gap-3">
        <div
          :class="[
            'px-3 py-1 rounded-full text-xs font-bold',
            item.evaluation.isCorrect
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          ]"
        >
          {{ item.evaluation.isCorrect ? 'Pass' : 'Review' }}
        </div>
        <svg
          class="w-5 h-5 text-gray-400 transition-transform"
          :class="isOpen ? 'rotate-180' : ''"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </button>

    <div
      v-if="isOpen"
      class="p-4 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-700 text-sm space-y-6 animate-fade-in"
    >
      <div>
        <h4 class="font-bold text-gray-800 dark:text-gray-200 mb-1">Question</h4>
        <p class="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
          {{ item.question.text }}
        </p>
      </div>

      <div>
        <h4 class="font-bold text-gray-800 dark:text-gray-200 mb-1">Your Submission</h4>
        <div
          v-if="item.question.type === 'Theory'"
          class="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 whitespace-pre-wrap italic"
        >
          {{ item.submittedText || '(No text provided)' }}
        </div>
        <InterviewFileViewer v-else :files="item.submittedFiles" />
      </div>

      <div>
        <h4 class="font-bold text-gray-800 dark:text-gray-200 mb-1">Feedback</h4>
        <div
          :class="[
            'p-3 rounded border',
            item.evaluation.isCorrect
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          ]"
        >
          <p class="text-gray-700 dark:text-gray-300">{{ item.evaluation.feedback }}</p>
          <div v-if="item.evaluation.improvedCode" class="mt-3">
            <p class="text-xs font-semibold uppercase opacity-70 mb-1">Suggested Improvement:</p>
            <pre class="bg-black/10 dark:bg-black/30 p-2 rounded text-xs font-mono overflow-x-auto">{{ item.evaluation.improvedCode }}</pre>
          </div>
        </div>
      </div>

      <div>
        <h4 class="font-bold text-gray-800 dark:text-gray-200 mb-1">Reference Solution</h4>
        <div class="bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded border border-yellow-100 dark:border-yellow-900/30 text-gray-700 dark:text-gray-300">
          {{ item.question.referenceAnswer }}
        </div>
      </div>
    </div>
  </div>
</template>
