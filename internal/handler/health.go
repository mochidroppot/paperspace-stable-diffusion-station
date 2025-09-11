package handler

import (
	"encoding/json"
	"net/http"
	"paperspace-stable-diffusion-station/internal/version"
)

// HealthCheckHandler handles the health check endpoint
func HealthCheckHandler(w http.ResponseWriter, r *http.Request) {
	response := map[string]string{"status": "ok"}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// VersionHandler handles the version endpoint
func VersionHandler(w http.ResponseWriter, r *http.Request) {
	versionInfo := version.Get()
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(versionInfo)
}
