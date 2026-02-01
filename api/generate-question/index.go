package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"interview-prep-platform/server/shared"
	"google.golang.org/genai"
)

type historySummary struct {
	Text      string `json:"text"`
	IsCorrect bool   `json:"isCorrect"`
}

type generateQuestionRequest struct {
	Topic      string           `json:"topic"`
	Complexity string           `json:"complexity"`
	Type       string           `json:"type"`
	History    []historySummary `json:"history"`
	Password   string           `json:"password"`
}

type questionResponse struct {
	Text            string             `json:"text"`
	HasCode         bool               `json:"hasCode"`
	ReferenceAnswer string             `json:"referenceAnswer"`
	Files           []shared.CodeFile `json:"files"`
}

func generateQuestionSchema() *genai.Schema {
	return &genai.Schema{
		Type: genai.TypeObject,
		Properties: map[string]*genai.Schema{
			"text":            {Type: genai.TypeString, Description: "The question text"},
			"hasCode":         {Type: genai.TypeBoolean, Description: "Whether this requires a code editor view"},
			"referenceAnswer": {Type: genai.TypeString, Description: "Detailed educational answer explaining functionality and concepts"},
			"files": {
				Type: genai.TypeArray,
				Items: &genai.Schema{
					Type: genai.TypeObject,
					Properties: map[string]*genai.Schema{
						"name":     {Type: genai.TypeString, Description: "File name e.g. App.tsx"},
						"language": {Type: genai.TypeString, Description: "language e.g. typescript, csharp"},
						"content":  {Type: genai.TypeString, Description: "File content"},
					},
					Required: []string{"name", "content", "language"},
				},
			},
		},
		Required: []string{"text", "hasCode", "files", "referenceAnswer"},
	}
}

func Handler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		shared.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	if !shared.ApplyRateLimit(r) {
		shared.WriteError(w, http.StatusTooManyRequests, "Rate limit exceeded")
		return
	}

	var req generateQuestionRequest
	if err := shared.ReadJSON(w, r, &req); err != nil {
		shared.WriteError(w, http.StatusBadRequest, "Invalid JSON payload")
		return
	}

	if !shared.IsAuthorized(req.Password) {
		shared.WriteError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	if shared.IsMockEnabled() {
		payload := questionResponse{
			Text:            fmt.Sprintf("Mock question (%s/%s): Explain the difference between a pointer and a value in Go.", req.Topic, req.Complexity),
			HasCode:         strings.EqualFold(req.Type, "Practice"),
			ReferenceAnswer: "A pointer holds the memory address of a value. Passing by value copies data, while passing by pointer allows modifying the original value.",
			Files: []shared.CodeFile{
				{
					Name:     "main.go",
					Language: "go",
					Content:  "package main\n\nfunc main() {\n  // Update the function to modify the original value via pointer.\n}\n",
				},
			},
		}
		shared.WriteJSON(w, http.StatusOK, payload)
		return
	}

	apiKey, ok := shared.RequireGeminiKey()
	if !ok {
		shared.WriteError(w, http.StatusInternalServerError, "Missing GEMINI_API_KEY")
		return
	}

	historyLines := make([]string, 0, len(req.History))
	for index, item := range req.History {
		result := "Incorrect"
		if item.IsCorrect {
			result = "Correct"
		}
		historyLines = append(historyLines, fmt.Sprintf("Q%d: %s (Result: %s)", index+1, item.Text, result))
	}
	historySummary := strings.Join(historyLines, "\n")

	prompt := fmt.Sprintf(`
You are a Senior Technical Interviewer.
Current Session History:
%s

Generate a %s level %s interview question about: %s.

Requirements:
1. If the previous question was answered incorrectly, ask a simpler follow-up.
2. Include 'referenceAnswer' which is highly educational. Explain the 'Why' and 'How'.

Mode Specifics:
- THEORY Mode:
  - Ask a conceptual question.
  - You MAY provide code files for the user to analyze/read (e.g., "What is wrong with this component?").
  - User will answer via text.
- PRACTICE Mode:
  - User must write or modify code.
  - Provide a 'files' array representing a small project structure.
  - Instructions should be in the 'text' field (e.g., "Implement the handleClick method...").

Project Structure:
- Example: 'App.tsx' and 'components/Button.tsx'.
- If "fix bug", include buggy code.
- If "implement feature", include method signatures.

Return pure JSON adhering to the schema.
`, historySummary, req.Complexity, req.Type, req.Topic)

	ctx := context.Background()
	client, err := shared.NewGeminiClient(ctx, apiKey)
	if err != nil {
		shared.WriteError(w, http.StatusInternalServerError, "Failed to initialize Gemini client")
		return
	}

	model := shared.EnvModel("GEMINI_MODEL_QUESTION")
	response, err := client.Models.GenerateContent(ctx, model, genai.Text(prompt), &genai.GenerateContentConfig{
		ResponseMIMEType: "application/json",
		ResponseSchema:   generateQuestionSchema(),
	})
	if err != nil {
		shared.WriteError(w, http.StatusBadRequest, "Gemini request failed")
		return
	}

	raw := shared.ResponseText(response)
	if raw == "" {
		shared.WriteError(w, http.StatusBadRequest, "Empty Gemini response")
		return
	}

	var payload questionResponse
	if err := json.Unmarshal([]byte(raw), &payload); err != nil {
		shared.WriteError(w, http.StatusBadRequest, "Failed to parse Gemini response")
		return
	}

	if payload.Files == nil {
		payload.Files = []shared.CodeFile{}
	}

	shared.WriteJSON(w, http.StatusOK, payload)
}
