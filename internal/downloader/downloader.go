package downloader

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"strings"
)

// DownloadTask represents a download task with progress tracking
type DownloadTask struct {
	URL      string
	FilePath string
	Progress float64
	Error    error
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
func NewDownloader() Downloader {
	if isWgetAvailable() {
		return &WgetDownloader{}
	}
	return &HTTPDownloader{}
}

// Download downloads a file using wget command
func (w *WgetDownloader) Download(task *DownloadTask) error {
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
			file.Write(buffer[:n])
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
	for {
		n, err := stderr.Read(buffer)
		if n > 0 {
			output := string(buffer[:n])
			// Parse wget progress output (simplified)
			if strings.Contains(output, "%") {
				// Extract percentage from wget output
				// This is a simplified parser - wget output format can vary
				task.Progress = 75 // Move to 75% when wget shows progress
			}
		}
		if err != nil {
			break
		}
	}
}

// isWgetAvailable checks if wget command is available
func isWgetAvailable() bool {
	_, err := exec.LookPath("wget")
	return err == nil
}
