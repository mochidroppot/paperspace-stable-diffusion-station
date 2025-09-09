package api

import (
	"net/http"
)

// NewRouter は新しいAPIルーターを作成し、ルートを設定します。
func NewRouter() http.Handler {
	router := http.NewServeMux()

	// ヘルスチェック
	router.HandleFunc("GET /health", healthCheckHandler)
	
	// ダッシュボード
	router.HandleFunc("GET /api/dashboard", dashboardHandler)
	router.HandleFunc("OPTIONS /api/dashboard", dashboardHandler)
	
	// リソースインストーラー
	router.HandleFunc("POST /installer/install", installHandler)
	router.HandleFunc("OPTIONS /installer/install", installHandler)
	router.HandleFunc("GET /installer/status", getInstallStatusHandler)
	router.HandleFunc("OPTIONS /installer/status", getInstallStatusHandler)
	router.HandleFunc("POST /installer/cancel", cancelInstallHandler)
	router.HandleFunc("OPTIONS /installer/cancel", cancelInstallHandler)
	router.HandleFunc("GET /installer/tasks", getAllInstallTasksHandler)
	router.HandleFunc("OPTIONS /installer/tasks", getAllInstallTasksHandler)

	return router
}
