package handler

import (
	"encoding/json"
	"fmt"
	"net/http"

	"paperspace-stable-diffusion-station/internal/config"
)

// GetInstallationDestinationsHandler returns the list of available installation destinations
func GetInstallationDestinationsHandler(w http.ResponseWriter, r *http.Request) {
	// Only allow GET requests
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get installation destinations from config
	destinations, err := config.GetInstallDestinations()
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to load installation destinations: %v", err), http.StatusInternalServerError)
		return
	}

	// Convert to API response format
	apiDestinations := make([]InstallationDestination, len(destinations))
	for i, dest := range destinations {
		apiDestinations[i] = InstallationDestination{
			Type: dest.Type,
			Path: dest.Path,
		}
	}

	// Create response
	response := InstallationDestinationsResponse{
		Destinations: apiDestinations,
	}

	// Encode and send response
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}
