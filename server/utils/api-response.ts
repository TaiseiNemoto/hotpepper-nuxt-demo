import type { H3Event } from 'h3'
import { setResponseStatus } from 'h3'
import { createFailureResult } from '../types/api'
import type { ApiError } from '../types/api'

/**
 * バリデーションエラーを表すカスタムエラークラス
 *
 * ルート単位の入力チェックエラーに利用する軽量エラー。
 * HTTPステータス400で返却される。
 *
 * @example
 * ```typescript
 * throw new ValidationError('店舗IDは必須です', { field: 'id' })
 * ```
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

/**
 * バリデーションエラーを統一フォーマットで返却する
 *
 * @param event - H3イベント
 * @param error - ValidationErrorインスタンス
 * @returns ApiFailure型のレスポンス（HTTPステータス400）
 *
 * @example
 * ```typescript
 * export default defineEventHandler(async (event) => {
 *   try {
 *     const query = validateQuery(event)
 *   } catch (error) {
 *     if (error instanceof ValidationError) {
 *       return respondWithValidationError(event, error)
 *     }
 *     throw error
 *   }
 * })
 * ```
 */
export const respondWithValidationError = (event: H3Event, error: ValidationError) => {
  setResponseStatus(event, 400)
  return createFailureResult({
    code: 'VALIDATION_ERROR',
    message: error.message,
    details: error.details,
  })
}

/**
 * HotPepperクライアントのエラーをステータスコード付きで透過する
 *
 * @param event - H3イベント
 * @param error - ApiErrorインスタンス
 * @param fallback - statusCodeが未設定の場合のデフォルトステータスコード（デフォルト: 502）
 * @returns ApiFailure型のレスポンス
 *
 * @example
 * ```typescript
 * const result = await client.searchShops(params)
 * if (!result.success) {
 *   return respondWithUpstreamError(event, result.error)
 * }
 * ```
 */
export const respondWithUpstreamError = (event: H3Event, error: ApiError, fallback = 502) => {
  setResponseStatus(event, error.statusCode ?? fallback)
  return createFailureResult(error)
}

/**
 * getValidatedQuery などが生成する H3Error から ValidationError を取り出す
 */
export const extractValidationError = (error: unknown): ValidationError | null => {
  if (error instanceof ValidationError) {
    return error
  }
  if (error && typeof error === 'object') {
    const { data, cause } = error as { data?: unknown; cause?: unknown }
    if (data instanceof ValidationError) {
      return data
    }
    if (cause instanceof ValidationError) {
      return cause
    }
  }
  return null
}
