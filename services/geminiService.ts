import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { logError } from "../store/logStore";

// C# Analogy: This is your Service Layer / Repository Pattern implementation.
// It abstracts the external API calls from the UI logic.

// Initialize the client.
// C# Analogy: Dependency Injection of the HTTP Client.
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
const model = import.meta.env.VITE_GEMINI_MODEL_SUBTASKS || 'gemini-3-flash-preview';

const getClient = () => {
  if (!ai) {
    throw new Error('Missing VITE_GEMINI_API_KEY. Add it to .env.local and restart the dev server.');
  }
  return ai;
};

/**
 * Uses Gemini to break a complex task into subtasks.
 */
export const generateSubtasks = async (taskDescription: string): Promise<string[]> => {
  try {
    // We use a schema to enforce structured JSON output.
    // C# Analogy: Like deserializing a JSON response into a strong type.
    const response = await getClient().models.generateContent({
      model,
      contents: `Break down this task: "${taskDescription}"`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    // Parse the response text.
    const jsonString = response.text || "[]";
    const subtasks = JSON.parse(jsonString) as string[];
    return subtasks;

  } catch (error) {
    console.error("Gemini API Error:", error);
    logError("generateSubtasks", error);
    // C# Analogy: Try/Catch blocks are standard here too.
    // We return empty array to fail gracefully.
    return [];
  }
};
