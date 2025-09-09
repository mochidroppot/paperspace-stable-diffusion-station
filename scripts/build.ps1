# Paperspace Stable Diffusion Station Build Script

Write-Host "Building Paperspace Stable Diffusion Station..." -ForegroundColor Green

# フロントエンドビルド
Write-Host "Building frontend..." -ForegroundColor Yellow
Set-Location web
npm install
npm run build
Set-Location ..

# ビルド結果をembedディレクトリにコピー
Write-Host "Copying frontend build to embed directory..." -ForegroundColor Yellow
if (Test-Path "web/dist") {
    Copy-Item -Path "web/dist/*" -Destination "embed/dist/" -Recurse -Force
    Write-Host "Frontend build copied successfully" -ForegroundColor Green
} else {
    Write-Host "Warning: web/dist directory not found" -ForegroundColor Red
}

# バックエンドビルド
Write-Host "Building backend..." -ForegroundColor Yellow
go mod tidy
go build -o bin/server.exe cmd/server/main.go

if (Test-Path "bin/server.exe") {
    Write-Host "Build completed successfully!" -ForegroundColor Green
    Write-Host "Binary location: bin/server.exe" -ForegroundColor Cyan
} else {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

