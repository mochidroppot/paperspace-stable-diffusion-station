# Development Server Script

Write-Host "Starting development server..." -ForegroundColor Green

# フロントエンド開発サーバーを起動
Write-Host "Starting frontend development server..." -ForegroundColor Yellow
Set-Location web
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
Set-Location ..

# バックエンド開発サーバーを起動（自動リロード付き）
Write-Host "Starting backend development server with auto-reload..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "air"

Write-Host "Frontend development server started on http://localhost:5173" -ForegroundColor Green
Write-Host "Backend development server started with auto-reload" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow

