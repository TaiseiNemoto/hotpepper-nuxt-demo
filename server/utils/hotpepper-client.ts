import { FetchError, ofetch } from 'ofetch'
import { useRuntimeConfig } from '#imports'
import type { H3Event } from 'h3'
import type { NitroLogger } from './logger-utils'
import {
  type ApiError,
  type ApiResult,
  type ErrorCode,
  createFailureResult,
  createSuccessResult,
} from '../types/api'
import type {
  HotpepperEnvelope,
  HotpepperGenreResults,
  HotpepperLargeAreaResults,
  HotpepperMiddleAreaResults,
  HotpepperRequestQuery,
  HotpepperResultsBase,
  HotpepperSearchResults,
  HotpepperSmallAreaResults,
} from '../types/hotpepper'

const HOTPEPPER_BASE_URL = 'https://webservice.recruit.co.jp/hotpepper/'
/** デフォルトタイムアウト: HotPepper APIの平均応答時間（2-3秒）+ マージン */
const DEFAULT_TIMEOUT_MS = 7000
/** 最大リトライ回数: 通信エラー/5xxエラー時に1回のみ再試行 */
const MAX_RETRIES = 1
/** リトライ遅延: 指数バックオフの基底値（attempt * 250ms） */
const RETRY_DELAY_MS = 250
const DEFAULT_HEADERS = {
  'User-Agent': 'hotpepper-nuxt-demo/1.0 (+https://example.com)',
}

/**
 * HotPepper APIクライアントのオプション
 */
export interface HotpepperClientOptions {
  /** H3イベント（runtimeConfigとloggerの取得に使用） */
  event?: H3Event
  /** ロガーインスタンス（未指定時はevent.context.loggerを使用） */
  logger?: NitroLogger
  /** タイムアウト（ミリ秒、デフォルト: 7000ms） */
  timeoutMs?: number
}

/**
 * 店舗検索のパラメータ
 */
export type ShopSearchParams = HotpepperRequestQuery & {
  keyword?: string
  freeword?: string
  large_area?: string
  middle_area?: string
  small_area?: string
  genre?: string
  lat?: number | string
  lng?: number | string
  range?: 1 | 2 | 3 | 4 | 5
  start?: number
  count?: number
  order?: 1 | 2 | 3 | 4 | 5
  id?: string
}

/**
 * 中エリアマスタ取得のパラメータ
 */
export interface MiddleAreaParams extends HotpepperRequestQuery {
  /** 大エリアコード（絞り込み用） */
  large_area?: string
}

/**
 * 小エリアマスタ取得のパラメータ
 */
export interface SmallAreaParams extends HotpepperRequestQuery {
  /** 中エリアコード（絞り込み用） */
  middle_area?: string
}

/**
 * HotPepper Gourmet API クライアント
 *
 * HotPepper APIへのリクエストを管理し、エラーハンドリング、リトライ、ログ出力を提供します。
 * 内部API（/api/hp/*）から使用されることを想定しています。
 *
 * @example
 * ```typescript
 * export default defineEventHandler(async (event) => {
 *   const client = createHotpepperClient(event)
 *   const result = await client.searchShops({ keyword: '焼肉', count: 20 })
 *   if (result.success) {
 *     return result.data
 *   }
 *   throw createError({ statusCode: result.error.statusCode ?? 500, message: result.error.message })
 * })
 * ```
 */
export class HotpepperClient {
  private readonly fetcher = ofetch.create({
    baseURL: HOTPEPPER_BASE_URL,
    retry: 0,
    headers: DEFAULT_HEADERS,
    method: 'GET',
  })

  private readonly apiKey: string
  private readonly logger?: NitroLogger
  private readonly timeoutMs: number

  constructor(options: HotpepperClientOptions = {}) {
    const runtimeConfig = useRuntimeConfig(options.event)
    this.apiKey = runtimeConfig.hotpepperApiKey
    this.logger = (options.logger ?? options.event?.context.logger)?.withCategory('API')
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  }

  /**
   * 店舗を検索する
   *
   * @param params - 検索条件（キーワード、エリア、位置情報など）
   * @returns 検索結果（ApiResult型でラップ）
   */
  async searchShops(params: ShopSearchParams = {}): Promise<ApiResult<HotpepperSearchResults>> {
    return this.request('gourmet/v1/', params)
  }

  /**
   * 店舗詳細を取得する
   *
   * @param id - 店舗ID
   * @returns 店舗詳細（ApiResult型でラップ）
   */
  async getShopDetail(id: string): Promise<ApiResult<HotpepperSearchResults>> {
    return this.searchShops({ id, count: 1 })
  }

  /**
   * ジャンルマスタを取得する
   *
   * @returns ジャンル一覧（ApiResult型でラップ）
   */
  async getGenres(): Promise<ApiResult<HotpepperGenreResults>> {
    return this.request('genre/v1/')
  }

  /**
   * 大エリアマスタを取得する
   *
   * @returns 大エリア一覧（ApiResult型でラップ）
   */
  async getLargeAreas(): Promise<ApiResult<HotpepperLargeAreaResults>> {
    return this.request('large_area/v1/')
  }

  /**
   * 中エリアマスタを取得する
   *
   * @param params - 絞り込み条件（大エリアコード）
   * @returns 中エリア一覧（ApiResult型でラップ）
   */
  async getMiddleAreas(
    params: MiddleAreaParams = {},
  ): Promise<ApiResult<HotpepperMiddleAreaResults>> {
    return this.request('middle_area/v1/', params)
  }

  /**
   * 小エリアマスタを取得する
   *
   * @param params - 絞り込み条件（中エリアコード）
   * @returns 小エリア一覧（ApiResult型でラップ）
   */
  async getSmallAreas(params: SmallAreaParams = {}): Promise<ApiResult<HotpepperSmallAreaResults>> {
    return this.request('small_area/v1/', params)
  }

  private async request<T extends HotpepperResultsBase>(
    endpoint: string,
    query: HotpepperRequestQuery = {},
  ): Promise<ApiResult<T>> {
    if (!this.apiKey) {
      return createFailureResult(this.createConfigError())
    }

    const normalizedQuery = this.buildQuery(query)
    const scrubbedQuery = this.scrubQuery(normalizedQuery)
    this.logger?.debug('HotPepper API呼び出し開始', { endpoint, query: scrubbedQuery })

    try {
      const results = await this.executeWithRetry((attempt) =>
        this.fetchEnvelope<T>(endpoint, normalizedQuery, attempt),
      )
      this.logger?.info('HotPepper API呼び出し成功', {
        endpoint,
        count: this.extractCount(results),
      })
      return createSuccessResult(results)
    } catch (error) {
      const apiError = this.toApiError(error)
      this.logger?.error('HotPepper API呼び出し失敗', {
        endpoint,
        query: scrubbedQuery,
        error: apiError,
      })
      return createFailureResult(apiError)
    }
  }

  private async fetchEnvelope<T extends HotpepperResultsBase>(
    endpoint: string,
    query: HotpepperRequestQuery,
    attempt: number,
  ): Promise<T> {
    const signal = AbortSignal.timeout(this.timeoutMs)
    const startedAt = Date.now()

    let response = await this.fetcher<HotpepperEnvelope<T>>(endpoint, {
      query,
      signal,
    })
    const durationMs = Date.now() - startedAt

    // ofetchがJSONをパースしない場合があるため、手動でパース
    if (typeof response === 'string') {
      try {
        response = JSON.parse(response)
      } catch (error) {
        this.logger?.error('JSONパースに失敗', {
          endpoint,
          error: error instanceof Error ? error.message : String(error),
        })
        throw new Error(`JSONパースに失敗しました (endpoint: ${endpoint})`)
      }
    }

    if (!response) {
      throw new Error(`レスポンスが undefined です (endpoint: ${endpoint})`)
    }

    if (!response.results) {
      this.logger?.error('レスポンスに results キーがありません', {
        endpoint,
        responseType: typeof response,
        responseKeys: typeof response === 'object' ? Object.keys(response) : [],
      })
      throw new Error(`レスポンスに results キーがありません (endpoint: ${endpoint})`)
    }

    this.logger?.debug('HotPepper APIレスポンス取得', {
      endpoint,
      durationMs,
      attempt,
    })

    return response.results
  }

  private buildQuery(query: HotpepperRequestQuery) {
    const merged: HotpepperRequestQuery = {
      format: 'json',
      key: this.apiKey,
      ...query,
    }
    return Object.keys(merged).reduce<HotpepperRequestQuery>((acc, key) => {
      const value = merged[key]
      if (value === undefined || value === null) {
        return acc
      }
      acc[key] = typeof value === 'boolean' ? Number(value) : value
      return acc
    }, {})
  }

  private scrubQuery(query: HotpepperRequestQuery) {
    const cloned = { ...query }
    if (cloned.key) {
      cloned.key = '***'
    }
    return cloned
  }

  private async executeWithRetry<T>(fn: (attempt: number) => Promise<T>) {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        return await fn(attempt)
      } catch (error) {
        if (attempt >= MAX_RETRIES || !this.shouldRetry(error)) {
          throw error
        }
        this.logger?.warn('HotPepper APIをリトライします', {
          attempt: attempt + 1,
          maxRetries: MAX_RETRIES,
        })
        await this.delay(RETRY_DELAY_MS * (attempt + 1))
      }
    }
    throw new Error('Unreachable')
  }

  private shouldRetry(error: unknown) {
    if (error instanceof FetchError) {
      const statusCode = error.response?.status
      if (!statusCode) {
        return true
      }
      return statusCode >= 500
    }
    return this.isAbortError(error)
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private toApiError(error: unknown): ApiError {
    if (error instanceof FetchError) {
      const statusCode = error.response?.status
      const code = this.resolveErrorCode(statusCode)
      return {
        code,
        message: this.resolveErrorMessage(code, statusCode),
        statusCode,
        details: {
          data: error.data,
          url: error.request?.toString(),
        },
        cause: error,
      }
    }

    if (this.isAbortError(error)) {
      return {
        code: 'TIMEOUT',
        message: 'HotPepper APIがタイムアウトしました',
        cause: error,
      }
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: 'HotPepper API呼び出しで不明なエラーが発生しました',
      cause: error,
    }
  }

  private resolveErrorCode(statusCode?: number): ErrorCode {
    if (!statusCode) {
      return 'NETWORK_ERROR'
    }
    if (statusCode === 404) {
      return 'NOT_FOUND'
    }
    if (statusCode >= 400 && statusCode < 500) {
      return 'API_ERROR'
    }
    if (statusCode >= 500) {
      return 'UPSTREAM_ERROR'
    }
    return 'UNKNOWN_ERROR'
  }

  private resolveErrorMessage(code: ErrorCode, statusCode?: number) {
    switch (code) {
      case 'NOT_FOUND':
        return 'HotPepper APIでリソースが見つかりませんでした'
      case 'API_ERROR':
        return 'HotPepper APIへのリクエストが不正です'
      case 'UPSTREAM_ERROR':
        return 'HotPepper APIでサーバーエラーが発生しました'
      case 'NETWORK_ERROR':
        return 'HotPepper APIへの接続に失敗しました'
      default:
        return statusCode
          ? `HotPepper APIエラー (status: ${statusCode})`
          : 'HotPepper APIで不明なエラーが発生しました'
    }
  }

  private isAbortError(error: unknown) {
    return error instanceof DOMException && error.name === 'AbortError'
  }

  private createConfigError(): ApiError {
    return {
      code: 'CONFIG_ERROR',
      message: 'HotPepper APIキーが未設定です (NUXT_HOTPEPPER_API_KEY)。',
    }
  }

  private extractCount(results: HotpepperResultsBase) {
    return {
      available: results.results_available,
      returned: results.results_returned,
      start: results.results_start,
    }
  }
}

/**
 * HotPepper APIクライアントを作成する
 *
 * @param event - H3イベント（runtimeConfigとloggerの取得に使用）
 * @param options - 追加オプション（logger、timeoutMs）
 * @returns HotpepperClientインスタンス
 *
 * @example
 * ```typescript
 * const client = createHotpepperClient(event)
 * const result = await client.searchShops({ keyword: '焼肉' })
 * ```
 */
export const createHotpepperClient = (event?: H3Event, options?: HotpepperClientOptions) =>
  new HotpepperClient({ event, ...(options ?? {}) })
