import { GoogleGenAI, Type } from "@google/genai";
import { InterviewTopic, InterviewComplexity, InterviewType, QuestionData, EvaluationResult, HistoryItem, CodeFile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a technical interview question based on topic, complexity, type, and history.
 */
export const generateQuestion = async (
  topic: InterviewTopic, 
  complexity: InterviewComplexity,
  type: InterviewType,
  history: HistoryItem[]
): Promise<QuestionData> => {
  
  // Summarize history for the AI to maintain context
  const historySummary = history.map((h, i) => 
    `Q${i+1}: ${h.question.text} (Result: ${h.evaluation.isCorrect ? 'Correct' : 'Incorrect'})`
  ).join('\n');

  const prompt = `
    You are a Senior Technical Interviewer.
    Current Session History:
    ${historySummary}

    Generate a ${complexity} level ${type} interview question about: ${topic}.
    
    Requirements:
    1. If the previous question was answered incorrectly, ask a simpler follow-up.
    2. Include 'referenceAnswer' which is highly educational. Explain the 'Why' and 'How'.

    Mode Specifics:
    - **THEORY Mode**: 
      - Ask a conceptual question. 
      - You MAY provide code files for the user to analyze/read (e.g., "What is wrong with this component?").
      - User will answer via text.
    - **PRACTICE Mode**: 
      - User must write or modify code.
      - Provide a 'files' array representing a small project structure.
      - Instructions should be in the 'text' field (e.g., "Implement the handleClick method...").
    
    Project Structure:
    - Example: 'App.tsx' and 'components/Button.tsx'.
    - If "fix bug", include buggy code.
    - If "implement feature", include method signatures.
    
    Return pure JSON adhering to the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING, description: "The question text" },
            hasCode: { type: Type.BOOLEAN, description: "Whether this requires a code editor view (true for Practice, optional for Theory)" },
            referenceAnswer: { type: Type.STRING, description: "Detailed educational answer explaining functionality and concepts" },
            files: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "File name e.g. App.tsx" },
                  language: { type: Type.STRING, description: "language e.g. typescript, csharp" },
                  content: { type: Type.STRING, description: "File content" }
                },
                required: ["name", "content", "language"]
              }
            }
          },
          required: ["text", "hasCode", "files", "referenceAnswer"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    
    // Normalize files if AI returns empty
    const files = data.files && data.files.length > 0 ? data.files : [];

    // Ensure practice questions always have a file to edit
    if (type === 'Practice' && files.length === 0) {
      files.push({
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
      hasCode: data.hasCode || files.length > 0,
      files: files,
      referenceAnswer: data.referenceAnswer || "No reference answer provided."
    };
  } catch (err) {
    console.error("AI Error:", err);
    return {
      id: crypto.randomUUID(),
      topic,
      complexity,
      type,
      text: "We encountered an issue reaching the AI interviewer. Please try again.",
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
  
  // Combine all files into a single context string for evaluation
  const fileContext = userFiles.map(f => `File: ${f.name}\n\`\`\`${f.language}\n${f.content}\n\`\`\``).join('\n\n');
  
  // Determine what to evaluate based on type
  let submissionContent = "";
  if (question.type === 'Practice') {
    submissionContent = `User Code Submission:\n${fileContext}`;
  } else {
    submissionContent = `User Text Answer:\n${userTextAnswer}\n\n(Context Files Provided to User:\n${fileContext})`;
  }

  const prompt = `
    You are a Senior Technical Interviewer.
    
    Question: "${question.text}"
    Reference Answer: "${question.referenceAnswer}"
    Complexity: ${question.complexity}
    Type: ${question.type}
    
    ${submissionContent}
    
    Evaluate the submission strictly but constructively.
    
    **CRITICAL INSTRUCTION ON LENIENCY:**
    - Be **lenient** with minor syntax errors, typos, missing semicolons, or slight misspellings of method names.
    - If the user's **logic** and **intent** are correct, mark it as correct.
    - If the user made a typo but clearly understood the concept, mention the typo in feedback but pass the question.
    - Only fail the user if the core logic is wrong, the code is fundamentally broken beyond typos, or the explanation is incorrect.
    
    Return pure JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCorrect: { type: Type.BOOLEAN, description: "Is the answer generally correct (ignoring minor typos)?" },
            feedback: { type: Type.STRING, description: "Detailed feedback, pointing out typos gently if present" },
            improvedCode: { type: Type.STRING, description: "A better version of the code if applicable" }
          },
          required: ["isCorrect", "feedback"]
        }
      }
    });

    return JSON.parse(response.text || "{}") as EvaluationResult;
  } catch (err) {
    console.error("AI Evaluation Error:", err);
    return {
      isCorrect: false,
      feedback: "Failed to evaluate. Please try again."
    };
  }
};