import { reactive, toRefs } from 'vue';
import confetti from 'canvas-confetti';
import { generateQuestion, evaluateAnswer } from '../services/interviewService';
import type {
  InterviewTopic,
  InterviewComplexity,
  InterviewType,
  InterviewState,
  CodeFile
} from '../types';

const INTERVIEW_STORAGE_KEY = 'react_accelerator_interview_history';

const loadHistory = () => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = window.localStorage.getItem(INTERVIEW_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error('Failed to load history', err);
    return [];
  }
};

const state = reactive<InterviewState>({
  currentTopic: 'C# .NET',
  currentComplexity: 'Junior',
  currentType: 'Theory',
  currentQuestion: null,
  activeFiles: [],
  activeFileName: '',
  isLoading: false,
  evaluation: null,
  history: loadHistory()
});

const setTopic = (topic: InterviewTopic) => {
  state.currentTopic = topic;
};

const setComplexity = (complexity: InterviewComplexity) => {
  state.currentComplexity = complexity;
};

const setType = (type: InterviewType) => {
  state.currentType = type;
};

const updateFileContent = (fileName: string, content: string) => {
  state.activeFiles = state.activeFiles.map((file) =>
    file.name === fileName ? { ...file, content } : file
  );
};

const setActiveFile = (fileName: string) => {
  state.activeFileName = fileName;
};

const resetEvaluation = () => {
  state.evaluation = null;
};

const clearHistory = () => {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(INTERVIEW_STORAGE_KEY);
  }
  state.history = [];
};

const fetchQuestion = async () => {
  state.isLoading = true;
  state.evaluation = null;
  state.currentQuestion = null;
  state.activeFiles = [];

  const question = await generateQuestion(
    state.currentTopic,
    state.currentComplexity,
    state.currentType,
    state.history
  );

  state.isLoading = false;
  state.currentQuestion = question;
  state.activeFiles = question.files || [];
  state.activeFileName = question.files?.[0]?.name || '';
};

const submitAnswer = async (userTextAnswer = '') => {
  const currentQuestion = state.currentQuestion;
  if (!currentQuestion) return;

  state.isLoading = true;

  const result = await evaluateAnswer(
    currentQuestion,
    state.activeFiles,
    userTextAnswer
  );

  const newHistoryItem = {
    question: currentQuestion,
    submittedFiles: JSON.parse(JSON.stringify(state.activeFiles)) as CodeFile[],
    submittedText: userTextAnswer,
    evaluation: result,
    timestamp: Date.now()
  };

  const updatedHistory = [...state.history, newHistoryItem];
  state.history = updatedHistory;
  state.evaluation = result;
  state.isLoading = false;

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(
      INTERVIEW_STORAGE_KEY,
      JSON.stringify(updatedHistory)
    );
  }

  if (result.isCorrect) {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a']
    });
  }
};

export const useInterviewStore = () => ({
  ...toRefs(state),
  setTopic,
  setComplexity,
  setType,
  updateFileContent,
  setActiveFile,
  resetEvaluation,
  clearHistory,
  fetchQuestion,
  submitAnswer
});
