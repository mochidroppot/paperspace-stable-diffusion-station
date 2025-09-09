package api

import (
	"net/http"
	"paperspace-stable-diffusion-station/internal/handler"
)

// NewRouter creates a new API router and sets up routes
func NewRouter() http.Handler {
	router := http.NewServeMux()

	// Health check
	router.HandleFunc("GET /health", CORS(handler.HealthCheckHandler))

	// Dashboard
	router.HandleFunc("GET /api/dashboard", CORS(handler.DashboardHandler))
	router.HandleFunc("OPTIONS /api/dashboard", CORS(handler.DashboardHandler))

	// Resource installer
	router.HandleFunc("POST /installer/install", CORS(handler.InstallHandler))
	router.HandleFunc("OPTIONS /installer/install", CORS(handler.InstallHandler))
	router.HandleFunc("GET /installer/status", CORS(handler.GetInstallStatusHandler))
	router.HandleFunc("OPTIONS /installer/status", CORS(handler.GetInstallStatusHandler))
	router.HandleFunc("POST /installer/cancel", CORS(handler.CancelInstallHandler))
	router.HandleFunc("OPTIONS /installer/cancel", CORS(handler.CancelInstallHandler))
	router.HandleFunc("GET /installer/tasks", CORS(handler.GetAllInstallTasksHandler))
	router.HandleFunc("OPTIONS /installer/tasks", CORS(handler.GetAllInstallTasksHandler))

	return router
}
