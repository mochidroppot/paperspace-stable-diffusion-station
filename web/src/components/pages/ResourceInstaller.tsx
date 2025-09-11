import { CheckCircle, Package, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { apiFetch, fetchInstallationDestinations, fetchPresetResources, type PresetResource } from '../../lib/api'
import InstallationQueue from '../features/installer/InstallationQueue'
import ResourceSelection from '../features/installer/ResourceSelection'
import { type InstallDestination, type InstallTask, type Resource } from '../features/installer/types'
import Navigation from './Navigation'

const ResourceInstaller = () => {
  const { t } = useTranslation()
  const [installTasks, setInstallTasks] = useState<InstallTask[]>([])
  const [presetResources, setPresetResources] = useState<PresetResource[]>([])
  const [isLoadingResources, setIsLoadingResources] = useState(true)
  const [resourcesError, setResourcesError] = useState<string | null>(null)
  const [installDestinations, setInstallDestinations] = useState<InstallDestination[]>([])
  const [destinationsError, setDestinationsError] = useState<string | null>(null)

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

        // Fetch installation destinations
        const destinations = await fetchInstallationDestinations()
        // Convert API format to component format
        const convertedDestinations: InstallDestination[] = destinations.map((dest) => ({
          id: dest.path, // Use path as ID for easier matching
          name: dest.type.charAt(0).toUpperCase() + dest.type.slice(1),
          path: dest.path,
          type: dest.type
        }))
        setInstallDestinations(convertedDestinations)
        setDestinationsError(null) // Clear any previous errors
      } catch (error) {
        console.error('Failed to fetch data:', error)
        setResourcesError(t('resourceInstaller.messages.fetchResourcesFailed'))
        setDestinationsError(t('resourceInstaller.messages.fetchDestinationsFailed'))
      } finally {
        setIsLoadingResources(false)
      }
    }

    fetchData()
  }, [])


  const handleInstall = async (resource: Resource, destination: InstallDestination) => {
    // まずキューにタスクを追加（即座に）
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newTask: InstallTask = {
      id: taskId,
      resource: resource,
      destination: destination,
      status: 'pending',
      progress: 0,
      startTime: new Date()
    }

    setInstallTasks(prev => [...prev, newTask])

    // 非同期でインストールを開始
    try {
      const response = await apiFetch('/installer/install', {
        method: 'POST',
        body: JSON.stringify({
          resource: resource,
          destination: destination
        })
      })

      if (!response.ok) {
        throw new Error('Failed to start installation')
      }

      const result = await response.json()

      // サーバーから返されたtaskIdで更新
      setInstallTasks(prev => prev.map(task =>
        task.id === taskId
          ? { ...task, id: result.taskId }
          : task
      ))

      // ポーリングを開始
      startPolling(result.taskId)
    } catch (error) {
      console.error('Installation failed:', error)

      // エラーが発生した場合はキューアイテムを失敗扱いにする
      setInstallTasks(prev => prev.map(task =>
        task.id === taskId
          ? {
            ...task,
            status: 'failed' as const,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            endTime: new Date()
          }
          : task
      ))
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
    } catch (error) {
      console.error('Failed to cancel task:', error)
      throw error
    }
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ height: 'calc(100vh - 8rem)', maxHeight: 'calc(100vh - 8rem)' }}>
            {/* Left Panel - Resource Selection */}
            <ResourceSelection
              presetResources={presetResources}
              isLoadingResources={isLoadingResources}
              resourcesError={resourcesError}
              installDestinations={installDestinations}
              destinationsError={destinationsError}
              onInstall={handleInstall}
            />

            {/* Right Panel - Installation Queue */}
            <InstallationQueue
              installTasks={installTasks}
              onCancelTask={handleCancelTask}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResourceInstaller
