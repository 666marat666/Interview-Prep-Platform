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

type questionPayload struct {
	Text            string `json:"text"`
	ReferenceAnswer string `json:"referenceAnswer"`
	Complexity      string `json:"complexity"`
	Type            string `json:"type"`
}

type evaluateAnswerRequest struct {
	Question       questionPayload    `json:"question"`
	UserFiles      []shared.CodeFile `json:"userFiles"`
	UserTextAnswer string            `json:"userTextAnswer"`
	Password       string            `json:"password"`
}

type evaluationResponse struct {
	IsCorrect    bool   `json:"isCorrect"`
	Feedback     string `json:"feedback"`
	ImprovedCode string `json:"improvedCode,omitempty"`
}

func evaluateAnswerSchema() *genai.Schema {
	return &genai.Schema{
		Type: genai.TypeObject,
		Properties: map[string]*genai.Schema{
			"isCorrect":    {Type: genai.TypeBoolean, Description: "Is the answer generally correct (ignoring minor typos)?"},
			"feedback":     {Type: genai.TypeString, Description: "Detailed feedback, pointing out typos gently if present"},
			"improvedCode": {Type: genai.TypeString, Description: "A better version of the code if applicable"},
		},
		Required: []string{"isCorrect", "feedback"},
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

	var req evaluateAnswerRequest
	if err := shared.ReadJSON(w, r, &req); err != nil {
		shared.WriteError(w, http.StatusBadRequest, "Invalid JSON payload")
		return
	}

	if !shared.IsAuthorized(req.Password) {
		shared.WriteError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	if shared.IsMockEnabled() {
		payload := evaluationResponse{
			IsCorrect:    true,
			Feedback:     "Mock feedback: Good job. Your explanation shows correct understanding.",
			ImprovedCode: "",
		}
		shared.WriteJSON(w, http.StatusOK, payload)
		return
	}

	apiKey, ok := shared.RequireGeminiKey()
	if !ok {
		shared.WriteError(w, http.StatusInternalServerError, "Missing GEMINI_API_KEY")
		return
	}

	fileContextParts := make([]string, 0, len(req.UserFiles))
	for _, file := range req.UserFiles {
		fileContextParts = append(fileContextParts, fmt.Sprintf("File: %s\n```%s\n%s\n```", file.Name, file.Language, file.Content))
	}
	fileContext := strings.Join(fileContextParts, "\n\n")

	submissionContent := ""
	if strings.EqualFold(req.Question.Type, "Practice") {
		submissionContent = fmt.Sprintf("User Code Submission:\n%s", fileContext)
	} else {
		submissionContent = fmt.Sprintf("User Text Answer:\n%s\n\n(Context Files Provided to User:\n%s)", req.UserTextAnswer, fileContext)
	}

	prompt := fmt.Sprintf(`
You are a Senior Technical Interviewer.

Question: "%s"
Reference Answer: "%s"
Complexity: %s
Type: %s

%s

Evaluate the submission strictly but constructively.

CRITICAL INSTRUCTION ON LENIENCY:
- Be lenient with minor syntax errors, typos, missing semicolons, or slight misspellings of method names.
- If the user's logic and intent are correct, mark it as correct.
- If the user made a typo but clearly understood the concept, mention the typo in feedback but pass the question.
- Only fail the user if the core logic is wrong, the code is fundamentally broken beyond typos, or the explanation is incorrect.

Return pure JSON.
`, req.Question.Text, req.Question.ReferenceAnswer, req.Question.Complexity, req.Question.Type, submissionContent)

	ctx := context.Background()
	client, err := shared.NewGeminiClient(ctx, apiKey)
	if err != nil {
		shared.WriteError(w, http.StatusInternalServerError, "Failed to initialize Gemini client")
		return
	}

	model := shared.EnvModel("GEMINI_MODEL_EVAL")
	response, err := client.Models.GenerateContent(ctx, model, genai.Text(prompt), &genai.GenerateContentConfig{
		ResponseMIMEType: "application/json",
		ResponseSchema:   evaluateAnswerSchema(),
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

	var payload evaluationResponse
	if err := json.Unmarshal([]byte(raw), &payload); err != nil {
		shared.WriteError(w, http.StatusBadRequest, "Failed to parse Gemini response")
		return
	}

	shared.WriteJSON(w, http.StatusOK, payload)
}
