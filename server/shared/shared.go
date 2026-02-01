package shared

import (
	"context"
	"crypto/subtle"
	"encoding/json"
	"net"
	"net/http"
	"os"
	"strings"
	"time"

	"google.golang.org/genai"
)

const (
	AppPassword   = "marat007!"
	MaxBodyBytes  = 4 << 20
	DefaultModel  = "gemini-3-flash-preview"
	RateLimitMax  = 30
	RateLimitSpan = time.Minute
)

var limiter = newRateLimiter(RateLimitMax, RateLimitSpan)

type CodeFile struct {
	Name     string `json:"name"`
	Language string `json:"language"`
	Content  string `json:"content"`
}

func WriteJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func WriteError(w http.ResponseWriter, status int, message string) {
	WriteJSON(w, status, map[string]string{"error": message})
}

func ReadJSON(w http.ResponseWriter, r *http.Request, dst any) error {
	r.Body = http.MaxBytesReader(w, r.Body, MaxBodyBytes)
	decoder := json.NewDecoder(r.Body)
	return decoder.Decode(dst)
}

func IsAuthorized(password string) bool {
	return subtle.ConstantTimeCompare([]byte(password), []byte(AppPassword)) == 1
}

func GetClientIP(r *http.Request) string {
	if forwarded := r.Header.Get("X-Forwarded-For"); forwarded != "" {
		parts := strings.Split(forwarded, ",")
		return strings.TrimSpace(parts[0])
	}
	if realIP := r.Header.Get("X-Real-IP"); realIP != "" {
		return realIP
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err == nil {
		return host
	}
	return r.RemoteAddr
}

func ApplyRateLimit(r *http.Request) bool {
	return limiter.Allow(GetClientIP(r))
}

func RequireGeminiKey() (string, bool) {
	key := strings.TrimSpace(os.Getenv("GEMINI_API_KEY"))
	if key == "" {
		return "", false
	}
	return key, true
}

func IsMockEnabled() bool {
	value := strings.TrimSpace(strings.ToLower(os.Getenv("GEMINI_MOCK")))
	return value == "1" || value == "true" || value == "yes"
}

func EnvModel(key string) string {
	if value := strings.TrimSpace(os.Getenv(key)); value != "" {
		return value
	}
	return DefaultModel
}

func NewGeminiClient(ctx context.Context, apiKey string) (*genai.Client, error) {
	return genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  apiKey,
		Backend: genai.BackendGeminiAPI,
	})
}

func ResponseText(response *genai.GenerateContentResponse) string {
	if response == nil {
		return ""
	}
	return strings.TrimSpace(response.Text())
}
