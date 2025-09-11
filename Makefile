.PHONY: build build-frontend build-backend clean dev

# 全体ビルド
build: build-frontend build-backend

# フロントエンドビルド
build-frontend:
	cd web && npm install
	cd web && npm run build
	@echo "Frontend build completed"

# バックエンドビルド
build-backend:
	go mod tidy
	go build -o bin/server cmd/server/main.go
	@echo "Backend build completed"

# 開発用サーバー起動
dev:
	cd web && npm run dev

# バックエンド開発サーバー起動（自動リロード付き）
dev-backend:
	air

# バックエンド開発サーバー起動（通常）
dev-backend-simple:
	go run cmd/server/main.go

# フロントエンド開発サーバー起動
dev-frontend:
	cd web && npm run dev

# 開発環境セットアップ
setup:
	cd web && npm install
	go mod tidy
	@echo "Development environment setup completed"

# クリーンアップ
clean:
	rm -rf web/dist
	rm -rf bin/
	rm -rf embed/dist/*
	@echo "Clean completed"

# 単一バイナリ作成
single-binary: build-frontend build-backend
	@echo "Single binary created: bin/server"

# Linux用バイナリ作成
build-linux: build-frontend
	go mod tidy
	GOOS=linux GOARCH=amd64 go build -o bin/server-linux cmd/server/main.go
	@echo "Linux binary created: bin/server-linux"

# Linux用バイナリ作成（ARM64）
build-linux-arm64: build-frontend
	go mod tidy
	GOOS=linux GOARCH=arm64 go build -o bin/server-linux-arm64 cmd/server/main.go
	@echo "Linux ARM64 binary created: bin/server-linux-arm64"

# 全プラットフォーム用バイナリ作成
build-all: build-frontend
	go mod tidy
	@echo "Building for all platforms..."
	GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o bin/server-linux cmd/server/main.go
	GOOS=linux GOARCH=arm64 go build -ldflags="-s -w" -o bin/server-linux-arm64 cmd/server/main.go
	GOOS=windows GOARCH=amd64 go build -ldflags="-s -w" -o bin/server-windows.exe cmd/server/main.go
	GOOS=darwin GOARCH=amd64 go build -ldflags="-s -w" -o bin/server-macos-amd64 cmd/server/main.go
	GOOS=darwin GOARCH=arm64 go build -ldflags="-s -w" -o bin/server-macos-arm64 cmd/server/main.go
	@echo "All platform binaries created in bin/"

# リリース用アーカイブ作成
create-release-archives: build-all
	@echo "Creating release archives..."
	mkdir -p release
	cp bin/server-linux release/
	cp bin/server-linux-arm64 release/
	cp bin/server-windows.exe release/
	cp bin/server-macos-amd64 release/
	cp bin/server-macos-arm64 release/
	cp -r web/dist release/web/
	cp README.md release/
	cp LICENSE release/
	cp env.example release/
	
	# Create archives for each platform
	tar -czf paperspace-stable-diffusion-station-linux-amd64.tar.gz -C release server-linux web README.md LICENSE env.example
	tar -czf paperspace-stable-diffusion-station-linux-arm64.tar.gz -C release server-linux-arm64 web README.md LICENSE env.example
	zip -r paperspace-stable-diffusion-station-windows-amd64.zip release/server-windows.exe release/web release/README.md release/LICENSE release/env.example
	tar -czf paperspace-stable-diffusion-station-macos-amd64.tar.gz -C release server-macos-amd64 web README.md LICENSE env.example
	tar -czf paperspace-stable-diffusion-station-macos-arm64.tar.gz -C release server-macos-arm64 web README.md LICENSE env.example
	@echo "Release archives created"

