package config

import (
	"os"
)

type Config struct {
	Port     string
	LogLevel string
	DBPath   string
}

func Load() *Config {
	return &Config{
		Port:     getEnv("PORT", "8080"),
		LogLevel: getEnv("LOG_LEVEL", "info"),
		DBPath:   getEnv("DB_PATH", "./data.db"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
