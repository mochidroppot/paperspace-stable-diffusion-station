import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import Navigation from './Navigation'
import { 
  Users, 
  Activity, 
  TrendingUp, 
  Server, 
  Database, 
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface DashboardStats {
  totalUsers: number
  activeConnections: number
  systemUptime: string
  memoryUsage: number
  cpuUsage: number
  diskUsage: number
  requestsPerMinute: number
  errorRate: number
}

interface RecentActivity {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  message: string
  timestamp: string
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeConnections: 0,
    systemUptime: '0h 0m',
    memoryUsage: 0,
    cpuUsage: 0,
    diskUsage: 0,
    requestsPerMinute: 0,
    errorRate: 0
  })

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/dashboard')
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data')
        }
        
        const data = await response.json()
        setStats(data.stats)
        
        // Format timestamps for display
        const formattedActivity = data.recentActivity.map((activity: { timestamp: string; [key: string]: unknown }) => ({
          ...activity,
          timestamp: formatTimestamp(activity.timestamp)
        }))
        setRecentActivity(formattedActivity)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        // Fallback to mock data if API fails
        setStats({
          totalUsers: 1247,
          activeConnections: 89,
          systemUptime: '7d 14h 32m',
          memoryUsage: 68,
          cpuUsage: 23,
          diskUsage: 45,
          requestsPerMinute: 156,
          errorRate: 0.2
        })

        setRecentActivity([
          {
            id: '1',
            type: 'success',
            message: 'New user registered successfully',
            timestamp: '2 minutes ago'
          },
          {
            id: '2',
            type: 'info',
            message: 'System backup completed',
            timestamp: '15 minutes ago'
          },
          {
            id: '3',
            type: 'warning',
            message: 'High memory usage detected',
            timestamp: '1 hour ago'
          },
          {
            id: '4',
            type: 'error',
            message: 'Database connection timeout',
            timestamp: '2 hours ago'
          }
        ])
      }
    }

    fetchDashboardData()
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchDashboardData, 30000) // Update every 30 seconds
    
    return () => clearInterval(interval)
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-blue-500" />
    }
  }

  const getActivityBadgeVariant = (type: string) => {
    switch (type) {
      case 'success':
        return 'default' as const
      case 'warning':
        return 'secondary' as const
      case 'error':
        return 'destructive' as const
      default:
        return 'outline' as const
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Monitor your system performance and activity</p>
          </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeConnections}</div>
              <p className="text-xs text-muted-foreground">
                +3 from last hour
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.systemUptime}</div>
              <p className="text-xs text-muted-foreground">
                99.9% availability
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Requests/min</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.requestsPerMinute}</div>
              <p className="text-xs text-muted-foreground">
                +8% from last hour
              </p>
            </CardContent>
          </Card>
        </div>

        {/* System Resources */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                System Resources
              </CardTitle>
              <CardDescription>Current system resource usage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>CPU Usage</span>
                  <span>{stats.cpuUsage}%</span>
                </div>
                <Progress value={stats.cpuUsage} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Memory Usage</span>
                  <span>{stats.memoryUsage}%</span>
                </div>
                <Progress value={stats.memoryUsage} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Disk Usage</span>
                  <span>{stats.diskUsage}%</span>
                </div>
                <Progress value={stats.diskUsage} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Status
              </CardTitle>
              <CardDescription>Database performance metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Connection Pool</span>
                <Badge variant="default">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Query Performance</span>
                <Badge variant="default">Good</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Error Rate</span>
                <Badge variant={stats.errorRate < 1 ? "default" : "destructive"}>
                  {stats.errorRate}%
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common system operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors">
                View System Logs
              </button>
              <button className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors">
                Export Data
              </button>
              <button className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors">
                System Settings
              </button>
              <button className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors">
                User Management
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system events and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                  </div>
                  <Badge variant={getActivityBadgeVariant(activity.type)}>
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}

export default Dashboard