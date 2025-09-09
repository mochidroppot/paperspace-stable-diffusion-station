package api

import (
	"net/http"

	"paperspace-stable-diffusion-station/pkg/logger"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Development only: implement proper origin check for production
	},
}

func WebSocketHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		logger.Error(err, "WebSocket upgrade failed")
		return
	}
	defer conn.Close()

	logger.Info("WebSocket connection established")

	for {
		messageType, message, err := conn.ReadMessage()
		if err != nil {
			logger.Error(err, "WebSocket read error")
			break
		}

		logger.Debug("Received message: %s", string(message))

		// Echo back
		err = conn.WriteMessage(messageType, message)
		if err != nil {
			logger.Error(err, "WebSocket write error")
			break
		}
	}
}
