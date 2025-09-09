# System Dashboard

A modern, responsive dashboard built with React and Go that provides real-time system monitoring and management capabilities.

## Features

### 📊 Real-time Metrics
- **System Statistics**: Total users, active connections, system uptime
- **Resource Monitoring**: CPU, memory, and disk usage with progress bars
- **Performance Metrics**: Requests per minute and error rates
- **Database Status**: Connection pool health and query performance

### 🎨 Modern UI/UX
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Theme**: Automatic theme switching based on system preferences
- **Interactive Components**: Hover effects, smooth transitions, and loading states
- **Accessibility**: Proper ARIA labels and keyboard navigation support

### 🔄 Real-time Updates
- **Auto-refresh**: Dashboard updates every 30 seconds
- **Live Activity Feed**: Recent system events and notifications
- **Status Indicators**: Color-coded badges for different activity types
- **Error Handling**: Graceful fallback to mock data if API is unavailable

### 🛠️ Quick Actions
- **System Logs**: Quick access to system logs
- **Data Export**: Export dashboard data
- **Settings**: System configuration access
- **User Management**: User administration tools

## Technology Stack

### Frontend
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **Lucide React** for icons
- **Vite** for build tooling

### Backend
- **Go** with standard library
- **HTTP/HTTPS** server
- **CORS** enabled for cross-origin requests
- **JSON** API responses
- **Real-time** system metrics

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Go 1.21+

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. **Setup development environment**
   ```bash
   make setup
   ```

3. **Start the backend server**
   ```bash
   make dev-backend
   ```
   The API will be available at `http://localhost:8080`

4. **Start the frontend development server** (in a new terminal)
   ```bash
   make dev-frontend
   ```
   The dashboard will be available at `http://localhost:5173`

### API Endpoints

- `GET /health` - Health check endpoint
- `GET /api/dashboard` - Dashboard data (stats and recent activity)

### Building for Production

```bash
# Build both frontend and backend
make build

# Create single binary with embedded frontend
make single-binary
```

## Dashboard Components

### Statistics Cards
- **Total Users**: Displays current user count with growth percentage
- **Active Connections**: Shows real-time connection count
- **System Uptime**: Displays server uptime in human-readable format
- **Requests/min**: Shows current request rate

### System Resources
- **CPU Usage**: Real-time CPU utilization with progress bar
- **Memory Usage**: Current memory consumption percentage
- **Disk Usage**: Storage utilization with visual indicator

### Database Status
- **Connection Pool**: Health status of database connections
- **Query Performance**: Database query performance metrics
- **Error Rate**: Current database error percentage

### Recent Activity
- **Event Types**: Success, info, warning, and error events
- **Timestamps**: Human-readable relative timestamps
- **Status Badges**: Color-coded activity indicators

## Customization

### Adding New Metrics
1. Update the `DashboardStats` interface in both frontend and backend
2. Add the metric to the API response in `handlers.go`
3. Create a new card component in the dashboard
4. Update the data fetching logic

### Styling
- Modify `App.css` for global styles
- Use Tailwind CSS classes for component styling
- Update the theme variables for color customization

### API Integration
- Replace mock data in `handlers.go` with real system metrics
- Add authentication middleware if needed
- Implement rate limiting for API endpoints

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.