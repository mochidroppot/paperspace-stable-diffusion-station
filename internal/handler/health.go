package handler

import (
	"encoding/json"
	"net/http"
)

// HealthCheckHandler handles the health check endpoint
func HealthCheckHandler(w http.ResponseWriter, r *http.Request) {
	response := map[string]string{"status": "ok"}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}
