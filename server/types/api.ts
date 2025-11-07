// API共通レスポンス/エラー型定義
export const ERROR_CODES = [
  'VALIDATION_ERROR',
  'NOT_FOUND',
  'UPSTREAM_ERROR',
  'NETWORK_ERROR',
  'TIMEOUT',
  'API_ERROR',
  'CONFIG_ERROR',
  'UNKNOWN_ERROR',
] as const

export type ErrorCode = (typeof ERROR_CODES)[number]

export interface ApiError {
  code: ErrorCode
  message: string
  statusCode?: number
  details?: Record<string, unknown>
  cause?: unknown
}

export type ApiResult<T> = ApiSuccess<T> | ApiFailure

export interface ApiSuccess<T> {
  success: true
  data: T
}

export interface ApiFailure {
  success: false
  error: ApiError
}

export function createSuccessResult<T>(data: T): ApiSuccess<T> {
  return {
    success: true,
    data,
  }
}

export function createFailureResult(error: ApiError): ApiFailure {
  return {
    success: false,
    error,
  }
}

export function isSuccessResult<T>(result: ApiResult<T>): result is ApiSuccess<T> {
  return result.success
}

export function isFailureResult<T>(result: ApiResult<T>): result is ApiFailure {
  return !result.success
}

export function isApiErrorPayload(value: unknown): value is ApiError {
  if (!value || typeof value !== 'object') {
    return false
  }
  const payload = value as Partial<ApiError>
  return typeof payload.code === 'string' && typeof payload.message === 'string'
}
