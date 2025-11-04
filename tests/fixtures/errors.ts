/**
 * エラーレスポンスのフィクスチャ
 * テストで使用するエラーケースのモックデータを定義
 */

export const mockApiError = {
  error: {
    code: 'API_ERROR',
    message: 'APIエラーが発生しました',
  },
}

export const mockValidationError = {
  error: {
    code: 'VALIDATION_ERROR',
    message: 'バリデーションエラーが発生しました',
  },
}

export const mockNotFoundError = {
  error: {
    code: 'NOT_FOUND',
    message: '指定されたリソースが見つかりませんでした',
  },
}

export const mockUpstreamError = {
  error: {
    code: 'UPSTREAM_ERROR',
    message: '上流のAPIでエラーが発生しました',
  },
}

export const mockTimeoutError = {
  error: {
    code: 'TIMEOUT',
    message: 'リクエストがタイムアウトしました',
  },
}

export const mockNetworkError = {
  error: {
    code: 'NETWORK_ERROR',
    message: 'ネットワークエラーが発生しました',
  },
}
