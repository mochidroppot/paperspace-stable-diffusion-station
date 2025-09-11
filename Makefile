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

