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
