package handler

import (
	"fmt"
	"time"
)

// システム開始時間（グローバル変数）
var startTime = time.Now()

// アップタイムをフォーマットする関数
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

// システム開始時間を取得
func GetStartTime() time.Time {
	return startTime
}
