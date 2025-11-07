/**
 * Nitro ログユーティリティ
 *
 * サーバーサイドのログ出力機能を提供します。
 * - ログレベル: DEBUG/INFO/WARN/ERROR/FATAL
 * - カテゴリ: ACCESS/SSR/API/SYSTEM など
 * - フォーマット: [timestamp] [level] [category] message [metadata]
 * - タイムスタンプ: JST（ISO8601形式、例: 2025-11-05T19:30:45+09:00）
 */

/** ログレベル定義 */
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL'

/** ログカテゴリ定義（定義済みカテゴリ以外も使用可能） */
export type LogCategory = 'ACCESS' | 'SSR' | 'API' | 'SYSTEM' | string

/** ログメタデータ（任意の追加情報を含む） */
export type LogMetadata = Record<string, unknown>

/** ログレベルの優先度（フィルタリングに使用） */
export const LEVEL_PRIORITY: Record<LogLevel, number> = {
  DEBUG: 10,
  INFO: 20,
  WARN: 30,
  ERROR: 40,
  FATAL: 50,
}

/**
 * JST（日本標準時）フォーマッター
 * - sv-SE ロケールを使用することでISO8601形式に近い出力を得る
 * - タイムゾーン: Asia/Tokyo
 */
const JST_FORMATTER = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Asia/Tokyo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
}) as Intl.DateTimeFormat

/** JSTのタイムゾーンオフセット */
const JST_OFFSET = '+09:00'

/**
 * ロガー設定
 */
interface LoggerConfig {
  /** 最小ログレベル（これ以上の優先度のログのみ出力） */
  minLevel: LogLevel
}

/**
 * ロガーコンテキスト
 * - インスタンス毎に保持される状態（カテゴリ、メタデータ）
 */
interface LoggerContext {
  /** ログカテゴリ */
  category: LogCategory
  /** 共通メタデータ（すべてのログに付与される） */
  metadata: LogMetadata
}

/**
 * Nitro ロガークラス
 *
 * ログ出力の中核となるクラスです。
 * - レベルフィルタリング（minLevel以上のログのみ出力）
 * - カテゴリ設定（withCategory）
 * - メタデータ付与（withMetadata）
 * - 標準出力/エラー出力への書き込み
 *
 * @example
 * ```typescript
 * const logger = NitroLogger.create({ minLevel: 'INFO' }, writeLine)
 * logger.info('Server started', { port: 3000 })
 *
 * const apiLogger = logger.withCategory('API')
 * apiLogger.debug('API called', { endpoint: '/api/shops' })
 * ```
 */
export class NitroLogger {
  constructor(
    private readonly config: LoggerConfig,
    private readonly context: LoggerContext,
    private readonly write: (line: string, level: LogLevel) => void,
  ) {}

  /**
   * ロガーインスタンスを作成する
   *
   * @param initialConfig - ログレベル設定
   * @param writer - ログ書き込み関数（標準出力/エラー出力への書き込み）
   * @returns ロガーインスタンス（デフォルトカテゴリ: SYSTEM）
   */
  static create(initialConfig: LoggerConfig, writer: (line: string, level: LogLevel) => void) {
    return new NitroLogger(initialConfig, { category: 'SYSTEM', metadata: {} }, writer)
  }

  /**
   * DEBUGレベルのログを出力
   * 開発時のデバッグ情報用（本番では通常出力しない）
   */
  debug(message: string, metadata?: LogMetadata) {
    this.log('DEBUG', message, metadata)
  }

  /**
   * INFOレベルのログを出力
   * 通常の情報ログ（アクセスログ、処理成功など）
   */
  info(message: string, metadata?: LogMetadata) {
    this.log('INFO', message, metadata)
  }

  /**
   * WARNレベルのログを出力
   * 警告（リトライ発生、非推奨機能の使用など）
   */
  warn(message: string, metadata?: LogMetadata) {
    this.log('WARN', message, metadata)
  }

  /**
   * ERRORレベルのログを出力
   * エラー（API呼び出し失敗、想定外の状態など）
   */
  error(message: string, metadata?: LogMetadata) {
    this.log('ERROR', message, metadata)
  }

  /**
   * FATALレベルのログを出力
   * 致命的なエラー（サーバー停止を伴うような重大な問題）
   */
  fatal(message: string, metadata?: LogMetadata) {
    this.log('FATAL', message, metadata)
  }

  /**
   * カテゴリを設定した新しいロガーを作成
   *
   * @param category - ログカテゴリ（ACCESS/SSR/API/SYSTEM など）
   * @returns カテゴリが設定された新しいロガーインスタンス
   *
   * @example
   * ```typescript
   * const apiLogger = logger.withCategory('API')
   * apiLogger.info('API called') // [timestamp] [INFO] [API] API called
   * ```
   */
  withCategory(category: LogCategory) {
    return new NitroLogger(
      this.config,
      { ...this.context, category: category.toUpperCase() },
      this.write,
    )
  }

  /**
   * メタデータを設定した新しいロガーを作成
   *
   * @param metadata - 共通メタデータ（すべてのログに付与される）
   * @returns メタデータが設定された新しいロガーインスタンス
   *
   * @example
   * ```typescript
   * const requestLogger = logger.withMetadata({ method: 'GET', path: '/api/shops' })
   * requestLogger.info('Request received') // メタデータが自動付与される
   * ```
   */
  withMetadata(metadata: LogMetadata) {
    return new NitroLogger(
      this.config,
      {
        ...this.context,
        metadata: { ...this.context.metadata, ...metadata },
      },
      this.write,
    )
  }

  /**
   * ログを出力する内部メソッド
   * - ログレベルフィルタリング
   * - タイムスタンプ付与
   * - メタデータマージ
   * - フォーマット整形
   */
  private log(level: LogLevel, message: string, metadata?: LogMetadata) {
    if (!this.shouldLog(level)) {
      return
    }

    const timestamp = formatTimestampJst(new Date())
    const category = this.context.category.toUpperCase()
    const mergedMetadata = { ...this.context.metadata, ...(metadata ?? {}) }
    const metadataString = formatMetadata(mergedMetadata)
    const line = `[${timestamp}] [${level}] [${category}] ${message}${metadataString}`
    this.write(line, level)
  }

  /**
   * ログレベルフィルタリング判定
   * minLevel以上の優先度のログのみtrue
   */
  private shouldLog(level: LogLevel) {
    return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[this.config.minLevel]
  }
}

/**
 * ログレベル文字列を解決する
 *
 * @param value - 環境変数などから取得した値（文字列、数値、undefined等）
 * @returns 有効なLogLevel（不正な値の場合はINFO）
 *
 * @example
 * ```typescript
 * resolveLogLevel('debug')   // 'DEBUG'
 * resolveLogLevel('ERROR')   // 'ERROR'
 * resolveLogLevel('invalid') // 'INFO' (デフォルト)
 * resolveLogLevel(undefined) // 'INFO' (デフォルト)
 * ```
 */
export function resolveLogLevel(value: unknown): LogLevel {
  if (!value && value !== 0) {
    return 'INFO'
  }

  const normalized = String(value).toUpperCase()
  return normalized in LEVEL_PRIORITY ? (normalized as LogLevel) : 'INFO'
}

/**
 * 真偽値を解決する
 *
 * @param value - 環境変数などから取得した値（boolean、文字列、数値、undefined等）
 * @param fallback - 値がundefined/nullの場合のデフォルト値
 * @returns 真偽値
 *
 * @example
 * ```typescript
 * resolveBoolean(true, false)       // true
 * resolveBoolean('1', false)        // true
 * resolveBoolean('true', false)     // true
 * resolveBoolean('yes', false)      // true
 * resolveBoolean('on', false)       // true
 * resolveBoolean('false', true)     // false
 * resolveBoolean('0', true)         // false
 * resolveBoolean(undefined, true)   // true (fallback)
 * ```
 */
export function resolveBoolean(value: unknown, fallback: boolean) {
  if (value === undefined || value === null) {
    return fallback
  }
  if (typeof value === 'boolean') {
    return value
  }
  const normalized = String(value).trim().toLowerCase()
  return ['1', 'true', 'yes', 'on'].includes(normalized)
}

/**
 * タイムスタンプをJST（日本標準時）のISO8601形式でフォーマットする
 *
 * @param date - フォーマット対象の日時
 * @returns ISO8601形式の文字列（例: 2025-11-05T19:30:45+09:00）
 *
 * @example
 * ```typescript
 * formatTimestampJst(new Date('2025-11-05T10:30:45Z'))
 * // => '2025-11-05T19:30:45+09:00'
 * ```
 */
export function formatTimestampJst(date: Date) {
  const parts = JST_FORMATTER.formatToParts(date).reduce<Record<string, string>>((acc, part) => {
    if (part.type !== 'literal') {
      acc[part.type] = part.value
    }
    return acc
  }, {})

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}${JST_OFFSET}`
}

/**
 * メタデータをJSON文字列にフォーマットする
 *
 * @param metadata - ログメタデータ
 * @returns JSON文字列（先頭にスペース付き、空の場合は空文字列）
 *
 * @example
 * ```typescript
 * formatMetadata({ method: 'GET', path: '/api/shops' })
 * // => ' {"method":"GET","path":"/api/shops"}'
 *
 * formatMetadata({})
 * // => ''
 * ```
 */
export function formatMetadata(metadata: LogMetadata) {
  if (!metadata || Object.keys(metadata).length === 0) {
    return ''
  }

  try {
    return ` ${JSON.stringify(metadata)}`
  } catch {
    // シリアライズできないオブジェクト（循環参照など）の場合
    return ' {"metadata":"[unserializable]"}'
  }
}
