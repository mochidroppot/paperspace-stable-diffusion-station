/**
 * API設定とユーティリティ関数
 */

// APIベースURLの設定
// 同一オリジンでAPIが/apiパス配下に配置されているため、相対パスを使用
export const API_BASE_URL = '/api'

/**
 * APIエンドポイントの完全なURLを生成する
 * @param endpoint - APIエンドポイント（例: '/installer/tasks'）
 * @returns 完全なAPI URL
 */
export const getApiUrl = (endpoint: string): string => {
    // エンドポイントが既に/apiで始まっている場合はそのまま返す
    if (endpoint.startsWith('/api')) {
        return endpoint
    }

    // エンドポイントが/で始まっていない場合は/を追加
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`

    return `${API_BASE_URL}${normalizedEndpoint}`
}

/**
 * 共通のfetch設定
 */
export const defaultFetchOptions: RequestInit = {
    headers: {
        'Content-Type': 'application/json',
    },
}

/**
 * APIリクエスト用のfetchラッパー
 * @param endpoint - APIエンドポイント
 * @param options - fetchオプション
 * @returns Promise<Response>
 */
export const apiFetch = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
    const url = getApiUrl(endpoint)
    const mergedOptions: RequestInit = {
        ...defaultFetchOptions,
        ...options,
        headers: {
            ...defaultFetchOptions.headers,
            ...options.headers,
        },
    }

    return fetch(url, mergedOptions)
}

/**
 * 推奨リソース関連のAPI型定義
 */
export interface SizeInfo {
    value: number
    unit: string
}

export interface PresetResource {
    id: string
    name: string
    type: "checkpoint" | "extension" | "script"
    size: SizeInfo
    description: string
    tags?: string[]
    version?: string
    author?: string
    license?: string
    requirements?: string[]
    destination_path?: string
    url?: string
}

export interface PresetResourcesResponse {
    resources: PresetResource[]
}

/**
 * Installation destination data structure
 */
export interface InstallationDestination {
    type: string
    path: string
}

export interface InstallationDestinationsResponse {
    destinations: InstallationDestination[]
}

/**
 * 推奨リソース一覧を取得する
 * @returns Promise<PresetResource[]>
 */
export const fetchPresetResources = async (): Promise<PresetResource[]> => {
    try {
        const response = await apiFetch('/preset-resources')

        if (!response.ok) {
            throw new Error(`Failed to fetch preset resources: ${response.status} ${response.statusText}`)
        }

        const data: PresetResourcesResponse = await response.json()
        return data.resources
    } catch (error) {
        console.error('Error fetching preset resources:', error)
        throw error
    }
}

/**
 * インストール先一覧を取得する
 * @returns Promise<InstallationDestination[]>
 */
export const fetchInstallationDestinations = async (): Promise<InstallationDestination[]> => {
    try {
        const response = await apiFetch('/installation-destinations')

        if (!response.ok) {
            throw new Error(`Failed to fetch installation destinations: ${response.status} ${response.statusText}`)
        }

        const data: InstallationDestinationsResponse = await response.json()
        return data.destinations
    } catch (error) {
        console.error('Error fetching installation destinations:', error)
        throw error
    }
}
