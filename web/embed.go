//go:build !dev

package web

import (
	"embed"
	"io/fs"
	"net/http"
	"paperspace-stable-diffusion-station/pkg/logger"
)

//go:embed dist/*
var StaticFiles embed.FS

func BuildHttp() http.FileSystem {
	build, err := fs.Sub(StaticFiles, "dist")
	if err != nil {
		logger.Fatal(err, "Failed to start server.")
	}
	return http.FS(build)
}
