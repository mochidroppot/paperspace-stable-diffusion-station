package handler

import (
	"encoding/json"
	"net/http"
)

// GetPresetResourcesHandler returns the list of preset resources
func GetPresetResourcesHandler(w http.ResponseWriter, r *http.Request) {
	// Set CORS headers
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	w.Header().Set("Content-Type", "application/json")

	// Handle preflight requests
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	// Only allow GET requests
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get preset resources
	resources := getPresetResources()

	// Create response
	response := PresetResourcesResponse{
		Resources: resources,
	}

	// Encode and send response
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}

// getPresetResources returns the list of preset resources
// This data is maintained in code as per user preference for OSS context
func getPresetResources() []PresetResource {
	return []PresetResource{
		{
			ID:            "stable-diffusion-xl",
			Name:          "Stable Diffusion XL",
			Type:          "model",
			Size:          "6.6 GB",
			Description:   "High-quality image generation model with improved resolution and detail",
			Category:      "Image Generation",
			Tags:          []string{"image-generation", "ai", "diffusion"},
			Version:       "1.0",
			Author:        "Stability AI",
			License:       "CreativeML Open RAIL++-M",
			Requirements:  []string{"CUDA 11.8+", "16GB+ VRAM"},
			Compatibility: []string{"AUTOMATIC1111", "ComfyUI", "InvokeAI"},
		},
		{
			ID:            "controlnet",
			Name:          "ControlNet Extension",
			Type:          "extension",
			Size:          "2.1 GB",
			Description:   "Extension for controlling image structure and composition",
			Category:      "Control",
			Tags:          []string{"control", "pose", "depth", "canny"},
			Version:       "1.1.4",
			Author:        "lllyasviel",
			License:       "Apache 2.0",
			Requirements:  []string{"AUTOMATIC1111", "ControlNet models"},
			Compatibility: []string{"AUTOMATIC1111"},
		},
		{
			ID:            "face-restore",
			Name:          "Face Restoration Script",
			Type:          "script",
			Size:          "150 MB",
			Description:   "Script for enhancing and restoring facial features in images",
			Category:      "Enhancement",
			Tags:          []string{"face", "restoration", "enhancement"},
			Version:       "1.0.2",
			Author:        "xinntao",
			License:       "MIT",
			Requirements:  []string{"AUTOMATIC1111", "GFPGAN model"},
			Compatibility: []string{"AUTOMATIC1111"},
		},
		{
			ID:            "anime-model",
			Name:          "Anime Style Model",
			Type:          "model",
			Size:          "4.2 GB",
			Description:   "Specialized model for anime-style image generation",
			Category:      "Art Style",
			Tags:          []string{"anime", "manga", "art-style"},
			Version:       "2.0",
			Author:        "Anime Community",
			License:       "Creative Commons",
			Requirements:  []string{"CUDA 11.8+", "8GB+ VRAM"},
			Compatibility: []string{"AUTOMATIC1111", "ComfyUI"},
		},
		{
			ID:            "lora-trainer",
			Name:          "LoRA Training Script",
			Type:          "script",
			Size:          "50 MB",
			Description:   "Script for training custom LoRA models with your own data",
			Category:      "Training",
			Tags:          []string{"training", "lora", "custom"},
			Version:       "1.0.0",
			Author:        "kohya-ss",
			License:       "MIT",
			Requirements:  []string{"Python 3.8+", "CUDA 11.8+"},
			Compatibility: []string{"AUTOMATIC1111"},
		},
		{
			ID:            "upscaler-esrgan",
			Name:          "ESRGAN Upscaler",
			Type:          "model",
			Size:          "67 MB",
			Description:   "Enhanced Super-Resolution GAN for image upscaling",
			Category:      "Upscaling",
			Tags:          []string{"upscaling", "super-resolution", "gan"},
			Version:       "1.0",
			Author:        "xinntao",
			License:       "Apache 2.0",
			Requirements:  []string{"AUTOMATIC1111"},
			Compatibility: []string{"AUTOMATIC1111", "ComfyUI"},
		},
	}
}
