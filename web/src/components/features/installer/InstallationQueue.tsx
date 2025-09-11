import {
    Activity,
    AlertTriangle,
    Download,
    Package,
    X,
    XCircle
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { Progress } from '../../ui/progress'
import { type InstallTask } from './types'

interface InstallationQueueProps {
    installTasks: InstallTask[]
    onCancelTask: (taskId: string) => void
}

const InstallationQueue = ({ installTasks, onCancelTask }: InstallationQueueProps) => {
    const { t } = useTranslation()

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

    const handleCancelTask = async (taskId: string) => {
        try {
            await onCancelTask(taskId)
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

    return (
        <Card className="card no-hover flex flex-col" style={{ height: '100%', maxHeight: '100%' }}>
            <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center">
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
            <CardContent className="p-2 flex-1 overflow-y-auto" style={{ minHeight: 0, maxHeight: 'calc(100vh - 15rem)' }}>
                {installTasks.length > 0 ? (
                    <div className="space-y-4 p-1">
                        {installTasks.map((task) => (
                            <div
                                key={task.id}
                                className="card p-4 border-border hover:border-primary/50 transition-all duration-200 m-1"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center">
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
                                    <div className="space-y-3">
                                        {/* Progress Bar */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm text-muted-foreground">
                                                <span className="font-medium">
                                                    {task.status === 'downloading' ? 'ダウンロード中' : 'インストール中'}
                                                </span>
                                                <span className="font-mono">
                                                    {Math.round(task.progress)}%
                                                </span>
                                            </div>
                                            <Progress value={task.progress} className="h-2" />
                                        </div>

                                        {/* Additional Info */}
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>
                                                {task.status === 'downloading' ? 'ファイルをダウンロード中...' : 'ファイルを配置中...'}
                                            </span>
                                            <span>
                                                経過時間: {task.startTime && formatDuration(task.startTime)}
                                            </span>
                                        </div>

                                        {/* File Info */}
                                        <div className="text-xs text-muted-foreground bg-muted/30 rounded p-2">
                                            <div className="flex justify-between">
                                                <span>ファイル名:</span>
                                                <span className="font-mono truncate max-w-48">
                                                    {task.resource.name}
                                                </span>
                                            </div>
                                            <div className="flex justify-between mt-1">
                                                <span>保存先:</span>
                                                <span className="font-mono truncate max-w-48">
                                                    {task.destination.path}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ) : task.status === 'completed' ? (
                                    <div className="mt-2 p-2 bg-green-500/10 border border-green-500/20 rounded text-sm text-green-400">
                                        ✓ ダウンロードが正常に完了しました
                                    </div>
                                ) : task.status === 'failed' ? (
                                    <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-400">
                                        ✗ ダウンロードに失敗しました
                                        {task.error && (
                                            <div className="mt-1 text-xs opacity-75">
                                                {task.error}
                                            </div>
                                        )}
                                    </div>
                                ) : null}

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
    )
}

export default InstallationQueue
