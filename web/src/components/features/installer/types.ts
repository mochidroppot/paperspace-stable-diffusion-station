export interface Resource {
    id: string
    name: string
    type: 'model' | 'extension' | 'script' | 'custom'
    url?: string
    size?: string | { value: number; unit: string }
    description?: string
    tags?: string[]
}

export interface InstallDestination {
    id: string
    name: string
    path: string
    type: string
}

export interface InstallTask {
    id: string
    url: string
    name: string
    path: string
    type?: string
    status: 'pending' | 'downloading' | 'installing' | 'completed' | 'failed' | 'cancelled'
    progress: number
    error?: string
    startTime?: Date
    endTime?: Date
}
