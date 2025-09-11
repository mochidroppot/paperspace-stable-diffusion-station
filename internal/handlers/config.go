package handlers

import (
	"strings"

	"paperspace-stable-diffusion-station/internal/config"
)

// ProcessConfig processes command line arguments and applies them to the config
func ProcessConfig(cfg *config.Config, port, logLevel, dbPath, baseURL *string) {
	// コマンドライン引数で上書き
	if *port != "" {
		cfg.Port = *port
	}
	if *logLevel != "" {
		cfg.LogLevel = *logLevel
	}
	if *dbPath != "" {
		cfg.DBPath = *dbPath
	}
	if *baseURL != "" {
		// Windowsのパス変換を防ぐため、BaseURLを正規化
		normalizedBaseURL := *baseURL
		normalizedBaseURL = strings.TrimPrefix(normalizedBaseURL, "C:/Program Files/Git")
		if !strings.HasPrefix(normalizedBaseURL, "/") {
			normalizedBaseURL = "/" + normalizedBaseURL
		}
		cfg.BaseURL = normalizedBaseURL
	}
}
