import { reactive, toRefs } from 'vue';
import confetti from 'canvas-confetti';
import { generateQuestion, evaluateAnswer } from '../services/interviewService';
import { logInfo } from './logStore';
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
    const parsed = stored ? JSON.parse(stored) : [];
    logInfo(`Interview history loaded (${parsed.length} items)`, undefined, 'interviewStore');
    return parsed;
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
  logInfo(`Topic set to ${topic}`, undefined, 'interviewStore');
};

const setComplexity = (complexity: InterviewComplexity) => {
  state.currentComplexity = complexity;
  logInfo(`Complexity set to ${complexity}`, undefined, 'interviewStore');
};

const setType = (type: InterviewType) => {
  state.currentType = type;
  logInfo(`Type set to ${type}`, undefined, 'interviewStore');
};

const updateFileContent = (fileName: string, content: string) => {
  state.activeFiles = state.activeFiles.map((file) =>
    file.name === fileName ? { ...file, content } : file
  );
};

const setActiveFile = (fileName: string) => {
  state.activeFileName = fileName;
  logInfo(`Active file set to ${fileName}`, undefined, 'interviewStore');
};

const resetEvaluation = () => {
  state.evaluation = null;
};

const clearHistory = () => {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(INTERVIEW_STORAGE_KEY);
  }
  state.history = [];
  logInfo('Interview history cleared', undefined, 'interviewStore');
};

const fetchQuestion = async () => {
  state.isLoading = true;
  state.evaluation = null;
  state.currentQuestion = null;
  state.activeFiles = [];
  logInfo(
    `Requesting question (${state.currentTopic}, ${state.currentComplexity}, ${state.currentType})`,
    undefined,
    'interviewStore'
  );

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
  logInfo(
    `Question ready (${question.id.slice(0, 8)})`,
    `hasCode=${question.hasCode} files=${question.files.length}`,
    'interviewStore'
  );
};

const submitAnswer = async (userTextAnswer = '') => {
  const currentQuestion = state.currentQuestion;
  if (!currentQuestion) return;

  state.isLoading = true;
  logInfo(
    `Submitting answer (${currentQuestion.id.slice(0, 8)})`,
    `type=${currentQuestion.type} files=${state.activeFiles.length} textLength=${userTextAnswer.length}`,
    'interviewStore'
  );

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
  logInfo(
    `Evaluation received (${currentQuestion.id.slice(0, 8)})`,
    `isCorrect=${result.isCorrect}`,
    'interviewStore'
  );

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
