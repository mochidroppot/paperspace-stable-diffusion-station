package handler

import (
	"encoding/json"
	"net/http"
	"runtime"
	"time"
)

// DashboardHandler handles the dashboard endpoint
func DashboardHandler(w http.ResponseWriter, r *http.Request) {
	// Get system memory stats
	var m runtime.MemStats
	runtime.ReadMemStats(&m)

	// Calculate memory usage percentage (simplified)
	memoryUsage := float64(m.Alloc) / float64(m.Sys) * 100
	if memoryUsage > 100 {
		memoryUsage = 100
	}

	// Calculate uptime
	uptime := time.Since(GetStartTime())
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

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}
