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
	if req.Resource.Name == "" {
		http.Error(w, "Resource name is required", http.StatusBadRequest)
		return
	}
	if req.Destination.Path == "" {
		http.Error(w, "Destination path is required", http.StatusBadRequest)
		return
	}

	// Generate task ID
	taskID := fmt.Sprintf("task_%d", time.Now().UnixNano())

	// Create installation task
	task := &InstallTask{
		ID:          taskID,
		Resource:    req.Resource,
		Destination: req.Destination,
		Status:      "pending",
		Progress:    0,
		StartTime:   time.Now(),
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
	json.NewEncoder(w).Encode(response)
}

// processInstallation executes the installation process
func processInstallation(task *InstallTask) {
	installTasksMutex.Lock()
	task.Status = "downloading"
	installTasksMutex.Unlock()

	// Create installation directory
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

	// Simulate download process
	for i := 0; i <= 100; i += 10 {
		time.Sleep(500 * time.Millisecond) // Wait 0.5 seconds

		installTasksMutex.Lock()
		task.Progress = float64(i)
		if i == 50 {
			task.Status = "installing"
		}
		installTasksMutex.Unlock()
	}

	// Installation completed
	installTasksMutex.Lock()
	task.Status = "completed"
	task.Progress = 100
	now := time.Now()
	task.EndTime = &now
	installTasksMutex.Unlock()
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
	json.NewEncoder(w).Encode(task)
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
	json.NewEncoder(w).Encode(response)
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
	json.NewEncoder(w).Encode(tasks)
}
