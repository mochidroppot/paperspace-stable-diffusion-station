package api

import (
	"net/http"
	"paperspace-stable-diffusion-station/internal/handler"
)

// NewRouter creates a new API router and sets up routes
func NewRouter() http.Handler {
	router := http.NewServeMux()

	// Health check
	router.HandleFunc("GET /health", handler.HealthCheckHandler)

	// Dashboard
	router.HandleFunc("GET /api/dashboard", handler.DashboardHandler)

	// Resource installer
	router.HandleFunc("POST /installer/install", handler.InstallHandler)
	router.HandleFunc("GET /installer/status", handler.GetInstallStatusHandler)
	router.HandleFunc("POST /installer/cancel", handler.CancelInstallHandler)
	router.HandleFunc("GET /installer/tasks", handler.GetAllInstallTasksHandler)

	return router
}
