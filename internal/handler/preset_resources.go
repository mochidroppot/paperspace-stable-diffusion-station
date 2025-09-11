package handler

import (
	"encoding/json"
	"fmt"
	"net/http"

	"paperspace-stable-diffusion-station/internal/config"
)

// GetPresetResourcesHandler returns the list of preset resources
func GetPresetResourcesHandler(w http.ResponseWriter, r *http.Request) {
	// Only allow GET requests
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get preset resources from config
	resources, err := config.GetPresetResources()
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to load preset resources: %v", err), http.StatusInternalServerError)
		return
	}

	// Create response
	response := PresetResourcesResponse{
		Resources: resources,
	}

	// Encode and send response
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}
