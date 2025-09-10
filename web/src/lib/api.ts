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
export interface PresetResource {
    id: string
    name: string
    type: "model" | "extension" | "script"
    size: string
    description: string
    category?: string
    tags?: string[]
    version?: string
    author?: string
    license?: string
    requirements?: string[]
    compatibility?: string[]
    url?: string
}

export interface PresetResourcesResponse {
    resources: PresetResource[]
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
