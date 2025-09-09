package handler

import "time"

// Dashboard-related data structures
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

// Resource installation-related data structures
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
	Resource    Resource           `json:"resource"`
	Destination InstallDestination `json:"destination"`
}

type InstallResponse struct {
	TaskID  string `json:"taskId"`
	Status  string `json:"status"`
	Message string `json:"message"`
}

type InstallTask struct {
	ID          string             `json:"id"`
	Resource    Resource           `json:"resource"`
	Destination InstallDestination `json:"destination"`
	Status      string             `json:"status"` // pending, downloading, installing, completed, failed, cancelled
	Progress    float64            `json:"progress"`
	Error       string             `json:"error,omitempty"`
	StartTime   time.Time          `json:"startTime"`
	EndTime     *time.Time         `json:"endTime,omitempty"`
}
