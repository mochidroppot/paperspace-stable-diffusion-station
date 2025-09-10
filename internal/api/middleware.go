package api

import (
	"net/http"
	"time"

	"paperspace-stable-diffusion-station/pkg/logger"
)

func Logging(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		next(w, r)

		duration := time.Since(start)
		logger.Info("%s %s %v", r.Method, r.URL.Path, duration)
	}
}
