<script setup lang="ts">
import { computed } from 'vue';
import { useLogStore } from '../store/logStore';

const { entries, clearLogs } = useLogStore();

const sortedEntries = computed(() => [...entries.value].reverse());

const formatTime = (timestamp: number) => new Date(timestamp).toLocaleTimeString();
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-gray-800 dark:text-white">Logs</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Error details from Gemini requests (current session only).
          </p>
        </div>
        <button
          type="button"
          @click="clearLogs"
          class="text-xs font-semibold text-red-500 hover:text-red-600 hover:underline transition-all"
        >
          Clear Logs
        </button>
      </div>
    </div>

    <div v-if="sortedEntries.length === 0" class="text-center py-12 opacity-60">
      <p class="text-gray-600 dark:text-gray-400">No logs yet.</p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="entry in sortedEntries"
        :key="entry.id"
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden"
      >
        <div class="p-4 flex items-start justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span
                :class="[
                  'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full',
                  entry.level === 'error'
                    ? 'bg-red-100 text-red-700'
                    : entry.level === 'warn'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-blue-100 text-blue-700'
                ]"
              >
                {{ entry.level }}
              </span>
              <span class="text-xs font-mono text-gray-400">
                {{ formatTime(entry.timestamp) }}
              </span>
              <span v-if="entry.context" class="text-xs text-gray-400">
                • {{ entry.context }}
              </span>
            </div>
            <p class="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {{ entry.message }}
            </p>
          </div>
        </div>
        <div v-if="entry.detail" class="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4">
          <pre class="text-xs font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ entry.detail }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>
