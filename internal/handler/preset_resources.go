package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"

	"gopkg.in/yaml.v3"
)

// GetPresetResourcesHandler returns the list of preset resources
func GetPresetResourcesHandler(w http.ResponseWriter, r *http.Request) {
	// Set CORS headers
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	w.Header().Set("Content-Type", "application/json")

	// Handle preflight requests
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	// Only allow GET requests
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get preset resources from config file
	resources, err := getPresetResourcesFromConfig()
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

// PresetResourcesConfig represents the structure of the YAML config file
type PresetResourcesConfig struct {
	Resources []PresetResource `yaml:"resources"`
}

// getPresetResourcesFromConfig loads preset resources from YAML config file
func getPresetResourcesFromConfig() ([]PresetResource, error) {
	// Get the path to the config file
	configPath := filepath.Join("config", "preset_resources.yaml")

	// Check if file exists
	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		return nil, fmt.Errorf("config file not found: %s", configPath)
	}

	// Read the config file
	data, err := os.ReadFile(configPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read config file: %v", err)
	}

	// Parse YAML
	var config PresetResourcesConfig
	if err := yaml.Unmarshal(data, &config); err != nil {
		return nil, fmt.Errorf("failed to parse config file: %v", err)
	}

	return config.Resources, nil
}
