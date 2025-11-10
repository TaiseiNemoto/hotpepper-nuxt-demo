/**
 * エラーレスポンスのフィクスチャ
 * テストで使用するエラーケースのモックデータを定義
 */
import type { ApiError } from '../../server/types/api'

export const mockApiError = {
  error: {
    code: 'API_ERROR',
    message: 'APIエラーが発生しました',
  } as const satisfies Omit<ApiError, 'statusCode'>,
}

export const mockValidationError = {
  error: {
    code: 'VALIDATION_ERROR',
    message: 'バリデーションエラーが発生しました',
  } as const satisfies Omit<ApiError, 'statusCode'>,
}

export const mockNotFoundError = {
  error: {
    code: 'NOT_FOUND',
    message: '指定されたリソースが見つかりませんでした',
  } as const satisfies Omit<ApiError, 'statusCode'>,
}

export const mockUpstreamError = {
  error: {
    code: 'UPSTREAM_ERROR',
    message: '上流のAPIでエラーが発生しました',
  } as const satisfies Omit<ApiError, 'statusCode'>,
}

export const mockTimeoutError = {
  error: {
    code: 'TIMEOUT',
    message: 'リクエストがタイムアウトしました',
  } as const satisfies Omit<ApiError, 'statusCode'>,
}

export const mockNetworkError = {
  error: {
    code: 'NETWORK_ERROR',
    message: 'ネットワークエラーが発生しました',
  } as const satisfies Omit<ApiError, 'statusCode'>,
}
