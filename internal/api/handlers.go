package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"runtime"
	"time"
	"os"
	"path/filepath"
	"strings"
	"sync"
)

type DashboardStats struct {
	TotalUsers        int     `json:"totalUsers"`
	ActiveConnections int     `json:"activeConnections"`
	SystemUptime      string  `json:"systemUptime"`
	MemoryUsage       float64 `json:"memoryUsage"`
	CPUUsage          float64 `json:"cpuUsage"`
	DiskUsage         float64 `json:"diskUsage"`
	RequestsPerMinute int     `json:"requestsPerMinute"`
	ErrorRate         float64 `json:"errorRate"`
}

type RecentActivity struct {
	ID        string    `json:"id"`
	Type      string    `json:"type"`
	Message   string    `json:"message"`
	Timestamp time.Time `json:"timestamp"`
}

type DashboardResponse struct {
	Stats          DashboardStats   `json:"stats"`
	RecentActivity []RecentActivity `json:"recentActivity"`
}

// リソースインストール関連のデータ構造
type Resource struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Type        string `json:"type"` // model, extension, script, custom
	URL         string `json:"url,omitempty"`
	Size        string `json:"size,omitempty"`
	Description string `json:"description,omitempty"`
}

type InstallDestination struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Path string `json:"path"`
	Type string `json:"type"` // models, extensions, scripts, custom
}

type InstallRequest struct {
	Resource    Resource          `json:"resource"`
	Destination InstallDestination `json:"destination"`
}

type InstallResponse struct {
	TaskID string `json:"taskId"`
	Status string `json:"status"`
	Message string `json:"message"`
}

type InstallTask struct {
	ID          string    `json:"id"`
	Resource    Resource  `json:"resource"`
	Destination InstallDestination `json:"destination"`
	Status      string    `json:"status"` // pending, downloading, installing, completed, failed, cancelled
	Progress    float64   `json:"progress"`
	Error       string    `json:"error,omitempty"`
	StartTime   time.Time `json:"startTime"`
	EndTime     *time.Time `json:"endTime,omitempty"`
}

var startTime = time.Now()
var installTasks = make(map[string]*InstallTask)
var installTasksMutex sync.RWMutex

func healthCheckHandler(w http.ResponseWriter, r *http.Request) {
	response := map[string]string{"status": "ok"}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func dashboardHandler(w http.ResponseWriter, r *http.Request) {
	// Get system memory stats
	var m runtime.MemStats
	runtime.ReadMemStats(&m)
	
	// Calculate memory usage percentage (simplified)
	memoryUsage := float64(m.Alloc) / float64(m.Sys) * 100
	if memoryUsage > 100 {
		memoryUsage = 100
	}

	// Calculate uptime
	uptime := time.Since(startTime)
	uptimeStr := formatUptime(uptime)

	stats := DashboardStats{
		TotalUsers:        1247,
		ActiveConnections: 89,
		SystemUptime:      uptimeStr,
		MemoryUsage:       memoryUsage,
		CPUUsage:          23.5, // This would need actual CPU monitoring
		DiskUsage:         45.2, // This would need actual disk monitoring
		RequestsPerMinute: 156,
		ErrorRate:         0.2,
	}

	recentActivity := []RecentActivity{
		{
			ID:        "1",
			Type:      "success",
			Message:   "New user registered successfully",
			Timestamp: time.Now().Add(-2 * time.Minute),
		},
		{
			ID:        "2",
			Type:      "info",
			Message:   "System backup completed",
			Timestamp: time.Now().Add(-15 * time.Minute),
		},
		{
			ID:        "3",
			Type:      "warning",
			Message:   "High memory usage detected",
			Timestamp: time.Now().Add(-1 * time.Hour),
		},
		{
			ID:        "4",
			Type:      "error",
			Message:   "Database connection timeout",
			Timestamp: time.Now().Add(-2 * time.Hour),
		},
	}

	response := DashboardResponse{
		Stats:          stats,
		RecentActivity: recentActivity,
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func formatUptime(d time.Duration) string {
	days := int(d.Hours() / 24)
	hours := int(d.Hours()) % 24
	minutes := int(d.Minutes()) % 60
	
	if days > 0 {
		return fmt.Sprintf("%dd %dh %dm", days, hours, minutes)
	} else if hours > 0 {
		return fmt.Sprintf("%dh %dm", hours, minutes)
	} else {
		return fmt.Sprintf("%dm", minutes)
	}
}

// インストールハンドラー
func installHandler(w http.ResponseWriter, r *http.Request) {
	// CORSヘッダーを設定
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req InstallRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// バリデーション
	if req.Resource.Name == "" {
		http.Error(w, "Resource name is required", http.StatusBadRequest)
		return
	}
	if req.Destination.Path == "" {
		http.Error(w, "Destination path is required", http.StatusBadRequest)
		return
	}

	// タスクIDを生成
	taskID := fmt.Sprintf("task_%d", time.Now().UnixNano())
	
	// インストールタスクを作成
	task := &InstallTask{
		ID:          taskID,
		Resource:    req.Resource,
		Destination: req.Destination,
		Status:      "pending",
		Progress:    0,
		StartTime:   time.Now(),
	}

	// タスクをマップに保存
	installTasksMutex.Lock()
	installTasks[taskID] = task
	installTasksMutex.Unlock()

	// 非同期でインストール処理を開始
	go processInstallation(task)

	// レスポンスを返す
	response := InstallResponse{
		TaskID:  taskID,
		Status:  "pending",
		Message: "Installation task created successfully",
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// インストール処理を実行
func processInstallation(task *InstallTask) {
	installTasksMutex.Lock()
	task.Status = "downloading"
	installTasksMutex.Unlock()

	// インストール先ディレクトリを作成
	installPath := filepath.Join("./data", task.Destination.Path)
	if err := os.MkdirAll(installPath, 0755); err != nil {
		installTasksMutex.Lock()
		task.Status = "failed"
		task.Error = fmt.Sprintf("Failed to create directory: %v", err)
		now := time.Now()
		task.EndTime = &now
		installTasksMutex.Unlock()
		return
	}

	// ダウンロード処理をシミュレート
	for i := 0; i <= 100; i += 10 {
		time.Sleep(500 * time.Millisecond) // 0.5秒待機
		
		installTasksMutex.Lock()
		task.Progress = float64(i)
		if i == 50 {
			task.Status = "installing"
		}
		installTasksMutex.Unlock()
	}

	// インストール完了
	installTasksMutex.Lock()
	task.Status = "completed"
	task.Progress = 100
	now := time.Now()
	task.EndTime = &now
	installTasksMutex.Unlock()
}

// インストールタスクの状態を取得
func getInstallStatusHandler(w http.ResponseWriter, r *http.Request) {
	// CORSヘッダーを設定
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// クエリパラメータからタスクIDを取得
	taskID := r.URL.Query().Get("taskId")
	if taskID == "" {
		http.Error(w, "taskId parameter is required", http.StatusBadRequest)
		return
	}

	installTasksMutex.RLock()
	task, exists := installTasks[taskID]
	installTasksMutex.RUnlock()

	if !exists {
		http.Error(w, "Task not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(task)
}

// インストールタスクをキャンセル
func cancelInstallHandler(w http.ResponseWriter, r *http.Request) {
	// CORSヘッダーを設定
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		TaskID string `json:"taskId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	installTasksMutex.Lock()
	task, exists := installTasks[req.TaskID]
	if exists {
		task.Status = "cancelled"
		now := time.Now()
		task.EndTime = &now
	}
	installTasksMutex.Unlock()

	if !exists {
		http.Error(w, "Task not found", http.StatusNotFound)
		return
	}

	response := map[string]string{
		"status":  "cancelled",
		"message": "Task cancelled successfully",
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// 全インストールタスクを取得
func getAllInstallTasksHandler(w http.ResponseWriter, r *http.Request) {
	// CORSヘッダーを設定
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	installTasksMutex.RLock()
	tasks := make([]*InstallTask, 0, len(installTasks))
	for _, task := range installTasks {
		tasks = append(tasks, task)
	}
	installTasksMutex.RUnlock()

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(tasks)
}
