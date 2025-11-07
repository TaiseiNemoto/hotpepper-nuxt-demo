/**
 * Nitro ログプラグイン
 *
 * サーバーサイドのログ出力を一元管理するプラグインです。
 * - アクセスログ: すべてのHTTPリクエストを記録
 * - SSRログ: サーバーサイドレンダリングの完了を記録
 * - エラーログ: システムエラーを記録
 *
 * ロガーインスタンスは event.context.logger に設定され、
 * APIハンドラーや他のサーバーコードから利用できます。
 */

import { defineNitroPlugin, useRuntimeConfig } from '#imports'
import type { NitroApp } from 'nitropack'
import type { H3Event } from 'h3'
import { getRequestIP } from 'h3'
import {
  type LogLevel,
  type LogMetadata,
  NitroLogger,
  resolveBoolean,
  resolveLogLevel,
} from '../utils/logger-utils'

// Re-export for backward compatibility
export { NitroLogger, resolveBoolean, resolveLogLevel } from '../utils/logger-utils'
export type { LogLevel, LogCategory, LogMetadata } from '../utils/logger-utils'

/**
 * H3EventContextにロガーインスタンスを追加
 * これにより、event.context.logger でロガーにアクセスできる
 */
declare module 'h3' {
  interface H3EventContext {
    logger?: NitroLogger
  }
}

/** ログカテゴリ定数 */
const ACCESS_CATEGORY = 'ACCESS' // HTTPアクセスログ
const SSR_CATEGORY = 'SSR' // サーバーサイドレンダリングログ
const SYSTEM_CATEGORY = 'SYSTEM' // システムエラーログ

/**
 * beforeResponseフックのペイロード型定義
 * Nitro内部の型が不安定なため、独自に定義
 */
interface NitroBeforeResponsePayload {
  statusCode?: number
  headers?: Record<string, string | string[]> | Headers
  body?: unknown
}

export default defineNitroPlugin((nitroApp: NitroApp) => {
  /**
   * requestフック: すべてのHTTPリクエスト開始時に実行
   * - ロガーインスタンスを作成し、event.context.logger に設定
   * - アクセスログを出力（設定で有効な場合）
   */
  nitroApp.hooks.hook('request', (event: H3Event) => {
    const logSettings = getLogSettings(event)
    const baseLogger = createBaseLogger(event)

    // リクエスト情報（メソッド、パス、IPアドレス）をメタデータとして付与
    const requestLogger = baseLogger.withMetadata({
      method: event.node.req.method,
      path: event.path,
      ip: getRequestIP(event),
    })
    // ロガーをイベントコンテキストに保存（APIハンドラーで利用可能）
    event.context.logger = requestLogger

    // アクセスログ出力（例: "[ACCESS] GET /api/hp/shops/search"）
    if (logSettings.accessLoggingEnabled) {
      requestLogger.withCategory(ACCESS_CATEGORY).info(`${event.node.req.method} ${event.path}`)
    }
  })

  /**
   * beforeResponseフック: レスポンス返却直前に実行
   * - SSRレンダリング完了時にログ出力（HTML応答の場合のみ）
   */
  nitroApp.hooks.hook('beforeResponse', (event: H3Event, response: NitroBeforeResponsePayload) => {
    const requestLogger = ensureRequestLogger(event, () => createBaseLogger(event))
    const statusCode = response.statusCode ?? event.node.res.statusCode
    // Content-Typeが text/html の場合のみSSRログを出力
    if (isSsrResponse(response)) {
      requestLogger.withCategory(SSR_CATEGORY).debug('SSR response dispatched', {
        statusCode,
      })
    }
  })

  /**
   * errorフック: Nitroでエラーが発生した時に実行
   * - システムエラーをログ出力
   * - エラーメタデータ（スタックトレース、HTTPステータスなど）を記録
   */
  nitroApp.hooks.hook('error', (error: unknown, context?: { event?: H3Event }) => {
    const requestLogger = context?.event
      ? ensureRequestLogger(context.event, () => createBaseLogger(context.event))
      : createBaseLogger()

    const systemLogger = requestLogger.withCategory(SYSTEM_CATEGORY)
    if (error instanceof Error) {
      systemLogger.error(error.message, serializeErrorMetadata(error, context?.event))
    } else {
      // Errorインスタンス以外（例: throw 'string'）の場合
      systemLogger.error('Non-error exception captured', { error })
    }
  })
})

/**
 * ログ設定を取得する
 * - 環境変数からログレベルとアクセスログ有効/無効を読み取る
 */
function getLogSettings(event?: H3Event) {
  const runtimeConfig = useRuntimeConfig(event)

  return {
    minLevel: resolveLogLevel(runtimeConfig.logLevel),
    accessLoggingEnabled: resolveBoolean(runtimeConfig.logEnableAccess, true),
  }
}

/**
 * ベースロガーを作成する
 * - ログレベルを環境変数から取得
 * - 標準出力/エラー出力への書き込み処理を設定
 */
function createBaseLogger(event?: H3Event) {
  const { minLevel } = getLogSettings(event)
  return NitroLogger.create({ minLevel }, writeLine)
}

/**
 * ログを標準出力/エラー出力に書き込む
 * - ERROR/FATAL → stderr
 * - それ以外（DEBUG/INFO/WARN） → stdout
 */
function writeLine(line: string, level: LogLevel) {
  const target = level === 'ERROR' || level === 'FATAL' ? process.stderr : process.stdout

  target.write(`${line}\n`)
}

/**
 * リクエストロガーを取得または作成する
 * - event.context.logger が存在する場合はそれを返す
 * - 存在しない場合は新規作成してコンテキストに保存
 *
 * beforeResponseやerrorフックでは、requestフックで作成したロガーを再利用する。
 * 万が一requestフックが実行されなかった場合のフォールバック処理。
 */
function ensureRequestLogger(event: H3Event, factory: () => NitroLogger) {
  if (event.context.logger) {
    return event.context.logger
  }
  // リクエスト情報をメタデータとして付与
  const synthesized = factory().withMetadata({
    method: event.node.req.method,
    path: event.path,
  })
  event.context.logger = synthesized
  return synthesized
}

/**
 * レスポンスがSSR（HTML）かどうかを判定する
 * - Content-Typeヘッダーに text/html が含まれているかチェック
 */
function isSsrResponse(response: NitroBeforeResponsePayload) {
  if (!response.headers) {
    return false
  }

  const headerValue =
    response.headers instanceof Headers
      ? response.headers.get('content-type')
      : normalizeHeaderValues(response.headers)['content-type']

  return Boolean(headerValue && headerValue.includes('text/html'))
}

/**
 * ヘッダー値を正規化する
 * - ヘッダー名を小文字に統一
 * - 配列値をカンマ区切り文字列に変換
 */
function normalizeHeaderValues(headers: Record<string, string | string[]>) {
  return Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [
      key.toLowerCase(),
      Array.isArray(value) ? value.join(', ') : value,
    ]),
  )
}

/**
 * エラーオブジェクトをログメタデータに変換する
 * - エラー名、スタックトレース、HTTPステータスコードなどを抽出
 * - リクエスト情報（メソッド、パス）も含める
 */
function serializeErrorMetadata(error: unknown, event?: H3Event): LogMetadata {
  if (!(error instanceof Error)) {
    return { error }
  }

  const metadata: LogMetadata = {
    name: error.name,
    stack: error.stack,
  }

  // H3Error などHTTPステータスコードを持つエラーの場合
  const statusCode = (error as { statusCode?: number }).statusCode
  if (typeof statusCode === 'number') {
    metadata.statusCode = statusCode
  }
  // リクエスト情報を追加
  if (event) {
    metadata.method = event.node.req.method
    metadata.path = event.path
  }

  return metadata
}
