package main

import (
	"flag"
	"os"

	"paperspace-stable-diffusion-station/internal/config"
	"paperspace-stable-diffusion-station/internal/handlers"
	"paperspace-stable-diffusion-station/internal/server"
	"paperspace-stable-diffusion-station/pkg/logger"
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
		handlers.ShowHelp()
		os.Exit(0)
	}

	// バージョン情報の表示
	if *version {
		handlers.ShowVersion()
		os.Exit(0)
	}

	// 設定の読み込み
	cfg := config.Load()

	// コマンドライン引数で上書き
	handlers.ProcessConfig(cfg, port, logLevel, dbPath, baseURL)

	// ロガーの初期化
	logger.Init(cfg.LogLevel)

	// サーバーの作成と設定
	srv := server.New(cfg)
	srv.SetupRoutes()

	// サーバーの起動
	err := srv.Start()
	if err != nil {
		logger.Fatal(err, "Failed to start server.")
	}
}
