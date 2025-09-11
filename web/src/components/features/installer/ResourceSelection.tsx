import {
    AlertTriangle,
    HardDrive,
    Package,
    Play,
    Plus,
    XCircle,
    Zap
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { type PresetResource } from '../../../lib/api'
import { Alert, AlertDescription, AlertTitle } from '../../ui/alert'
import { Badge } from '../../ui/badge'
import { Button } from '../../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select'
import { type InstallDestination, type Resource } from './types'

interface ResourceSelectionProps {
    presetResources: PresetResource[]
    isLoadingResources: boolean
    resourcesError: string | null
    installDestinations: InstallDestination[]
    destinationsError: string | null
    onInstall: (resource: Resource, destination: InstallDestination) => void
}

const ResourceSelection = ({
    presetResources,
    isLoadingResources,
    resourcesError,
    installDestinations,
    destinationsError,
    onInstall
}: ResourceSelectionProps) => {
    const { t } = useTranslation()
    const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
    const [selectedDestination, setSelectedDestination] = useState<InstallDestination | null>(null)
    const [resourceUrl, setResourceUrl] = useState('')
    const [resourceName, setResourceName] = useState('')
    const [isCustomMode, setIsCustomMode] = useState(false)
    const [showResourceForm, setShowResourceForm] = useState(false)

    // Convert PresetResource to Resource for compatibility
    const convertPresetToResource = (preset: PresetResource): Resource => ({
        id: preset.id,
        name: preset.filename || preset.name, // Use filename if available, fallback to name
        type: preset.type as 'model' | 'extension' | 'script' | 'custom',
        size: preset.size,
        description: preset.description,
        url: preset.url,
        tags: preset.tags
    })

    // Utility function to truncate long paths
    const truncatePath = (path: string, maxLength: number = 50) => {
        if (path.length <= maxLength) return path
        const start = path.substring(0, 20)
        const end = path.substring(path.length - 20)
        return `${start}...${end}`
    }

    const handleResourceSelect = (preset: PresetResource) => {
        const resource = convertPresetToResource(preset)
        setSelectedResource(resource)
        setIsCustomMode(false)

        // Auto-fill resource details from preset
        setResourceUrl(resource.url || '')
        setResourceName(preset.filename || preset.name) // Use filename if available, fallback to name

        // Auto-select destination based on preset
        const matchingDestination = installDestinations.find(dest =>
            dest.path === preset.destination_path
        )
        if (matchingDestination) {
            setSelectedDestination(matchingDestination)
        }

        // Show resource form
        setShowResourceForm(true)
    }

    const handleCustomModeToggle = () => {
        setIsCustomMode(true)
        setSelectedResource(null)
        setResourceUrl('')
        setResourceName('')
        setSelectedDestination(null)
        setShowResourceForm(true)
    }

    const handleResourceUrlChange = (url: string) => {
        setResourceUrl(url)
        updateCustomResource()
    }

    const handleResourceNameChange = (name: string) => {
        setResourceName(name)
        // Don't call updateCustomResource immediately to avoid trimming during typing
    }

    const updateCustomResource = () => {
        if (isCustomMode && resourceUrl.trim() && resourceName.trim()) {
            setSelectedResource({
                id: 'custom',
                name: resourceName.trim(),
                type: 'custom',
                url: resourceUrl.trim()
            })
        } else if (isCustomMode) {
            setSelectedResource(null)
        }
    }

    const handleDestinationSelect = (destination: InstallDestination) => {
        setSelectedDestination(destination)
        // Update custom resource when destination is selected
        if (isCustomMode) {
            updateCustomResource()
        }
    }

    const handleBackToResource = () => {
        setShowResourceForm(false)
        setSelectedResource(null)
        setSelectedDestination(null)
        setIsCustomMode(false)
        setResourceUrl('')
        setResourceName('')
    }

    const handleInstall = () => {
        // Update custom resource before installation to ensure latest values
        if (isCustomMode) {
            updateCustomResource()
        }

        if (!selectedResource || !selectedDestination) {
            toast.error(t('resourceInstaller.messages.noDestinationSelected'), {
                icon: <XCircle className="h-4 w-4" />,
            })
            return
        }

        onInstall(selectedResource, selectedDestination)
    }

    return (
        <Card className="card no-hover flex flex-col" style={{ height: '100%', maxHeight: '100%' }}>
            <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
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
            <CardContent className="p-2 flex-1 overflow-y-auto" style={{ minHeight: 0, maxHeight: 'calc(100vh - 15rem)' }}>
                {/* Content */}
                <div className="space-y-4">
                    {/* Resource Selection */}
                    {!showResourceForm && (
                        <div className="animate-in slide-in-from-right-4 duration-500">
                            {/* Preset Resources */}
                            <div>
                                <h3 className="text-sm font-medium mb-3 text-muted-foreground">{t('resourceInstaller.resourceSelection.presetResources')}</h3>
                                {isLoadingResources ? (
                                    <div className="space-y-3 p-1">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className="card p-4 border-border m-1 animate-pulse">
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
                                                className="card p-4 cursor-pointer transition-all duration-200 hover:scale-102 border-border hover:border-primary/50 m-1"
                                                onClick={() => handleResourceSelect(resource)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-white mb-2">{resource.name}</h4>
                                                        {resource.tags && resource.tags.length > 0 && (
                                                            <div className="flex flex-wrap gap-1">
                                                                {resource.tags.map((tag, index) => (
                                                                    <Badge
                                                                        key={index}
                                                                        variant="outline"
                                                                        className="text-xs bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 font-medium"
                                                                    >
                                                                        {tag}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-right space-y-1">
                                                        <div className="px-2 py-1 bg-primary/20 text-primary rounded text-xs flex items-center gap-1">
                                                            <HardDrive className="h-3 w-3" />
                                                            {typeof resource.size === 'string' ? resource.size : `${resource.size.value} ${resource.size.unit}`}
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
                                        className="button w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 bg-muted hover:bg-primary m-1"
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
                                    <Button
                                        onClick={handleBackToResource}
                                        variant="outline"
                                        size="sm"
                                        className="gap-2"
                                    >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                        リソース選択に戻る
                                    </Button>
                                </div>

                                {/* Selected Resource Info */}
                                {selectedResource && selectedDestination && (
                                    <div className="bg-muted/50 border border-border rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center flex-shrink-0">
                                                <Package className="h-5 w-5 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-white mb-2">{selectedResource.name}</h3>
                                                {selectedResource.description && (
                                                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                                                        {selectedResource.description}
                                                    </p>
                                                )}

                                                {/* Tags, Type and Size */}
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {/* Tags */}
                                                    {selectedResource.tags && selectedResource.tags.length > 0 && (
                                                        <>
                                                            {selectedResource.tags.map((tag, index) => (
                                                                <Badge
                                                                    key={index}
                                                                    variant="outline"
                                                                    className="text-xs bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 font-medium"
                                                                >
                                                                    {tag}
                                                                </Badge>
                                                            ))}
                                                        </>
                                                    )}

                                                    {/* Type */}
                                                    <div className="px-2 py-1 bg-accent/20 text-accent rounded text-xs">
                                                        {selectedResource.type}
                                                    </div>

                                                    {/* Size */}
                                                    {selectedResource.size && (
                                                        <div className="px-2 py-1 bg-primary/20 text-primary rounded text-xs flex items-center gap-1">
                                                            <HardDrive className="h-3 w-3" />
                                                            {typeof selectedResource.size === 'string'
                                                                ? selectedResource.size
                                                                : `${selectedResource.size.value} ${selectedResource.size.unit}`
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

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
                                            disabled={!isCustomMode}
                                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card bg-muted text-foreground placeholder-muted-foreground border-border hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                            onBlur={() => {
                                                if (isCustomMode) {
                                                    updateCustomResource()
                                                }
                                            }}
                                            disabled={!isCustomMode}
                                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card bg-muted text-foreground placeholder-muted-foreground border-border hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                {/* Destination Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                                        {t('resourceInstaller.installDestination.title')}
                                    </label>
                                    {destinationsError ? (
                                        <div className="p-3">
                                            <Alert variant="destructive" className="border-red-500/20 bg-red-500/10">
                                                <AlertTriangle className="h-4 w-4" />
                                                <AlertTitle className="text-red-400">{t('resourceInstaller.messages.errorOccurred')}</AlertTitle>
                                                <AlertDescription className="text-red-300">
                                                    {destinationsError}
                                                </AlertDescription>
                                            </Alert>
                                        </div>
                                    ) : (
                                        <Select
                                            value={selectedDestination?.id || ''}
                                            onValueChange={(value) => {
                                                const destination = installDestinations.find(dest => dest.id === value)
                                                if (destination) {
                                                    handleDestinationSelect(destination)
                                                }
                                            }}
                                            disabled={!isCustomMode}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('resourceInstaller.installDestination.description')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {installDestinations.map((dest) => (
                                                    <SelectItem key={dest.id} value={dest.id}>
                                                        {`${dest.name}: ${truncatePath(dest.path)}`}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>

                                {/* Install Button */}
                                {selectedResource && selectedDestination && (
                                    <div className="flex justify-center pt-4">
                                        <Button
                                            onClick={handleInstall}
                                            variant="default"
                                            size="lg"
                                            className="px-12 py-4 text-lg font-bold gap-3"
                                        >
                                            <Play className="h-5 w-5" />
                                            {t('resourceInstaller.installButton')}
                                            <Zap className="h-5 w-5" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </CardContent>
        </Card>
    )
}

export default ResourceSelection
