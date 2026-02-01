import { InterviewTopic, InterviewComplexity, InterviewType, QuestionData, EvaluationResult, HistoryItem, CodeFile } from "../types";
import { logError } from "../store/logStore";

const API_BASE = '/api';
const APP_PASSWORD = 'marat007!';

const postJson = async <T>(path: string, payload: Record<string, unknown>) => {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, password: APP_PASSWORD })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed (${response.status})`);
  }

  return (await response.json()) as T;
};

/**
 * Generates a technical interview question based on topic, complexity, type, and history.
 */
export const generateQuestion = async (
  topic: InterviewTopic, 
  complexity: InterviewComplexity,
  type: InterviewType,
  history: HistoryItem[]
): Promise<QuestionData> => {
  
  try {
    const data = await postJson<{
      text: string;
      hasCode: boolean;
      referenceAnswer: string;
      files: CodeFile[];
    }>('/generate-question', {
      topic,
      complexity,
      type,
      history: history.map((item) => ({
        text: item.question.text,
        isCorrect: item.evaluation.isCorrect
      }))
    });
    
    // Normalize files if AI returns empty
    const files = data.files && data.files.length > 0 ? data.files : [];

    // Fix common escape artifacts so code displays with real line breaks.
    const normalizedFiles = files.map((file) => {
      const content = file.content ?? '';
      const hasLiteralEscapes = content.includes('\\n') && !content.includes('\n');
      const normalizedContent = hasLiteralEscapes
        ? content.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\r/g, '\r')
        : content;
      return { ...file, content: normalizedContent };
    });

    // Ensure practice questions always have a file to edit
    if (type === 'Practice' && normalizedFiles.length === 0) {
      normalizedFiles.push({
        name: 'solution.ts',
        language: 'typescript',
        content: '// Write your solution here...'
      });
    }

    return {
      id: crypto.randomUUID(),
      topic,
      complexity,
      type,
      text: data.text,
      hasCode: data.hasCode || normalizedFiles.length > 0,
      files: normalizedFiles,
      referenceAnswer: data.referenceAnswer || "No reference answer provided."
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error("AI Error:", err);
    logError("generateQuestion", err);
    return {
      id: crypto.randomUUID(),
      topic,
      complexity,
      type,
      text: `We encountered an issue reaching the AI interviewer. ${message}`,
      hasCode: false,
      files: [],
      referenceAnswer: ""
    };
  }
};

/**
 * Evaluates the user's answer or code.
 */
export const evaluateAnswer = async (
  question: QuestionData, 
  userFiles: CodeFile[],
  userTextAnswer: string
): Promise<EvaluationResult> => {
  
  try {
    return await postJson<EvaluationResult>('/evaluate-answer', {
      question: {
        text: question.text,
        referenceAnswer: question.referenceAnswer,
        complexity: question.complexity,
        type: question.type
      },
      userFiles,
      userTextAnswer
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error("AI Evaluation Error:", err);
    logError("evaluateAnswer", err);
    return {
      isCorrect: false,
      feedback: `Failed to evaluate. ${message}`
    };
  }
};
