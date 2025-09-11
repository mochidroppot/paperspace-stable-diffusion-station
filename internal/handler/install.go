package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"paperspace-stable-diffusion-station/internal/downloader"
	"sync"
	"time"
)

// Global variables for managing installation tasks
var installTasks = make(map[string]*InstallTask)
var installTasksMutex sync.RWMutex

// InstallHandler handles the resource installation endpoint
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

	// Validation
	if req.URL == "" {
		http.Error(w, "URL is required", http.StatusBadRequest)
		return
	}
	if req.Name == "" {
		http.Error(w, "Name is required", http.StatusBadRequest)
		return
	}
	if req.Path == "" {
		http.Error(w, "Path is required", http.StatusBadRequest)
		return
	}

	// Generate task ID
	taskID := fmt.Sprintf("task_%d", time.Now().UnixNano())

	// Create installation task
	task := &InstallTask{
		ID:        taskID,
		URL:       req.URL,
		Name:      req.Name,
		Path:      req.Path,
		Type:      req.Type,
		Status:    "pending",
		Progress:  0,
		StartTime: time.Now(),
	}

	// Store task in map
	installTasksMutex.Lock()
	installTasks[taskID] = task
	installTasksMutex.Unlock()

	// Start installation process asynchronously
	go processInstallation(task)

	// Return response
	response := InstallResponse{
		TaskID:  taskID,
		Status:  "pending",
		Message: "Installation task created successfully",
	}

	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}

// processInstallation executes the installation process
func processInstallation(task *InstallTask) {
	installTasksMutex.Lock()
	task.Status = "downloading"
	installTasksMutex.Unlock()

	// Create installation directory using destination path directly
	installPath := task.Path
	if err := os.MkdirAll(installPath, 0755); err != nil {
		installTasksMutex.Lock()
		task.Status = "failed"
		task.Error = fmt.Sprintf("Failed to create directory: %v", err)
		now := time.Now()
		task.EndTime = &now
		installTasksMutex.Unlock()
		return
	}

	// Check if resource has URL for download
	if task.URL == "" {
		installTasksMutex.Lock()
		task.Status = "failed"
		task.Error = "No URL provided for resource download"
		now := time.Now()
		task.EndTime = &now
		installTasksMutex.Unlock()
		return
	}

	// Download file using downloader package
	if err := downloadFile(task, installPath); err != nil {
		installTasksMutex.Lock()
		task.Status = "failed"
		task.Error = fmt.Sprintf("Download failed: %v", err)
		now := time.Now()
		task.EndTime = &now
		installTasksMutex.Unlock()
		return
	}

	// Installation completed
	installTasksMutex.Lock()
	task.Status = "completed"
	task.Progress = 100
	now := time.Now()
	task.EndTime = &now
	installTasksMutex.Unlock()
}

// downloadFile downloads a file using the downloader package
func downloadFile(task *InstallTask, installPath string) error {
	// Update status to installing
	installTasksMutex.Lock()
	task.Status = "installing"
	task.Progress = 0
	installTasksMutex.Unlock()

	// Generate output path
	outputPath := downloader.GenerateOutputPath(installPath, task.URL, task.Name)

	// Create download task with progress callback
	downloadTask := &downloader.DownloadTask{
		URL:      task.URL,
		FilePath: outputPath,
		Progress: 0,
		ProgressCallback: func(progress float64) {
			// Update task progress in real-time
			installTasksMutex.Lock()
			task.Progress = progress
			installTasksMutex.Unlock()
		},
	}

	// Create downloader and download
	dl := downloader.NewDownloader()
	if err := dl.Download(downloadTask); err != nil {
		return err
	}

	// Update progress to completion
	installTasksMutex.Lock()
	task.Progress = 100
	installTasksMutex.Unlock()

	return nil
}

// GetInstallStatusHandler handles getting the status of installation tasks
func GetInstallStatusHandler(w http.ResponseWriter, r *http.Request) {

	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get task ID from query parameters
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
	if err := json.NewEncoder(w).Encode(task); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}

// CancelInstallHandler handles cancelling installation tasks
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
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}

// GetAllInstallTasksHandler handles getting all installation tasks
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
	if err := json.NewEncoder(w).Encode(tasks); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}
