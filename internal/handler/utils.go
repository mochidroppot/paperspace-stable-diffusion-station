package handler

import (
	"time"
)

// Global variable for system start time
var startTime = time.Now()

// GetStartTime returns the system start time
func GetStartTime() time.Time {
	return startTime
}
