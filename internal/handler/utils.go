package handler

import (
	"fmt"
	"time"
)

// Global variable for system start time
var startTime = time.Now()

// formatUptime formats the uptime duration into a human-readable string
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

// GetStartTime returns the system start time
func GetStartTime() time.Time {
	return startTime
}
