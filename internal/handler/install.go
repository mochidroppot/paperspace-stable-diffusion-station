package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"sync"
	"time"
)

// インストールタスクの管理用グローバル変数
var installTasks = make(map[string]*InstallTask)
var installTasksMutex sync.RWMutex

// InstallHandler はリソースインストールエンドポイントのハンドラーです
func InstallHandler(w http.ResponseWriter, r *http.Request) {

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

// processInstallation はインストール処理を実行します
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

// GetInstallStatusHandler はインストールタスクの状態を取得するハンドラーです
func GetInstallStatusHandler(w http.ResponseWriter, r *http.Request) {

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

// CancelInstallHandler はインストールタスクをキャンセルするハンドラーです
func CancelInstallHandler(w http.ResponseWriter, r *http.Request) {

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

// GetAllInstallTasksHandler は全インストールタスクを取得するハンドラーです
func GetAllInstallTasksHandler(w http.ResponseWriter, r *http.Request) {

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
