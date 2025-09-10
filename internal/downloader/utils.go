package downloader

import (
	"path/filepath"
	"strings"
)

// ExtractFilenameFromURL extracts filename from URL
func ExtractFilenameFromURL(url string) string {
	parts := strings.Split(url, "/")
	if len(parts) > 0 {
		filename := parts[len(parts)-1]
		// Remove query parameters
		if idx := strings.Index(filename, "?"); idx != -1 {
			filename = filename[:idx]
		}
		// Remove fragment
		if idx := strings.Index(filename, "#"); idx != -1 {
			filename = filename[:idx]
		}
		if filename != "" {
			return filename
		}
	}
	return ""
}

// SanitizeFilename creates a safe filename from resource name
func SanitizeFilename(name string) string {
	// Replace invalid characters with underscores
	invalidChars := []string{"/", "\\", ":", "*", "?", "\"", "<", ">", "|"}
	filename := name
	for _, char := range invalidChars {
		filename = strings.ReplaceAll(filename, char, "_")
	}
	return filename
}

// GenerateOutputPath generates the full output path for a download
func GenerateOutputPath(installPath, url, resourceName string) string {
	// Extract filename from URL or use resource name
	filename := ExtractFilenameFromURL(url)
	if filename == "" {
		filename = SanitizeFilename(resourceName)
		// Add appropriate extension based on URL
		if strings.Contains(url, ".zip") {
			filename += ".zip"
		} else if strings.Contains(url, ".tar.gz") {
			filename += ".tar.gz"
		} else if strings.Contains(url, ".tar") {
			filename += ".tar"
		} else if strings.Contains(url, ".7z") {
			filename += ".7z"
		}
	}

	return filepath.Join(installPath, filename)
}
