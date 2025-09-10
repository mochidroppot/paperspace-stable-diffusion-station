import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Download,
  Package,
  Play,
  Plus,
  X,
  XCircle,
  Zap
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { apiFetch, fetchPresetResources, type PresetResource } from '../lib/api'
import Navigation from './Navigation'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Badge } from './ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Combobox } from './ui/combobox'
import { Progress } from './ui/progress'

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
  const [resourceUrl, setResourceUrl] = useState('')
  const [resourceName, setResourceName] = useState('')
  const [resourceDescription, setResourceDescription] = useState('')
  const [isCustomMode, setIsCustomMode] = useState(false)
  const [installTasks, setInstallTasks] = useState<InstallTask[]>([])
  const [showResourceForm, setShowResourceForm] = useState(false)
  const [presetResources, setPresetResources] = useState<PresetResource[]>([])
  const [isLoadingResources, setIsLoadingResources] = useState(true)
  const [resourcesError, setResourcesError] = useState<string | null>(null)
  // const customUrl = resourceUrl // Used in JSX conditionally

  // Component mount: fetch existing tasks and preset resources
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch existing tasks
        const tasksResponse = await apiFetch('/installer/tasks')
        if (tasksResponse.ok) {
          const tasks = await tasksResponse.json()
          setInstallTasks(tasks.map((task: any) => ({
            ...task,
            startTime: new Date(task.startTime),
            endTime: task.endTime ? new Date(task.endTime) : undefined
          })))
        }

        // Fetch preset resources
        const resources = await fetchPresetResources()
        setPresetResources(resources)
        setResourcesError(null) // Clear any previous errors
      } catch (error) {
        console.error('Failed to fetch data:', error)
        setResourcesError(t('resourceInstaller.messages.fetchResourcesFailed'))
      } finally {
        setIsLoadingResources(false)
      }
    }

    fetchData()
  }, [])

  // Convert PresetResource to Resource for compatibility
  const convertPresetToResource = (preset: PresetResource): Resource => ({
    id: preset.id,
    name: preset.name,
    type: preset.type as 'model' | 'extension' | 'script' | 'custom',
    size: preset.size,
    description: preset.description,
    url: preset.url
  })

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

  const handleResourceSelect = (preset: PresetResource) => {
    const resource = convertPresetToResource(preset)
    setSelectedResource(resource)
    setIsCustomMode(false)

    // Auto-fill resource details from preset
    setResourceUrl(resource.url || '')
    setResourceName(resource.name)
    setResourceDescription(resource.description || '')

    // Show resource form
    setShowResourceForm(true)
  }

  const handleCustomModeToggle = () => {
    setIsCustomMode(true)
    setSelectedResource(null)
    setResourceUrl('')
    setResourceName('')
    setResourceDescription('')
    setSelectedDestination(null)
    setShowResourceForm(true)
  }

  const handleResourceUrlChange = (url: string) => {
    setResourceUrl(url)
    updateCustomResource()
  }

  const handleResourceNameChange = (name: string) => {
    setResourceName(name)
    updateCustomResource()
  }

  const handleResourceDescriptionChange = (description: string) => {
    setResourceDescription(description)
    updateCustomResource()
  }

  const updateCustomResource = () => {
    if (isCustomMode && resourceUrl.trim() && resourceName.trim()) {
      setSelectedResource({
        id: 'custom',
        name: resourceName.trim(),
        type: 'custom',
        url: resourceUrl.trim(),
        description: resourceDescription.trim()
      })
    } else if (isCustomMode) {
      setSelectedResource(null)
    }
  }

  const handleDestinationSelect = (destination: InstallDestination) => {
    setSelectedDestination(destination)
  }

  const handleBackToResource = () => {
    setShowResourceForm(false)
    setSelectedResource(null)
    setSelectedDestination(null)
    setIsCustomMode(false)
    setResourceUrl('')
    setResourceName('')
    setResourceDescription('')
  }

  const handleInstall = async () => {
    if (!selectedResource) return

    // For preset resources, auto-determine destination
    let destination = selectedDestination
    if (!isCustomMode && !destination) {
      destination = installDestinations.find(dest => dest.type === selectedResource.type + 's') || null
    }

    if (!destination) {
      toast.error(t('resourceInstaller.messages.noDestinationSelected'), {
        icon: <XCircle className="h-4 w-4" />,
      })
      return
    }

    try {
      const response = await apiFetch('/installer/install', {
        method: 'POST',
        body: JSON.stringify({
          resource: selectedResource,
          destination: destination
        })
      })

      if (!response.ok) {
        throw new Error('Failed to start installation')
      }

      const result = await response.json()

      // Add new task
      const newTask: InstallTask = {
        id: result.taskId,
        resource: selectedResource,
        destination: destination,
        status: 'pending',
        progress: 0,
        startTime: new Date()
      }

      setInstallTasks(prev => [...prev, newTask])

      // Show success toast
      toast.success(t('resourceInstaller.messages.installStarted', { resourceName: selectedResource.name }), {
        icon: <CheckCircle className="h-4 w-4" />,
      })

      // Start polling
      startPolling(result.taskId)
    } catch (error) {
      console.error('Installation failed:', error)
      toast.error(t('resourceInstaller.messages.installFailed'), {
        icon: <XCircle className="h-4 w-4" />,
      })
    }
  }

  const startPolling = (taskId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await apiFetch(`/installer/status?taskId=${taskId}`)
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

          // Show completion toast
          if (taskData.status === 'completed') {
            toast.success(t('resourceInstaller.messages.installCompleted', { resourceName: taskData.resource?.name || 'Resource' }), {
              icon: <CheckCircle className="h-4 w-4" />,
            })
          } else if (taskData.status === 'failed') {
            toast.error(t('resourceInstaller.messages.installFailed', { resourceName: taskData.resource?.name || 'Resource' }), {
              icon: <XCircle className="h-4 w-4" />,
            })
          }
        }
      } catch (error) {
        console.error('Failed to fetch task status:', error)
        clearInterval(interval)
      }
    }, 1000) // 1秒間隔でポーリング
  }

  const handleCancelTask = async (taskId: string) => {
    try {
      const response = await apiFetch('/installer/cancel', {
        method: 'POST',
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

      // Show cancellation toast
      toast.warning(t('resourceInstaller.messages.installCancelled'), {
        icon: <AlertTriangle className="h-4 w-4" />,
      })
    } catch (error) {
      console.error('Failed to cancel task:', error)
      toast.error(t('resourceInstaller.messages.cancelFailed'), {
        icon: <XCircle className="h-4 w-4" />,
      })
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <Navigation />
      <div className="lg:ml-64 p-6 pt-12 lg:pt-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <Package className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-2xl font-normal text-white tracking-wide">
                {t('resourceInstaller.title')}
              </h1>
            </div>
            <p className="text-muted-foreground text-xs ml-8 leading-relaxed">{t('resourceInstaller.description')}</p>
          </div>


          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel - Resource Selection and Installation */}
            <Card className="gaming-card no-hover min-h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-normal text-white tracking-wide">
                      {t('resourceInstaller.resourceSelection.title')}
                    </h2>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {t('resourceInstaller.resourceSelection.description')}
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-2">
                {/* Content */}
                <div className="relative overflow-visible">
                  {/* Resource Selection */}
                  {!showResourceForm && (
                    <div className="animate-in slide-in-from-right-4 duration-500">
                      {/* Preset Resources */}
                      <div>
                        <h3 className="text-sm font-medium mb-3 text-muted-foreground">{t('resourceInstaller.resourceSelection.presetResources')}</h3>
                        {isLoadingResources ? (
                          <div className="space-y-3 p-1">
                            {[1, 2, 3, 4].map((i) => (
                              <div key={i} className="gaming-card p-4 border-border m-1 animate-pulse">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-muted rounded w-full"></div>
                                  </div>
                                  <div className="text-right space-y-1">
                                    <div className="h-6 bg-muted rounded w-16"></div>
                                    <div className="h-6 bg-muted rounded w-12"></div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : resourcesError ? (
                          <div className="p-1">
                            <Alert variant="destructive" className="border-red-500/20 bg-red-500/10">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertTitle className="text-red-400">{t('resourceInstaller.messages.errorOccurred')}</AlertTitle>
                              <AlertDescription className="text-red-300">
                                {resourcesError}
                              </AlertDescription>
                            </Alert>
                          </div>
                        ) : (
                          <div className="space-y-3 p-1">
                            {presetResources.map((resource) => (
                              <div
                                key={resource.id}
                                className="gaming-card p-4 cursor-pointer transition-all duration-200 hover:scale-102 border-border hover:border-primary/50 m-1"
                                onClick={() => handleResourceSelect(resource)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-white">{resource.name}</h4>
                                    <p className="text-sm text-muted-foreground">{resource.description}</p>
                                  </div>
                                  <div className="text-right space-y-1">
                                    <div className="px-2 py-1 bg-primary/20 text-primary rounded text-xs">
                                      {resource.size}
                                    </div>
                                    <div className="px-2 py-1 bg-accent/20 text-accent rounded text-xs">
                                      {resource.type}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Custom Mode Toggle */}
                      <div className="pt-4 border-t border-border p-1">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-3">
                            {t('resourceInstaller.resourceSelection.orUseCustom')}
                          </p>
                          <button
                            onClick={handleCustomModeToggle}
                            className="gaming-button w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 bg-muted hover:bg-primary m-1"
                          >
                            <Plus className="h-4 w-4 mr-2 inline" />
                            {t('resourceInstaller.resourceSelection.useCustomUrl')}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Resource Form */}
                  {showResourceForm && (
                    <div className="animate-in slide-in-from-left-4 duration-500">
                      <div className="space-y-4">
                        {/* Back Button */}
                        <div className="flex justify-start">
                          <button
                            onClick={handleBackToResource}
                            className="gaming-button px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 bg-muted hover:bg-muted/80"
                          >
                            <svg className="h-4 w-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            リソース選択に戻る
                          </button>
                        </div>

                        {/* Resource Form */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">
                              {t('resourceInstaller.resourceSelection.urlPlaceholder')}
                            </label>
                            <input
                              type="url"
                              placeholder="https://example.com/resource.zip"
                              value={resourceUrl}
                              onChange={(e) => handleResourceUrlChange(e.target.value)}
                              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card bg-muted text-foreground placeholder-muted-foreground border-border hover:border-primary/50"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">
                              {t('resourceInstaller.resourceSelection.namePlaceholder')}
                            </label>
                            <input
                              type="text"
                              placeholder="Resource Name"
                              value={resourceName}
                              onChange={(e) => handleResourceNameChange(e.target.value)}
                              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card bg-muted text-foreground placeholder-muted-foreground border-border hover:border-primary/50"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">
                              {t('resourceInstaller.resourceSelection.descriptionPlaceholder')}
                            </label>
                            <input
                              type="text"
                              placeholder="Optional description"
                              value={resourceDescription}
                              onChange={(e) => handleResourceDescriptionChange(e.target.value)}
                              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card bg-muted text-foreground placeholder-muted-foreground border-border hover:border-primary/50"
                            />
                          </div>
                        </div>

                        {/* Destination Selection */}
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-2">
                            {t('resourceInstaller.installDestination.title')}
                          </label>
                          <Combobox
                            options={installDestinations.map(dest => ({
                              value: dest.id,
                              label: dest.name,
                              disabled: false
                            }))}
                            value={selectedDestination?.id || ''}
                            onValueChange={(value) => {
                              const destination = installDestinations.find(dest => dest.id === value)
                              if (destination) {
                                handleDestinationSelect(destination)
                              }
                            }}
                            placeholder={t('resourceInstaller.installDestination.description')}
                            searchPlaceholder="Search destinations..."
                            emptyText="No destinations found."
                            width="w-full"
                          />
                          {selectedDestination && (
                            <div className="mt-3 p-3 bg-muted rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium text-foreground">{selectedDestination.name}</h4>
                                  <p className="text-sm text-muted-foreground">{selectedDestination.path}</p>
                                </div>
                                <Badge variant="outline">{selectedDestination.type}</Badge>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Install Button */}
                        {selectedResource && selectedDestination && (
                          <div className="flex justify-center pt-4">
                            <button
                              onClick={handleInstall}
                              className="gaming-button px-12 py-4 text-lg font-bold rounded-lg transition-all duration-200"
                            >
                              <Play className="h-5 w-5 mr-3 inline" />
                              {t('resourceInstaller.installButton')}
                              <Zap className="h-5 w-5 ml-2 inline" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </CardContent>
            </Card>

            {/* Right Panel - Download Queue */}
            <Card className="gaming-card no-hover min-h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-normal text-white tracking-wide">
                      {t('resourceInstaller.installQueue.title')}
                    </h2>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {t('resourceInstaller.installQueue.description')}
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                {installTasks.length > 0 ? (
                  <div className="space-y-4 p-1">
                    {installTasks.map((task) => (
                      <div
                        key={task.id}
                        className="gaming-card p-4 border-border hover:border-primary/50 transition-all duration-200 m-1"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                              <Package className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <h4 className="font-medium text-white">{task.resource.name}</h4>
                              <p className="text-sm text-muted-foreground">{task.destination.name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`px-2 py-1 rounded text-xs font-medium ${task.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                              task.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                                task.status === 'cancelled' ? 'bg-gray-500/20 text-gray-400' :
                                  'bg-blue-500/20 text-blue-400'
                              }`}>
                              {task.status === 'pending' && '待機中'}
                              {task.status === 'downloading' && 'ダウンロード中'}
                              {task.status === 'installing' && 'インストール中'}
                              {task.status === 'completed' && '完了'}
                              {task.status === 'failed' && '失敗'}
                              {task.status === 'cancelled' && 'キャンセル'}
                            </div>
                            {task.status === 'downloading' || task.status === 'installing' ? (
                              <button
                                onClick={() => handleCancelTask(task.id)}
                                className="p-1 hover:bg-red-500/20 rounded transition-colors"
                              >
                                <X className="h-4 w-4 text-red-400" />
                              </button>
                            ) : null}
                          </div>
                        </div>

                        {task.status === 'downloading' || task.status === 'installing' ? (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>{Math.round(task.progress)}%</span>
                              <span>
                                {task.startTime && formatDuration(task.startTime)}
                              </span>
                            </div>
                            <Progress value={task.progress} className="h-2" />
                          </div>
                        ) : null}

                        {task.error && (
                          <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-400">
                            {task.error}
                          </div>
                        )}

                        {task.status === 'completed' && task.endTime && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            完了: {task.endTime.toLocaleString()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                      <Download className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">ダウンロードキューは空です</h3>
                    <p className="text-muted-foreground">リソースを選択してインストールを開始してください</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  )
}

export default ResourceInstaller
