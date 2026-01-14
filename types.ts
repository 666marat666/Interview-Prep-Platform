// C# Analogy: This file acts like your Domain Models, DTOs, or POCO classes.
// TypeScript interfaces are structurally typed (duck typing), unlike C# nominal typing.

export interface Todo {
  id: string; // React lists need unique keys, similar to database Primary Keys.
  text: string;
  isCompleted: boolean;
  createdAt: number;
}

// Enum for filtering state
export enum FilterType {
  ALL = 'ALL',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED'
}

// Props interface for the AddTodo component
// C# Analogy: Think of Props as arguments passed to a method/constructor.
export interface AddTodoProps {
  onAdd: (text: string) => void; // A Delegate / Action<string>
  isGenerating: boolean;
}

// --- Interview Prep Types ---

export type InterviewTopic = 'C# .NET' | 'React' | 'VueJS 3' | 'General TypeScript' | 'Basic Architecture';
export type InterviewComplexity = 'Junior' | 'Medior' | 'Senior';
export type InterviewType = 'Theory' | 'Practice';

export interface CodeFile {
  name: string;
  language: string; // e.g., 'typescript', 'csharp', 'json'
  content: string;
}

export interface QuestionData {
  id: string;
  topic: InterviewTopic;
  complexity: InterviewComplexity;
  type: InterviewType; // New field
  text: string;
  hasCode: boolean;
  // A question can now have multiple files (project structure)
  files: CodeFile[]; 
  referenceAnswer: string; // The model solution
}

export interface EvaluationResult {
  isCorrect: boolean;
  feedback: string;
  improvedCode?: string;
}

export interface HistoryItem {
  question: QuestionData;
  // We store the state of files at submission time
  submittedFiles: CodeFile[]; 
  submittedText: string; // Capture text answer too
  evaluation: EvaluationResult;
  timestamp: number;
}

export interface InterviewState {
  currentTopic: InterviewTopic;
  currentComplexity: InterviewComplexity;
  currentType: InterviewType; // New field
  currentQuestion: QuestionData | null;
  
  // File Editor State
  activeFiles: CodeFile[];
  activeFileName: string;

  isLoading: boolean;
  evaluation: EvaluationResult | null;
  
  // Session History
  history: HistoryItem[];
}

// --- Learning Center Types ---

export type TechCategory = 'React' | 'Vue' | 'Angular' | 'C# .NET' | 'General';

export interface LearningModule {
  id: string;
  title: string;
  category: TechCategory;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  files: CodeFile[];
  explanation: string; // Detailed Deep Dive
}