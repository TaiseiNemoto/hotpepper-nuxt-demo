import { ValidationError } from './api-response'

/**
 * エリアコード・ジャンルコードなどの最大文字数
 */
export const MAX_CODE_LENGTH = 16

/**
 * エリアコードやジャンルコードなどのパラメータを正規化する
 *
 * @param value - 検証対象の値
 * @param fieldLabel - エラーメッセージに使用するフィールド名
 * @param required - 必須フィールドかどうか（デフォルト: false）
 * @returns 正規化された文字列、またはundefined（任意フィールドで値が空の場合）
 * @throws {ValidationError} バリデーションエラーが発生した場合
 *
 * @example
 * ```typescript
 * // 任意フィールドの場合
 * const code = normalizeCode(query.largeAreaCode, 'largeAreaCode', false)
 * // => undefined | string
 *
 * // 必須フィールドの場合
 * const code = normalizeCode(query.middleAreaCode, 'middleAreaCode', true)
 * // => string（undefinedの場合はValidationErrorをthrow）
 * ```
 */
export const normalizeCode = (
  value: unknown,
  fieldLabel: string,
  required = false,
): string | undefined => {
  // 空値のチェック
  if (value === undefined || value === null || value === '') {
    if (required) {
      throw new ValidationError(`${fieldLabel}を指定してください`)
    }
    return undefined
  }

  // 配列の場合はエラー
  if (Array.isArray(value)) {
    throw new ValidationError(`${fieldLabel}は単一の値で指定してください`)
  }

  // 文字列以外はエラー
  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldLabel}は文字列で指定してください`)
  }

  // トリムして空文字チェック
  const trimmed = value.trim()
  if (!trimmed) {
    if (required) {
      throw new ValidationError(`${fieldLabel}を指定してください`)
    }
    throw new ValidationError(`${fieldLabel}の値が空です`)
  }

  // 最大文字数チェック
  if (trimmed.length > MAX_CODE_LENGTH) {
    throw new ValidationError(`${fieldLabel}は${MAX_CODE_LENGTH}文字以内で指定してください`)
  }

  return trimmed
}

/**
 * オブジェクトをRecord<string, unknown>型に安全に変換する
 *
 * @param value - 変換対象の値
 * @returns Record<string, unknown>型のオブジェクト（変換できない場合は空オブジェクト）
 */
export const toRecord = (value: unknown): Record<string, unknown> => {
  if (value && typeof value === 'object') {
    return value as Record<string, unknown>
  }
  return {}
}
