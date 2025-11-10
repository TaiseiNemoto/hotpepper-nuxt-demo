import type { UseFetchOptions } from '#app'
import type { ApiError, ApiResult } from '../../server/types/api'

/**
 * 内部API呼び出し共通ロジック
 * ApiResult<T>型のレスポンスを扱うuseFetchラッパー
 */
export const useInternalApi = <T>(
  url: MaybeRefOrGetter<string>,
  options?: UseFetchOptions<ApiResult<T>>,
) => {
  const { data, error, status, refresh, execute } = useFetch<ApiResult<T>>(url, {
    ...options,
    // ApiResult<T>型のレスポンスを想定
    default: () => ({ success: false, error: createDefaultError() }) as ApiResult<T>,
  })

  /**
   * APIエラーを取得
   * ネットワークエラーを優先し、次にアプリケーションエラーをチェック
   */
  const apiError = computed<ApiError | null>(() => {
    // 1. ネットワークエラー（useFetchのerror）を優先
    if (error.value) {
      return {
        code: 'NETWORK_ERROR',
        message: error.value.message || 'Network request failed',
        cause: error.value,
      }
    }

    // 2. アプリケーションエラー（ApiResultのエラー）
    if (data.value && !data.value.success) {
      return data.value.error
    }

    // 3. エラーなし
    return null
  })

  /**
   * エラーメッセージを取得
   */
  const errorMessage = computed<string | null>(() => {
    return apiError.value?.message ?? null
  })

  /**
   * ローディング状態
   */
  const isLoading = computed(() => status.value === 'pending')

  /**
   * 成功したかどうか
   * ネットワークエラーがなく、かつAPIレスポンスがsuccessの場合のみtrue
   */
  const isSuccess = computed(() => {
    return !error.value && data.value?.success === true
  })

  /**
   * 失敗したかどうか
   * ネットワークエラーまたはアプリケーションエラーがある場合にtrue
   */
  const isFailure = computed(() => {
    return !!error.value || data.value?.success === false
  })

  /**
   * レスポンスデータを取得（success時のみ）
   */
  const responseData = computed<T | null>(() => {
    if (!data.value || !data.value.success) return null
    return data.value.data
  })

  return {
    data: responseData,
    apiError,
    errorMessage,
    isLoading,
    isSuccess,
    isFailure,
    error,
    status,
    refresh,
    execute,
  }
}

/**
 * デフォルトエラーを生成
 */
function createDefaultError(): ApiError {
  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
  }
}
