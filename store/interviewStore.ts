import { create } from 'zustand';
import { InterviewTopic, InterviewComplexity, InterviewType, InterviewState, QuestionData, CodeFile } from '../types';
import { generateQuestion, evaluateAnswer } from '../services/interviewService';
import confetti from 'canvas-confetti';

const INTERVIEW_STORAGE_KEY = 'react_accelerator_interview_history';

interface InterviewStore extends InterviewState {
  setTopic: (topic: InterviewTopic) => void;
  setComplexity: (complexity: InterviewComplexity) => void;
  setType: (type: InterviewType) => void;
  
  // File Actions
  updateFileContent: (fileName: string, content: string) => void;
  setActiveFile: (fileName: string) => void;
  
  fetchQuestion: () => Promise<void>;
  submitAnswer: (userTextAnswer?: string) => Promise<void>;
  resetEvaluation: () => void;
  clearHistory: () => void; // New action
}

export const useInterviewStore = create<InterviewStore>((set, get) => ({
  // Initial State
  currentTopic: 'C# .NET',
  currentComplexity: 'Junior',
  currentType: 'Theory',
  currentQuestion: null,
  activeFiles: [],
  activeFileName: '',
  isLoading: false,
  evaluation: null,
  
  // Initialize history from LocalStorage
  history: (() => {
    try {
      const stored = localStorage.getItem(INTERVIEW_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.error("Failed to load history", err);
      return [];
    }
  })(),

  // Actions
  setTopic: (topic) => set({ currentTopic: topic }),
  setComplexity: (complexity) => set({ currentComplexity: complexity }),
  setType: (type) => set({ currentType: type }),
  
  updateFileContent: (fileName, content) => {
    set((state) => ({
      activeFiles: state.activeFiles.map(f => 
        f.name === fileName ? { ...f, content } : f
      )
    }));
  },

  setActiveFile: (fileName) => set({ activeFileName: fileName }),
  
  resetEvaluation: () => set({ evaluation: null }),

  clearHistory: () => {
    localStorage.removeItem(INTERVIEW_STORAGE_KEY);
    set({ history: [] });
  },

  fetchQuestion: async () => {
    const { currentTopic, currentComplexity, currentType, history } = get();
    set({ isLoading: true, evaluation: null, currentQuestion: null, activeFiles: [] });
    
    const question = await generateQuestion(currentTopic, currentComplexity, currentType, history);
    
    set({ 
      isLoading: false, 
      currentQuestion: question,
      // Initialize files from question, or clear if none
      activeFiles: question.files || [],
      activeFileName: question.files?.[0]?.name || ''
    });
  },

  submitAnswer: async (userTextAnswer = '') => {
    const { currentQuestion, activeFiles, history } = get();
    if (!currentQuestion) return;

    set({ isLoading: true });
    
    // Evaluate
    const result = await evaluateAnswer(currentQuestion, activeFiles, userTextAnswer);
    
    set((state) => {
      const newHistoryItem = {
        question: currentQuestion,
        submittedFiles: JSON.parse(JSON.stringify(activeFiles)), // Deep copy state
        submittedText: userTextAnswer,
        evaluation: result,
        timestamp: Date.now()
      };

      const updatedHistory = [...state.history, newHistoryItem];
      
      // Save to LocalStorage
      localStorage.setItem(INTERVIEW_STORAGE_KEY, JSON.stringify(updatedHistory));

      return { 
        isLoading: false, 
        evaluation: result,
        history: updatedHistory
      };
    });

    if (result.isCorrect) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a']
      });
    }
  }
}));