package handlers

import (
	"fmt"
	"paperspace-stable-diffusion-station/internal/version"
)

// ShowHelp displays the help message
func ShowHelp() {
	fmt.Println("Paperspace Stable Diffusion Station")
	fmt.Println("")
	fmt.Println("Usage:")
	fmt.Println("  server [options]")
	fmt.Println("")
	fmt.Println("Options:")
	fmt.Println("  -port string")
	fmt.Println("        Port to run the server on (default: 8080 or PORT env var)")
	fmt.Println("  -log-level string")
	fmt.Println("        Log level: debug, info, warn, error (default: info or LOG_LEVEL env var)")
	fmt.Println("  -db-path string")
	fmt.Println("        Database file path (default: ./data.db or DB_PATH env var)")
	fmt.Println("  -base-url, --base-url string")
	fmt.Println("        Base URL for the server (default: empty or BASE_URL env var)")
	fmt.Println("  -help")
	fmt.Println("        Show this help message")
	fmt.Println("  -version")
	fmt.Println("        Show version information")
	fmt.Println("")
	fmt.Println("Environment Variables:")
	fmt.Println("  PORT        Port to run the server on")
	fmt.Println("  LOG_LEVEL   Log level (debug, info, warn, error)")
	fmt.Println("  DB_PATH     Database file path")
	fmt.Println("  BASE_URL    Base URL for the server")
	fmt.Println("")
	fmt.Println("Examples:")
	fmt.Println("  server -port 3000")
	fmt.Println("  server -port 8080 -log-level debug")
	fmt.Println("  server --base-url /myapp")
	fmt.Println("  server -base-url /myapp")
	fmt.Println("  PORT=3000 BASE_URL=/myapp server")
}

// ShowVersion displays version information
func ShowVersion() {
	versionInfo := version.Get()
	fmt.Println("Paperspace Stable Diffusion Station")
	fmt.Printf("Version: %s\n", versionInfo.Version)
	fmt.Printf("Build Time: %s\n", versionInfo.BuildTime)
	fmt.Printf("Git Commit: %s\n", versionInfo.GitCommit)
	fmt.Printf("Go Version: %s\n", versionInfo.GoVersion)
}
