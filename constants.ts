// C# Analogy: Static readonly constants or a Configuration static class.

export const APP_TITLE = "Interview Prep Platform";
export const STORAGE_KEY = "react_accelerator_todos";

// Default prompt for the AI agent
export const SYSTEM_INSTRUCTION = `
You are a helpful task management assistant. 
When given a task description, break it down into 3-5 smaller, actionable subtasks.
Return ONLY a valid JSON array of strings. Do not include markdown formatting.
Example input: "Plan a party"
Example output: ["Choose a venue", "Create guest list", "Order food and drinks", "Send invitations"]
`;