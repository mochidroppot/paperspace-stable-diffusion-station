package handler

import (
	"time"

	"paperspace-stable-diffusion-station/internal/config"
)

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
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Type        string    `json:"type"` // model, extension, script, custom
	URL         string    `json:"url,omitempty"`
	Size        *SizeInfo `json:"size,omitempty"`
	Description string    `json:"description,omitempty"`
	Tags        []string  `json:"tags,omitempty"`
}

type SizeInfo struct {
	Value float64 `json:"value"`
	Unit  string  `json:"unit"`
}

type InstallDestination struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Path string `json:"path"`
	Type string `json:"type"` // models, extensions, scripts, custom
}

// Installation destination response for API
type InstallationDestination struct {
	Type string `json:"type"`
	Path string `json:"path"`
}

type InstallationDestinationsResponse struct {
	Destinations []InstallationDestination `json:"destinations"`
}

type InstallRequest struct {
	URL  string `json:"url"`
	Name string `json:"name"`
	Path string `json:"path"`
	Type string `json:"type,omitempty"` // Optional: for display purposes
}

type InstallResponse struct {
	TaskID  string `json:"taskId"`
	Status  string `json:"status"`
	Message string `json:"message"`
}

type InstallTask struct {
	ID        string     `json:"id"`
	URL       string     `json:"url"`
	Name      string     `json:"name"`
	Path      string     `json:"path"`
	Type      string     `json:"type,omitempty"`
	Status    string     `json:"status"` // pending, downloading, installing, completed, failed, cancelled
	Progress  float64    `json:"progress"`
	Error     string     `json:"error,omitempty"`
	StartTime time.Time  `json:"startTime"`
	EndTime   *time.Time `json:"endTime,omitempty"`
}

// Preset resource response data structure
type PresetResourcesResponse struct {
	Resources []config.PresetResource `json:"resources"`
}
