## Paperspace Stable Diffusion Station

```
/
├── cmd/
│   └── server/
│       └── main.go                 # エントリーポイント
├── internal/
│   ├── api/
│   │   ├── handlers.go            # REST API ハンドラー
│   │   ├── websocket.go           # WebSocket 処理
│   │   └── middleware.go          # CORS, ログ等のミドルウェア
│   ├── command/
│   │   ├── executor.go            # Linuxコマンド実行
│   │   ├── async.go               # 非同期ジョブ管理
│   │   └── types.go               # コマンド関連の型定義
│   ├── db/
│   │   ├── sqlite.go              # SQLite操作
│   │   ├── models.go              # データモデル
│   │   └── migrations.go          # DBマイグレーション
│   ├── server/
│   │   ├── server.go              # HTTPサーバー設定
│   │   └── routes.go              # ルーティング設定
│   └── config/
│       └── config.go              # 設定管理
├── pkg/
│   └── logger/
│       └── logger.go              # 共通ログ機能
├── web/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                # shadcn/ui コンポーネント
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   └── badge.tsx
│   │   │   ├── CommandExecutor.tsx
│   │   │   ├── ResourceManager.tsx
│   │   │   ├── DownloadProgress.tsx
│   │   │   └── App.tsx
│   │   ├── hooks/
│   │   │   ├── useWebSocket.ts
│   │   │   ├── useCommands.ts
│   │   │   └── useResources.ts
│   │   ├── types/
│   │   │   ├── api.ts             # API型定義
│   │   │   ├── command.ts
│   │   │   └── resource.ts
│   │   ├── lib/
│   │   │   ├── utils.ts
│   │   │   └── api.ts             # API クライアント
│   │   ├── styles/
│   │   │   └── globals.css
│   │   └── main.tsx
│   ├── public/
│   │   ├── favicon.ico
│   │   └── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── components.json            # shadcn/ui設定
├── embed/
│   └── dist/                      # ビルド後のフロントエンド
│       ├── index.html
│       ├── assets/
│       │   ├── index.js
│       │   └── index.css
│       └── favicon.ico
├── scripts/
│   ├── build.sh                   # 全体ビルドスクリプト
│   ├── build-frontend.sh          # フロントエンドビルド
│   ├── embed-static.sh            # 静的ファイル埋め込み
│   └── dev.sh                     # 開発用スクリプト
├── deployments/
│   ├── Dockerfile
│   └── docker-compose.yml
├── go.mod
├── go.sum
├── Makefile
├── .gitignore
├── .env.example
└── README.md
```

## 使用方法

### サーバーの起動

```bash
# デフォルトポート（8080）で起動
./bin/server

# 特定のポートで起動
./bin/server -port 3000

# ログレベルを指定して起動
./bin/server -port 8080 -log-level debug

# 環境変数でポートを指定
PORT=3000 ./bin/server

# BaseURLを指定して起動
./bin/server --base-url /myapp

# 環境変数でBaseURLを指定
BASE_URL=/myapp ./bin/server
```

### コマンドライン引数

| 引数 | 説明 | デフォルト |
|------|------|------------|
| `-port` | サーバーのポート番号 | 8080 または PORT 環境変数 |
| `-log-level` | ログレベル (debug, info, warn, error) | info または LOG_LEVEL 環境変数 |
| `-db-path` | データベースファイルのパス | ./data.db または DB_PATH 環境変数 |
| `-base-url`, `--base-url` | サーバーのベースURL | 空文字列または BASE_URL 環境変数 |
| `-help` | ヘルプメッセージを表示 | - |
| `-version` | バージョン情報を表示 | - |

### 環境変数

| 変数名 | 説明 | デフォルト |
|--------|------|------------|
| `PORT` | サーバーのポート番号 | 8080 |
| `LOG_LEVEL` | ログレベル | info |
| `DB_PATH` | データベースファイルのパス | ./data.db |
| `BASE_URL` | サーバーのベースURL | 空文字列 |

### 例

```bash
# ヘルプを表示
./bin/server -help

# バージョン情報を表示
./bin/server -version

# ポート3000でデバッグモードで起動
./bin/server -port 3000 -log-level debug

# 環境変数を使用
PORT=3000 LOG_LEVEL=debug ./bin/server
```
