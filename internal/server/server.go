package server

import (
	"io"
	"log"
	"net/http"
	"strings"

	"paperspace-stable-diffusion-station/internal/api"
	"paperspace-stable-diffusion-station/internal/config"
	"paperspace-stable-diffusion-station/web"
)

// Server represents the HTTP server
type Server struct {
	config *config.Config
	mux    *http.ServeMux
}

// New creates a new server instance
func New(cfg *config.Config) *Server {
	return &Server{
		config: cfg,
		mux:    http.NewServeMux(),
	}
}

// SetupRoutes configures all routes for the server
func (s *Server) SetupRoutes() {
	// BaseURLの正規化
	normalizedBaseURL := s.normalizeBaseURL(s.config.BaseURL)

	// パス設定
	apiPath := "/api/"
	rootPath := "/"
	stripPrefix := "/api"

	if normalizedBaseURL != "" {
		apiPath = normalizedBaseURL + "/api/"
		rootPath = normalizedBaseURL + "/"
		stripPrefix = normalizedBaseURL + "/api"

		// ルートパス（/）も追加で登録
		s.mux.Handle("/", http.RedirectHandler(normalizedBaseURL+"/", http.StatusMovedPermanently))
	}

	log.Printf("API Path: %s, Root Path: %s, Strip Prefix: %s", apiPath, rootPath, stripPrefix)

	// APIハンドラーの登録
	s.mux.Handle(apiPath, http.StripPrefix(stripPrefix, api.NewRouter()))

	// 静的ファイルハンドラーの登録
	s.setupStaticHandler(rootPath, normalizedBaseURL)

	log.Printf("Handlers registered successfully")
}

// Start starts the HTTP server
func (s *Server) Start() error {
	log.Printf("Starting server on port %s", s.config.Port)
	return http.ListenAndServe(":"+s.config.Port, s.mux)
}

// normalizeBaseURL normalizes the BaseURL by removing Windows path conversion
func (s *Server) normalizeBaseURL(baseURL string) string {
	if baseURL == "" {
		return ""
	}

	// Windowsのパス変換を除去
	normalized := strings.TrimPrefix(baseURL, "C:/Program Files/Git")
	if !strings.HasPrefix(normalized, "/") {
		normalized = "/" + normalized
	}
	return strings.TrimSuffix(normalized, "/")
}

// setupStaticHandler sets up the static file handler with SPA fallback
func (s *Server) setupStaticHandler(rootPath, baseURL string) {
	staticHandler := s.createStaticHandler(baseURL)

	s.mux.HandleFunc(rootPath, func(w http.ResponseWriter, r *http.Request) {
		// ルートパスの場合はHTMLファイルを配信
		if r.URL.Path == rootPath || r.URL.Path == rootPath+"/" {
			s.serveHTML(w, r, baseURL)
			return
		}

		// 静的ファイルの存在確認
		relativePath := strings.TrimPrefix(r.URL.Path, baseURL+"/")
		if s.fileExists(relativePath) {
			staticHandler.ServeHTTP(w, r)
		} else {
			// SPAフォールバック
			s.serveHTML(w, r, baseURL)
		}
	})
}

// createStaticHandler creates a static file handler
func (s *Server) createStaticHandler(baseURL string) http.Handler {
	if baseURL == "" {
		return http.FileServer(web.BuildHttp())
	}

	stripPath := baseURL
	if !strings.HasSuffix(stripPath, "/") {
		stripPath = stripPath + "/"
	}
	return http.StripPrefix(stripPath, http.FileServer(web.BuildHttp()))
}

// fileExists checks if a file exists in the embedded filesystem
func (s *Server) fileExists(path string) bool {
	file, err := web.BuildHttp().Open(path)
	if err != nil {
		return false
	}
	file.Close()
	return true
}

// serveHTML serves the HTML file with BaseURL modifications
func (s *Server) serveHTML(w http.ResponseWriter, _ *http.Request, baseURL string) {
	file, err := web.BuildHttp().Open("index.html")
	if err != nil {
		http.Error(w, "File not found", http.StatusNotFound)
		return
	}
	defer file.Close()

	content, err := io.ReadAll(file)
	if err != nil {
		http.Error(w, "Error reading file", http.StatusInternalServerError)
		return
	}

	html := string(content)

	// BaseURLが設定されている場合、リソースパスを相対パスに変換
	if baseURL != "" {
		html = s.modifyHTMLForBaseURL(html, baseURL)
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	if _, err := w.Write([]byte(html)); err != nil {
		log.Printf("Error writing response: %v", err)
	}
}

// modifyHTMLForBaseURL modifies HTML content for BaseURL
func (s *Server) modifyHTMLForBaseURL(html, baseURL string) string {
	// 絶対パスを相対パスに変換（BaseURLの深さに応じて../を追加）
	depth := strings.Count(baseURL, "/") - 1
	relativePrefix := strings.Repeat("../", depth)

	// 絶対パスを相対パスに変換
	html = strings.ReplaceAll(html, `href="/`, `href="`+relativePrefix)
	html = strings.ReplaceAll(html, `src="/`, `src="`+relativePrefix)

	// React Router用のBaseURLを埋め込み
	html = strings.ReplaceAll(html, `<head>`, `<head>\n    <script>window.REACT_ROUTER_BASENAME = '`+baseURL+`';</script>`)

	return html
}
