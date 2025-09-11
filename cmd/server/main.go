package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"paperspace-stable-diffusion-station/internal/api"

	"paperspace-stable-diffusion-station/internal/config"
	"paperspace-stable-diffusion-station/internal/version"
	"paperspace-stable-diffusion-station/pkg/logger"
	"paperspace-stable-diffusion-station/web"
)

func main() {
	// コマンドライン引数の定義
	var (
		port     = flag.String("port", "", "Port to run the server on (default: 8080 or PORT env var)")
		logLevel = flag.String("log-level", "", "Log level (debug, info, warn, error) (default: info or LOG_LEVEL env var)")
		dbPath   = flag.String("db-path", "", "Database file path (default: ./data.db or DB_PATH env var)")
		baseURL  = flag.String("base-url", "", "Base URL for the server (default: empty or BASE_URL env var)")
		help     = flag.Bool("help", false, "Show this help message")
		version  = flag.Bool("version", false, "Show version information")
	)
	flag.Parse()

	// ヘルプメッセージの表示
	if *help {
		showHelp()
		os.Exit(0)
	}

	// バージョン情報の表示
	if *version {
		showVersion()
		os.Exit(0)
	}

	// 設定の読み込み
	cfg := config.Load()

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
		cfg.BaseURL = *baseURL
	}

	logger.Init(cfg.LogLevel)

	mux := http.NewServeMux()

	// BaseURLが設定されている場合のパス設定
	apiPath := "/api/"
	rootPath := "/"
	stripPrefix := "/api"
	if cfg.BaseURL != "" {
		apiPath = cfg.BaseURL + "/api/"
		rootPath = cfg.BaseURL + "/"
		stripPrefix = cfg.BaseURL + "/api"
	}

	mux.Handle(apiPath, http.StripPrefix(stripPrefix, api.NewRouter()))
	mux.Handle(rootPath, http.FileServer(web.BuildHttp()))

	log.Printf("Starting server on port %s", cfg.Port)
	err := http.ListenAndServe(":"+cfg.Port, mux)
	if err != nil {
		logger.Fatal(err, "Failed to start server.")
	}
}

func showHelp() {
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

func showVersion() {
	versionInfo := version.Get()
	fmt.Println("Paperspace Stable Diffusion Station")
	fmt.Printf("Version: %s\n", versionInfo.Version)
	fmt.Printf("Build Time: %s\n", versionInfo.BuildTime)
	fmt.Printf("Git Commit: %s\n", versionInfo.GitCommit)
	fmt.Printf("Go Version: %s\n", versionInfo.GoVersion)
}
