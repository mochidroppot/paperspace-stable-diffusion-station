package downloader

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"regexp"
	"strconv"
	"strings"
)

// DownloadTask represents a download task with progress tracking
type DownloadTask struct {
	URL      string
	FilePath string
	Progress float64
	Error    error
	// Progress callback function
	ProgressCallback func(progress float64)
	// Additional progress information
	DownloadedBytes int64
	TotalBytes      int64
	DownloadSpeed   string
	ETA             string
}

// Downloader interface for different download methods
type Downloader interface {
	Download(task *DownloadTask) error
}

// WgetDownloader implements download using wget command
type WgetDownloader struct{}

// HTTPDownloader implements download using Go's HTTP client
type HTTPDownloader struct{}

// NewDownloader creates a new downloader instance
// Always use wget as per requirements
func NewDownloader() Downloader {
	return &WgetDownloader{}
}

// Download downloads a file using wget command
func (w *WgetDownloader) Download(task *DownloadTask) error {
	// Check if wget is available
	if !isWgetAvailable() {
		return fmt.Errorf("wget command is not available on this system")
	}

	// Use wget command
	cmd := exec.Command("wget",
		"--progress=bar:force",
		"--show-progress",
		"-O", task.FilePath,
		task.URL)

	// Create a pipe to capture wget output for progress tracking
	stderr, err := cmd.StderrPipe()
	if err != nil {
		return fmt.Errorf("failed to create stderr pipe: %v", err)
	}

	// Start the command
	if err := cmd.Start(); err != nil {
		return fmt.Errorf("failed to start wget: %v", err)
	}

	// Monitor progress
	go monitorWgetProgress(task, stderr)

	// Wait for command to complete
	if err := cmd.Wait(); err != nil {
		return fmt.Errorf("wget command failed: %v", err)
	}

	// Verify file was downloaded
	if _, err := os.Stat(task.FilePath); os.IsNotExist(err) {
		return fmt.Errorf("downloaded file not found: %s", task.FilePath)
	}

	return nil
}

// Download downloads a file using Go's HTTP client
func (h *HTTPDownloader) Download(task *DownloadTask) error {
	// Create HTTP request
	req, err := http.NewRequest("GET", task.URL, nil)
	if err != nil {
		return fmt.Errorf("failed to create request: %v", err)
	}

	// Make HTTP request
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to download: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("download failed with status: %d", resp.StatusCode)
	}

	// Get content length for progress tracking
	contentLength := resp.ContentLength
	if contentLength <= 0 {
		contentLength = 0
	}

	// Create output file
	file, err := os.Create(task.FilePath)
	if err != nil {
		return fmt.Errorf("failed to create output file: %v", err)
	}
	defer file.Close()

	// Download with progress tracking
	progress := int64(0)
	buffer := make([]byte, 32*1024) // 32KB buffer

	for {
		n, err := resp.Body.Read(buffer)
		if n > 0 {
			if _, writeErr := file.Write(buffer[:n]); writeErr != nil {
				return fmt.Errorf("failed to write to file: %v", writeErr)
			}
			progress += int64(n)

			// Update progress
			if contentLength > 0 {
				progressPercent := float64(progress) / float64(contentLength) * 100
				task.Progress = progressPercent
			}
		}

		if err == io.EOF {
			break
		}
		if err != nil {
			return fmt.Errorf("failed to read response: %v", err)
		}
	}

	return nil
}

// monitorWgetProgress monitors wget output for progress updates
func monitorWgetProgress(task *DownloadTask, stderr io.ReadCloser) {
	// Read stderr for progress information
	buffer := make([]byte, 1024)
	lastProgress := float64(-1)

	for {
		n, err := stderr.Read(buffer)
		if n > 0 {
			output := string(buffer[:n])

			// Parse wget progress output
			progressInfo := parseWgetProgress(output)
			if progressInfo.Percentage >= 0 && progressInfo.Percentage != lastProgress {
				// Only update if progress has changed
				task.Progress = progressInfo.Percentage
				task.DownloadedBytes = progressInfo.DownloadedBytes
				task.TotalBytes = progressInfo.TotalBytes
				task.DownloadSpeed = progressInfo.DownloadSpeed
				task.ETA = progressInfo.ETA
				lastProgress = progressInfo.Percentage

				// Call progress callback if available
				if task.ProgressCallback != nil {
					task.ProgressCallback(progressInfo.Percentage)
				}
			}
		}
		if err != nil {
			// End of stream or error - this is normal when wget completes
			break
		}
	}
}

// ProgressInfo contains detailed progress information
type ProgressInfo struct {
	Percentage      float64
	DownloadedBytes int64
	TotalBytes      int64
	DownloadSpeed   string
	ETA             string
}

// parseWgetProgress extracts detailed progress information from wget output
func parseWgetProgress(output string) ProgressInfo {
	// wget progress format examples:
	// " 45%[======>                    ] 1,234,567  1.23MB/s  eta 0m 30s"
	// " 100%[========================>] 2,345,678  2.34MB/s  in 1m 30s"
	// " 67%[============>              ] 1,234,567  2.34MB/s  eta 0m 15s"

	// Enhanced regex pattern to capture more information
	// Matches: percentage, downloaded bytes, total bytes, speed, eta/time
	progressRegex := regexp.MustCompile(`\s*(\d+(?:\.\d+)?)%\[.*?\]\s+([0-9,]+)\s+([0-9,]+)\s+([0-9.]+[KMGT]?B/s)\s+(?:eta|in)\s+(\d+m\s+\d+s|\d+s)`)

	lines := strings.Split(output, "\n")
	for _, line := range lines {
		// Look for percentage pattern with progress bar
		if strings.Contains(line, "%") && strings.Contains(line, "[") {
			matches := progressRegex.FindStringSubmatch(line)
			if len(matches) >= 6 {
				// Parse percentage
				if percent, err := strconv.ParseFloat(matches[1], 64); err == nil && percent >= 0 && percent <= 100 {
					// Parse downloaded bytes
					downloadedStr := strings.ReplaceAll(matches[2], ",", "")
					downloadedBytes, _ := strconv.ParseInt(downloadedStr, 10, 64)

					// Parse total bytes
					totalStr := strings.ReplaceAll(matches[3], ",", "")
					totalBytes, _ := strconv.ParseInt(totalStr, 10, 64)

					// Extract speed and ETA
					speed := matches[4]
					eta := matches[5]

					return ProgressInfo{
						Percentage:      percent,
						DownloadedBytes: downloadedBytes,
						TotalBytes:      totalBytes,
						DownloadSpeed:   speed,
						ETA:             eta,
					}
				}
			}
		}
	}
	return ProgressInfo{Percentage: -1} // No progress found
}

// isWgetAvailable checks if wget command is available
func isWgetAvailable() bool {
	_, err := exec.LookPath("wget")
	return err == nil
}
