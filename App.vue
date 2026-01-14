<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { APP_TITLE } from './constants';
import LearningCenter from './components/LearningCenter.vue';
import InterviewPrep from './components/InterviewPrep.vue';
import LogsPanel from './components/LogsPanel.vue';
import { logInfo } from './store/logStore';

type Tab = 'LEARNING' | 'INTERVIEW' | 'LOGS';
type Theme = 'light' | 'dark';

const activeTab = ref<Tab>('LEARNING');

const theme = ref<Theme>('light');
if (typeof window !== 'undefined' && window.localStorage) {
  const stored = window.localStorage.getItem('theme_preference');
  theme.value = stored === 'dark' || stored === 'light' ? stored : 'light';
}

const applyTheme = (value: Theme) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (value === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem('theme_preference', value);
  }
};

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
  logInfo(`Theme toggled to ${theme.value}`, undefined, 'app');
};

onMounted(() => {
  applyTheme(theme.value);
  logInfo('App mounted', undefined, 'app');
});

watch(theme, (value) => {
  applyTheme(value);
});

watch(activeTab, (value) => {
  logInfo(`Tab switched to ${value}`, undefined, 'app');
});
</script>

<template>
  <div class="min-h-screen transition-colors duration-300 bg-gray-100 dark:bg-gray-900 dark:text-white">
    <div class="max-w-3xl mx-auto pt-10 px-4 pb-20">
      <header class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-800 dark:text-white tracking-tight">
          {{ APP_TITLE }}
        </h1>
        <button
          type="button"
          @click="toggleTheme"
          class="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-yellow-300 transition-colors"
          aria-label="Toggle Theme"
        >
          {{ theme === 'light' ? '🌙' : '☀️' }}
        </button>
      </header>

      <div class="flex p-1 bg-gray-200 dark:bg-gray-700 rounded-xl mb-8">
        <button
          type="button"
          @click="activeTab = 'LEARNING'"
          :class="[
            'flex-1 py-2 rounded-lg text-sm font-semibold transition-all',
            activeTab === 'LEARNING'
              ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
          ]"
        >
          📚 Learning Center
        </button>
        <button
          type="button"
          @click="activeTab = 'INTERVIEW'"
          :class="[
            'flex-1 py-2 rounded-lg text-sm font-semibold transition-all',
            activeTab === 'INTERVIEW'
              ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
          ]"
        >
          🤖 Interview Prep
        </button>
        <button
          type="button"
          @click="activeTab = 'LOGS'"
          :class="[
            'flex-1 py-2 rounded-lg text-sm font-semibold transition-all',
            activeTab === 'LOGS'
              ? 'bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
          ]"
        >
          🧾 Logs
        </button>
      </div>

      <div v-show="activeTab === 'LEARNING'">
        <LearningCenter />
      </div>

      <div v-if="activeTab === 'INTERVIEW'" class="animate-fade-in">
        <InterviewPrep />
      </div>

      <div v-show="activeTab === 'LOGS'">
        <LogsPanel />
      </div>
    </div>
  </div>
</template>
