package shared

import (
	"sync"
	"time"
)

type ipWindow struct {
	count int
	reset time.Time
}

type rateLimiter struct {
	mu     sync.Mutex
	limit  int
	window time.Duration
	hits   map[string]*ipWindow
}

func newRateLimiter(limit int, window time.Duration) *rateLimiter {
	return &rateLimiter{
		limit:  limit,
		window: window,
		hits:   make(map[string]*ipWindow),
	}
}

func (rl *rateLimiter) Allow(ip string) bool {
	now := time.Now()
	rl.mu.Lock()
	defer rl.mu.Unlock()

	entry, exists := rl.hits[ip]
	if !exists || now.After(entry.reset) {
		rl.hits[ip] = &ipWindow{
			count: 1,
			reset: now.Add(rl.window),
		}
		return true
	}

	if entry.count >= rl.limit {
		return false
	}

	entry.count++
	return true
}
