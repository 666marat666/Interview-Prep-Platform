<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useInterviewStore } from '../store/interviewStore';
import type { InterviewComplexity, InterviewTopic, InterviewType } from '../types';
import InterviewHistoryEntry from './InterviewHistoryEntry.vue';

const {
  currentTopic,
  setTopic,
  currentComplexity,
  setComplexity,
  currentType,
  setType,
  fetchQuestion,
  currentQuestion,
  isLoading,
  activeFiles,
  activeFileName,
  setActiveFile,
  updateFileContent,
  submitAnswer,
  evaluation,
  history,
  clearHistory
} = useInterviewStore();

const textAnswer = ref('');

const topics: InterviewTopic[] = ['C# .NET', 'React', 'VueJS 3', 'General TypeScript', 'Basic Architecture'];
const complexities: InterviewComplexity[] = ['Junior', 'Medior', 'Senior'];
const types: InterviewType[] = ['Theory', 'Practice'];

const activeFile = computed(() => {
  return activeFiles.value.find((file) => file.name === activeFileName.value) || activeFiles.value[0];
});

const handleSubmit = () => {
  submitAnswer(textAnswer.value);
};

const onTopicChange = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value as InterviewTopic;
  setTopic(value);
};

const onComplexityChange = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value as InterviewComplexity;
  setComplexity(value);
};

const onTypeChange = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value as InterviewType;
  setType(value);
};

const onCodeChange = (event: Event) => {
  const value = (event.target as HTMLTextAreaElement).value;
  updateFileContent(activeFileName.value, value);
};

watch(currentQuestion, () => {
  textAnswer.value = '';
});
</script>

<template>
  <div class="space-y-8">
    <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
      <h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
        <span>🤖</span> AI Technical Interviewer
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div class="md:col-span-1">
          <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            Topic
          </label>
          <select
            :value="currentTopic"
            @change="onTopicChange"
            class="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option v-for="topic in topics" :key="topic" :value="topic">{{ topic }}</option>
          </select>
        </div>

        <div class="md:col-span-1">
          <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            Complexity
          </label>
          <select
            :value="currentComplexity"
            @change="onComplexityChange"
            class="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
          >
            <option v-for="complexity in complexities" :key="complexity" :value="complexity">{{ complexity }}</option>
          </select>
        </div>

        <div class="md:col-span-1">
          <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            Type
          </label>
          <select
            :value="currentType"
            @change="onTypeChange"
            class="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option v-for="type in types" :key="type" :value="type">{{ type }}</option>
          </select>
        </div>

        <button
          type="button"
          @click="fetchQuestion"
          :disabled="isLoading"
          class="md:col-span-1 w-full p-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 shadow-lg hover:shadow-blue-500/30"
        >
          {{ isLoading && !currentQuestion ? 'Generating...' : 'Start New Question' }}
        </button>
      </div>
    </div>

    <div
      v-if="currentQuestion"
      class="animate-fade-in bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
    >
      <div class="p-6 border-b border-gray-100 dark:border-gray-700">
        <div class="flex justify-between items-start mb-2">
          <div class="flex gap-2">
            <span class="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider">
              {{ currentQuestion.complexity }}
            </span>
            <span
              :class="[
                'inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider',
                currentQuestion.type === 'Theory'
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300'
                  : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300'
              ]"
            >
              {{ currentQuestion.type }}
            </span>
          </div>
          <span class="text-xs text-gray-400 font-mono">ID: {{ currentQuestion.id.slice(0, 8) }}</span>
        </div>
        <p class="text-lg text-gray-800 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
          {{ currentQuestion.text }}
        </p>

        <div class="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700/50">
          <details class="group">
            <summary class="flex items-center cursor-pointer text-sm font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors select-none">
              <svg class="w-4 h-4 mr-2 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
              Stuck? Reveal Educational Solution
            </summary>
            <div class="mt-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap border border-yellow-100 dark:border-yellow-900/30">
              <strong class="block mb-2 text-yellow-800 dark:text-yellow-500 uppercase tracking-wide text-xs">Explanation &amp; Solution:</strong>
              {{ currentQuestion.referenceAnswer }}
            </div>
          </details>
        </div>
      </div>

      <div class="p-6 bg-gray-50 dark:bg-gray-900/50">
        <div v-if="currentQuestion.hasCode" class="mb-6">
          <div class="flex items-center justify-between mb-2">
            <label class="text-sm font-medium text-gray-500 dark:text-gray-400">
              {{ currentQuestion.type === 'Practice' ? 'Your Code Solution (Editable)' : 'Context Code (Read Only)' }}
            </label>
          </div>

          <div v-if="activeFiles.length > 0" class="flex space-x-1 mb-0 overflow-x-auto">
            <button
              v-for="file in activeFiles"
              :key="file.name"
              type="button"
              @click="setActiveFile(file.name)"
              :class="[
                'px-4 py-2 text-sm font-mono border-t border-l border-r rounded-t-lg transition-colors',
                activeFileName === file.name
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-transparent hover:bg-gray-300 dark:hover:bg-gray-600'
              ]"
            >
              {{ file.name }}
            </button>
          </div>

          <div class="relative group">
            <textarea
              :value="activeFile?.content || ''"
              @input="onCodeChange"
              :readonly="currentQuestion.type === 'Theory'"
              class="w-full h-[600px] p-4 rounded-b-xl rounded-tr-xl outline-none transition-all code-editor font-mono text-sm resize-none"
              :class="currentQuestion.type === 'Theory'
                ? 'bg-gray-800 text-gray-300 cursor-default'
                : 'bg-gray-900 text-green-400 focus:ring-2 focus:ring-purple-500'"
              spellcheck="false"
            />
            <div class="absolute top-2 right-2 text-xs text-gray-500 font-mono bg-gray-800 px-2 py-1 rounded opacity-50">
              {{ activeFile?.language || 'text' }}
            </div>
          </div>
        </div>

        <div v-if="currentQuestion.type === 'Theory'">
          <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Your Answer / Explanation
          </label>
          <textarea
            v-model="textAnswer"
            class="w-full h-40 p-4 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-all font-sans text-base bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
            placeholder="Explain your answer here..."
          />
        </div>

        <div class="mt-6 flex justify-between items-center">
          <div class="text-xs text-gray-400">
            {{ currentQuestion.type === 'Practice'
              ? 'Tip: Edit the code files directly to solve the problem.'
              : 'Tip: Analyze the code/question and provide a text explanation.' }}
          </div>
          <button
            type="button"
            @click="handleSubmit"
            :disabled="isLoading"
            class="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 shadow-lg hover:shadow-purple-500/30 flex items-center gap-2"
          >
            <span v-if="isLoading">Evaluating...</span>
            <template v-else>
              <span>Submit Answer</span>
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </template>
          </button>
        </div>
      </div>
    </div>

    <div v-if="evaluation && currentQuestion" class="animate-slide-up space-y-4">
      <div
        :class="[
          'p-6 rounded-2xl border-l-4 shadow-lg',
          evaluation.isCorrect
            ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
            : 'bg-red-50 dark:bg-red-900/20 border-red-500'
        ]"
      >
        <div class="flex items-start gap-4">
          <div
            :class="[
              'p-3 rounded-full',
              evaluation.isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            ]"
          >
            <svg
              v-if="evaluation.isCorrect"
              class="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <svg
              v-else
              class="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div class="flex-1">
            <h3
              :class="[
                'text-lg font-bold mb-2',
                evaluation.isCorrect ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
              ]"
            >
              {{ evaluation.isCorrect ? 'Excellent Work!' : 'Review Needed' }}
            </h3>
            <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
              {{ evaluation.feedback }}
            </p>
            <div v-if="evaluation.improvedCode" class="mt-4">
              <p class="text-sm font-semibold opacity-70 mb-2">Improvement Suggestion:</p>
              <pre class="bg-black/10 dark:bg-black/30 p-3 rounded text-sm font-mono overflow-x-auto">{{ evaluation.improvedCode }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="history.length > 0" class="pt-8 border-t border-gray-200 dark:border-gray-700">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-bold text-gray-400 uppercase tracking-wider">Session History</h3>
        <button
          type="button"
          @click="clearHistory"
          class="text-xs font-semibold text-red-500 hover:text-red-600 hover:underline transition-all"
        >
          Clear History
        </button>
      </div>

      <div class="space-y-4">
        <InterviewHistoryEntry
          v-for="item in [...history].reverse()"
          :key="item.timestamp"
          :item="item"
        />
      </div>
    </div>

    <div v-if="!currentQuestion && !isLoading" class="text-center py-12 opacity-50">
      <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
      <p class="text-gray-600 dark:text-gray-400">Select a topic, complexity, and type to start.</p>
    </div>
  </div>
</template>
