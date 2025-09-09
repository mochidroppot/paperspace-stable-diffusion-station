import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Button } from './ui/button'
import Navigation from './Navigation'
import { 
  Download, 
  Package, 
  FolderOpen, 
  Link, 
  Play, 
  X, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Trash2
} from 'lucide-react'

interface Resource {
  id: string
  name: string
  type: 'model' | 'extension' | 'script' | 'custom'
  url?: string
  size?: string
  description?: string
}

interface InstallDestination {
  id: string
  name: string
  path: string
  type: 'models' | 'extensions' | 'scripts' | 'custom'
}

interface InstallTask {
  id: string
  resource: Resource
  destination: InstallDestination
  status: 'pending' | 'downloading' | 'installing' | 'completed' | 'failed' | 'cancelled'
  progress: number
  error?: string
  startTime?: Date
  endTime?: Date
}

const ResourceInstaller = () => {
  const { t } = useTranslation()
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [selectedDestination, setSelectedDestination] = useState<InstallDestination | null>(null)
  const [customUrl, setCustomUrl] = useState('')
  const [installTasks, setInstallTasks] = useState<InstallTask[]>([])

  // コンポーネントマウント時に既存のタスクを取得
  useEffect(() => {
    const fetchExistingTasks = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/installer/tasks')
        if (response.ok) {
          const tasks = await response.json()
          setInstallTasks(tasks.map((task: any) => ({
            ...task,
            startTime: new Date(task.startTime),
            endTime: task.endTime ? new Date(task.endTime) : undefined
          })))
        }
      } catch (error) {
        console.error('Failed to fetch existing tasks:', error)
      }
    }

    fetchExistingTasks()
  }, [])

  // Preset resources
  const presetResources: Resource[] = [
    {
      id: '1',
      name: t('resourceInstaller.resources.stableDiffusion.name'),
      type: 'model',
      size: '6.6 GB',
      description: t('resourceInstaller.resources.stableDiffusion.description')
    },
    {
      id: '2',
      name: t('resourceInstaller.resources.controlNet.name'),
      type: 'extension',
      size: '2.1 GB',
      description: t('resourceInstaller.resources.controlNet.description')
    },
    {
      id: '3',
      name: t('resourceInstaller.resources.faceRestore.name'),
      type: 'script',
      size: '150 MB',
      description: t('resourceInstaller.resources.faceRestore.description')
    },
    {
      id: '4',
      name: t('resourceInstaller.resources.animeModel.name'),
      type: 'model',
      size: '4.2 GB',
      description: t('resourceInstaller.resources.animeModel.description')
    }
  ]

  // Installation destinations
  const installDestinations: InstallDestination[] = [
    {
      id: '1',
      name: t('resourceInstaller.destinations.models'),
      path: '/models/stable-diffusion',
      type: 'models'
    },
    {
      id: '2',
      name: t('resourceInstaller.destinations.extensions'),
      path: '/extensions',
      type: 'extensions'
    },
    {
      id: '3',
      name: t('resourceInstaller.destinations.scripts'),
      path: '/scripts',
      type: 'scripts'
    },
    {
      id: '4',
      name: t('resourceInstaller.destinations.custom'),
      path: '/custom',
      type: 'custom'
    }
  ]

  const handleResourceSelect = (resource: Resource) => {
    setSelectedResource(resource)
    setCustomUrl('')
  }

  const handleCustomUrlChange = (url: string) => {
    setCustomUrl(url)
    if (url.trim()) {
      setSelectedResource({
        id: 'custom',
        name: 'Custom Resource',
        type: 'custom',
        url: url.trim()
      })
    } else {
      setSelectedResource(null)
    }
  }

  const handleDestinationSelect = (destination: InstallDestination) => {
    setSelectedDestination(destination)
  }

  const handleInstall = async () => {
    if (!selectedResource || !selectedDestination) return

    try {
      const response = await fetch('http://localhost:8080/api/installer/install', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resource: selectedResource,
          destination: selectedDestination
        })
      })

      if (!response.ok) {
        throw new Error('Failed to start installation')
      }

      const result = await response.json()
      
      // 新しいタスクを追加
      const newTask: InstallTask = {
        id: result.taskId,
        resource: selectedResource,
        destination: selectedDestination,
        status: 'pending',
        progress: 0,
        startTime: new Date()
      }

      setInstallTasks(prev => [...prev, newTask])
      
      // ポーリングを開始
      startPolling(result.taskId)
    } catch (error) {
      console.error('Installation failed:', error)
      alert(t('resourceInstaller.messages.installFailed'))
    }
  }

  const startPolling = (taskId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/installer/status?taskId=${taskId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch task status')
        }
        
        const taskData = await response.json()
        
        setInstallTasks(prev => prev.map(task => 
          task.id === taskId 
            ? {
                ...task,
                status: taskData.status,
                progress: taskData.progress,
                error: taskData.error,
                endTime: taskData.endTime ? new Date(taskData.endTime) : undefined
              }
            : task
        ))

        // 完了または失敗した場合はポーリングを停止
        if (taskData.status === 'completed' || taskData.status === 'failed' || taskData.status === 'cancelled') {
          clearInterval(interval)
        }
      } catch (error) {
        console.error('Failed to fetch task status:', error)
        clearInterval(interval)
      }
    }, 1000) // 1秒間隔でポーリング
  }

  const handleCancelTask = async (taskId: string) => {
    try {
      const response = await fetch('http://localhost:8080/api/installer/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskId })
      })

      if (!response.ok) {
        throw new Error('Failed to cancel task')
      }

      setInstallTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              status: 'cancelled' as const,
              endTime: new Date()
            }
          : task
      ))
    } catch (error) {
      console.error('Failed to cancel task:', error)
      alert(t('resourceInstaller.messages.cancelFailed'))
    }
  }

  const handleRemoveTask = (taskId: string) => {
    setInstallTasks(prev => prev.filter(task => task.id !== taskId))
  }

  const getStatusIcon = (status: InstallTask['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'downloading':
      case 'installing':
        return <Download className="h-4 w-4 text-blue-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'cancelled':
        return <X className="h-4 w-4 text-gray-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadgeVariant = (status: InstallTask['status']) => {
    switch (status) {
      case 'pending':
        return 'secondary' as const
      case 'downloading':
      case 'installing':
        return 'default' as const
      case 'completed':
        return 'default' as const
      case 'failed':
        return 'destructive' as const
      case 'cancelled':
        return 'outline' as const
      default:
        return 'outline' as const
    }
  }

  const formatDuration = (startTime: Date, endTime?: Date) => {
    const end = endTime || new Date()
    const diff = end.getTime() - startTime.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`
    }
    return `${remainingSeconds}s`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{t('resourceInstaller.title')}</h1>
            <p className="text-gray-600 mt-2">{t('resourceInstaller.description')}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resource Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {t('resourceInstaller.resourceSelection.title')}
                </CardTitle>
                <CardDescription>{t('resourceInstaller.resourceSelection.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Preset Resources */}
                <div>
                  <h3 className="text-sm font-medium mb-3">{t('resourceInstaller.resourceSelection.presetResources')}</h3>
                  <div className="space-y-2">
                    {presetResources.map((resource) => (
                      <div
                        key={resource.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedResource?.id === resource.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleResourceSelect(resource)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{resource.name}</h4>
                            <p className="text-sm text-gray-600">{resource.description}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline">{resource.size}</Badge>
                            <Badge variant="secondary" className="ml-1">
                              {resource.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Custom URL */}
                <div>
                  <h3 className="text-sm font-medium mb-3">{t('resourceInstaller.resourceSelection.customUrl')}</h3>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <input
                        type="url"
                        placeholder={t('resourceInstaller.resourceSelection.urlPlaceholder')}
                        value={customUrl}
                        onChange={(e) => handleCustomUrlChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <Link className="h-5 w-5 text-gray-400 mt-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Installation Destination Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  {t('resourceInstaller.installDestination.title')}
                </CardTitle>
                <CardDescription>{t('resourceInstaller.installDestination.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {installDestinations.map((destination) => (
                    <div
                      key={destination.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedDestination?.id === destination.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleDestinationSelect(destination)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{destination.name}</h4>
                          <p className="text-sm text-gray-600">{destination.path}</p>
                        </div>
                        <Badge variant="outline">{destination.type}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Install Button */}
          <div className="mt-6 flex justify-center">
            <Button
              onClick={handleInstall}
              disabled={!selectedResource || !selectedDestination}
              className="px-8 py-3"
            >
              <Play className="h-4 w-4 mr-2" />
              {t('resourceInstaller.installButton')}
            </Button>
          </div>

          {/* Installation Queue */}
          {installTasks.length > 0 && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>{t('resourceInstaller.installQueue.title')}</CardTitle>
                <CardDescription>{t('resourceInstaller.installQueue.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {installTasks.map((task) => (
                    <div key={task.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(task.status)}
                          <div>
                            <h4 className="font-medium">{task.resource.name}</h4>
                            <p className="text-sm text-gray-600">
                              {task.destination.name} • {task.resource.size}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusBadgeVariant(task.status)}>
                            {task.status}
                          </Badge>
                          {task.status === 'downloading' || task.status === 'installing' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelTask(task.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveTask(task.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {(task.status === 'downloading' || task.status === 'installing') && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{t('resourceInstaller.installQueue.progress')}</span>
                            <span>{Math.round(task.progress)}%</span>
                          </div>
                          <Progress value={task.progress} className="h-2" />
                        </div>
                      )}
                      
                      {task.startTime && (
                        <div className="text-xs text-gray-500 mt-2">
                          {t('resourceInstaller.installQueue.startTime')}: {task.startTime.toLocaleTimeString()}
                          {task.endTime && (
                            <span> • {t('resourceInstaller.installQueue.duration')}: {formatDuration(task.startTime, task.endTime)}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResourceInstaller
