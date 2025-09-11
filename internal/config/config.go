package config

import (
	_ "embed"
	"fmt"
	"os"

	"gopkg.in/yaml.v3"
)

//go:embed preset_resources.yaml
var presetResourcesYAML []byte

//go:embed install_destinations.yaml
var installDestinationsYAML []byte

type Config struct {
	Port     string
	LogLevel string
	DBPath   string
	BaseURL  string
}

// Size information structure
type SizeInfo struct {
	Value float64 `json:"value" yaml:"value"`
	Unit  string  `json:"unit" yaml:"unit"`
}

// Preset resource data structures
type PresetResource struct {
	ID              string   `json:"id" yaml:"id"`
	Name            string   `json:"name" yaml:"name"`
	Type            string   `json:"type" yaml:"type"` // checkpoint, extension, script
	Size            SizeInfo `json:"size" yaml:"size"`
	Description     string   `json:"description" yaml:"description"`
	Tags            []string `json:"tags,omitempty" yaml:"tags,omitempty"`
	Version         string   `json:"version,omitempty" yaml:"version,omitempty"`
	Author          string   `json:"author,omitempty" yaml:"author,omitempty"`
	License         string   `json:"license,omitempty" yaml:"license,omitempty"`
	Requirements    []string `json:"requirements,omitempty" yaml:"requirements,omitempty"`
	DestinationPath string   `json:"destination_path,omitempty" yaml:"destination_path,omitempty"`
	URL             string   `json:"url,omitempty" yaml:"url,omitempty"`
}

type PresetResourcesConfig struct {
	Resources []PresetResource `yaml:"resources"`
}

// Installation destination data structure
type InstallDestinationConfig struct {
	Type        string `json:"type" yaml:"type"`
	Path        string `json:"path" yaml:"path"`
	Description string `json:"description,omitempty" yaml:"description,omitempty"`
}

type InstallDestinationsConfig struct {
	Destinations []InstallDestinationConfig `yaml:"destinations"`
}

func Load() *Config {
	return &Config{
		Port:     getEnv("PORT", "8080"),
		LogLevel: getEnv("LOG_LEVEL", "info"),
		DBPath:   getEnv("DB_PATH", "./data.db"),
		BaseURL:  getEnv("BASE_URL", ""),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// GetPresetResources loads preset resources from embedded YAML config
func GetPresetResources() ([]PresetResource, error) {
	// Parse embedded YAML
	var config PresetResourcesConfig
	if err := yaml.Unmarshal(presetResourcesYAML, &config); err != nil {
		return nil, fmt.Errorf("failed to parse embedded config: %v", err)
	}

	return config.Resources, nil
}

// GetInstallDestinations loads installation destinations from embedded YAML config
func GetInstallDestinations() ([]InstallDestinationConfig, error) {
	// Parse embedded YAML
	var config InstallDestinationsConfig
	if err := yaml.Unmarshal(installDestinationsYAML, &config); err != nil {
		return nil, fmt.Errorf("failed to parse embedded install destinations config: %v", err)
	}

	return config.Destinations, nil
}
