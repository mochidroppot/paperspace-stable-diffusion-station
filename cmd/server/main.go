package main

import (
	"log"
	"net/http"
	"paperspace-stable-diffusion-station/internal/api"

	"paperspace-stable-diffusion-station/internal/config"
	"paperspace-stable-diffusion-station/pkg/logger"
	"paperspace-stable-diffusion-station/web"
)

func main() {
	cfg := config.Load()
	logger.Init(cfg.LogLevel)

	mux := http.NewServeMux()
	mux.Handle("/api/", http.StripPrefix("/api", api.NewRouter()))
	mux.Handle("/", http.FileServer(web.BuildHttp()))

	log.Printf("Starting server on port %s", cfg.Port)
	err := http.ListenAndServe(":"+cfg.Port, mux)
	if err != nil {
		logger.Fatal(err, "Failed to start server.")
	}
}
