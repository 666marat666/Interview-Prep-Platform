<script setup lang="ts">
import { computed, ref } from 'vue';
import type { TechCategory } from '../types';
import { LEARNING_MODULES } from '../data/learningModules';
import HighlightedText from './HighlightedText.vue';
import SimpleFileViewer from './SimpleFileViewer.vue';

const searchTerm = ref('');
const selectedCategory = ref<TechCategory | 'All'>('All');
const openIds = ref<Set<string>>(new Set());

const toggle = (id: string) => {
  const next = new Set(openIds.value);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  openIds.value = next;
};

const filteredModules = computed(() => {
  const lowerTerm = searchTerm.value.toLowerCase();
  return LEARNING_MODULES.filter((mod) => {
    if (selectedCategory.value !== 'All' && mod.category !== selectedCategory.value) {
      return false;
    }
    if (!searchTerm.value) return true;

    const inTitle = mod.title.toLowerCase().includes(lowerTerm);
    const inDesc = mod.description.toLowerCase().includes(lowerTerm);
    const inExplanation = mod.explanation.toLowerCase().includes(lowerTerm);
    const inCode = mod.files.some((file) => file.content.toLowerCase().includes(lowerTerm));

    return inTitle || inDesc || inExplanation || inCode;
  });
});

const categories: (TechCategory | 'All')[] = ['All', 'React', 'Angular', 'Vue', 'C# .NET', 'General'];

const clearFilters = () => {
  searchTerm.value = '';
  selectedCategory.value = 'All';
};
</script>

<template>
  <div class="space-y-6 animate-fade-in min-h-screen">
    <div class="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 p-8 rounded-3xl border border-blue-100 dark:border-gray-700 shadow-sm">
      <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-2">
        📚 Learning Library
      </h2>
      <p class="text-gray-600 dark:text-gray-300 text-sm mb-6 max-w-2xl">
        Browse our growing collection of tutorials. Compare implementation details across C#, React, Angular, and Vue.
        Use the search bar to find specific concepts like "Dependency Injection" or "Fetch".
      </p>

      <div class="relative max-w-xl">
        <input
          type="text"
          v-model="searchTerm"
          placeholder="Search keywords (e.g., 'JSON', 'Hook', 'Signal')..."
          class="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        />
        <svg class="w-6 h-6 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>

    <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        v-for="cat in categories"
        :key="cat"
        type="button"
        @click="selectedCategory = cat"
        :class="[
          'px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all',
          selectedCategory === cat
            ? 'bg-blue-600 text-white shadow-md'
            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
        ]"
      >
        {{ cat }}
      </button>
    </div>

    <div class="text-sm text-gray-400 font-medium px-2">
      Showing {{ filteredModules.length }} tutorials
    </div>

    <div class="grid gap-4">
      <div
        v-for="mod in filteredModules"
        :key="mod.id"
        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
      >
        <button
          type="button"
          @click="toggle(mod.id)"
          class="w-full text-left p-5 flex justify-between items-start hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
        >
          <div>
            <div class="flex items-center gap-3 mb-2">
              <span
                :class="[
                  'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full',
                  mod.category === 'React'
                    ? 'bg-blue-100 text-blue-700'
                    : mod.category === 'Angular'
                      ? 'bg-red-100 text-red-700'
                      : mod.category === 'Vue'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-purple-100 text-purple-700'
                ]"
              >
                {{ mod.category }}
              </span>
              <span class="text-xs text-gray-400">• {{ mod.difficulty }}</span>
            </div>
            <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-1">
              <HighlightedText :text="mod.title" :highlight="searchTerm" />
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
              <HighlightedText :text="mod.description" :highlight="searchTerm" />
            </p>
          </div>
          <div
            :class="[
              'p-2 rounded-full bg-gray-100 dark:bg-gray-700 transition-transform duration-300',
              openIds.has(mod.id) ? 'rotate-180' : ''
            ]"
          >
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        <div v-if="openIds.has(mod.id)" class="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
          <div class="p-5 border-b border-gray-100 dark:border-gray-700">
            <div class="flex items-center gap-2 mb-3 text-purple-600 dark:text-purple-400 font-bold text-sm uppercase tracking-wide">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Deep Dive Explanation
            </div>
            <div class="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
              <HighlightedText :text="mod.explanation" :highlight="searchTerm" />
            </div>
          </div>

          <div class="p-5">
            <div class="font-bold text-gray-800 dark:text-gray-200 text-sm mb-2">Implementation Example</div>
            <SimpleFileViewer :files="mod.files" :highlight-term="searchTerm" />
          </div>
        </div>
      </div>

      <div v-if="filteredModules.length === 0" class="text-center py-12">
        <p class="text-gray-400 text-lg">No tutorials found matching "{{ searchTerm }}"</p>
        <button type="button" @click="clearFilters" class="mt-2 text-blue-500 hover:underline">
          Clear filters
        </button>
      </div>
    </div>
  </div>
</template>
