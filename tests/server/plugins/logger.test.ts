// @vitest-environment nuxt
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  LEVEL_PRIORITY,
  type LogLevel,
  type LogMetadata,
  NitroLogger,
  formatMetadata,
  formatTimestampJst,
  resolveBoolean,
  resolveLogLevel,
} from '../../../server/utils/logger-utils'

describe('ログユーティリティ', () => {
  describe('resolveLogLevel', () => {
    it('有効なログレベル文字列を正しく返す', () => {
      expect(resolveLogLevel('DEBUG')).toBe('DEBUG')
      expect(resolveLogLevel('INFO')).toBe('INFO')
      expect(resolveLogLevel('WARN')).toBe('WARN')
      expect(resolveLogLevel('ERROR')).toBe('ERROR')
      expect(resolveLogLevel('FATAL')).toBe('FATAL')
    })

    it('大文字小文字を正規化する', () => {
      expect(resolveLogLevel('debug')).toBe('DEBUG')
      expect(resolveLogLevel('Info')).toBe('INFO')
      expect(resolveLogLevel('WaRn')).toBe('WARN')
    })

    it('undefined/null の場合は INFO を返す', () => {
      expect(resolveLogLevel(undefined)).toBe('INFO')
      expect(resolveLogLevel(null)).toBe('INFO')
    })

    it('無効な値の場合は INFO を返す', () => {
      expect(resolveLogLevel('INVALID')).toBe('INFO')
      expect(resolveLogLevel('trace')).toBe('INFO')
      expect(resolveLogLevel(123)).toBe('INFO')
      expect(resolveLogLevel({})).toBe('INFO')
    })
  })

  describe('resolveBoolean', () => {
    it('boolean値を正しく処理する', () => {
      expect(resolveBoolean(true, false)).toBe(true)
      expect(resolveBoolean(false, true)).toBe(false)
    })

    it('truthy文字列を正しく処理する', () => {
      expect(resolveBoolean('1', false)).toBe(true)
      expect(resolveBoolean('true', false)).toBe(true)
      expect(resolveBoolean('yes', false)).toBe(true)
      expect(resolveBoolean('on', false)).toBe(true)
    })

    it('truthy文字列の大文字小文字を正規化する', () => {
      expect(resolveBoolean('TRUE', false)).toBe(true)
      expect(resolveBoolean('Yes', false)).toBe(true)
      expect(resolveBoolean('ON', false)).toBe(true)
    })

    it('falsy文字列を正しく処理する', () => {
      expect(resolveBoolean('0', true)).toBe(false)
      expect(resolveBoolean('false', true)).toBe(false)
      expect(resolveBoolean('no', true)).toBe(false)
      expect(resolveBoolean('off', true)).toBe(false)
      expect(resolveBoolean('anything', true)).toBe(false)
    })

    it('undefined/null の場合は fallback を使用する', () => {
      expect(resolveBoolean(undefined, true)).toBe(true)
      expect(resolveBoolean(undefined, false)).toBe(false)
      expect(resolveBoolean(null, true)).toBe(true)
      expect(resolveBoolean(null, false)).toBe(false)
    })

    it('文字列から空白を除去する', () => {
      expect(resolveBoolean('  true  ', false)).toBe(true)
      expect(resolveBoolean('  1  ', false)).toBe(true)
      expect(resolveBoolean('  false  ', true)).toBe(false)
    })
  })

  describe('formatTimestampJst', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('ISO8601形式でJSTオフセット付きの日時をフォーマットする', () => {
      // 2025-11-07 12:34:56 JST
      vi.setSystemTime(new Date('2025-11-07T12:34:56+09:00'))

      const result = formatTimestampJst(new Date())
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+09:00$/)
      expect(result).toBe('2025-11-07T12:34:56+09:00')
    })

    it('常に +09:00 オフセットを使用する', () => {
      // Different times should all have the same offset
      const times = [
        '2025-01-01T00:00:00+09:00',
        '2025-06-15T15:30:45+09:00',
        '2025-12-31T23:59:59+09:00',
      ]

      times.forEach((timeStr) => {
        vi.setSystemTime(new Date(timeStr))
        const result = formatTimestampJst(new Date())
        expect(result).toContain('+09:00')
      })
    })

    it('異なる日付を正しく処理する', () => {
      vi.setSystemTime(new Date('2025-03-20T08:15:30+09:00'))
      expect(formatTimestampJst(new Date())).toBe('2025-03-20T08:15:30+09:00')

      vi.setSystemTime(new Date('2024-12-01T20:45:10+09:00'))
      expect(formatTimestampJst(new Date())).toBe('2024-12-01T20:45:10+09:00')
    })
  })

  describe('formatMetadata', () => {
    it('空のオブジェクトの場合は空文字を返す', () => {
      expect(formatMetadata({})).toBe('')
    })

    it('null/undefined の場合は空文字を返す', () => {
      expect(formatMetadata(null as unknown as LogMetadata)).toBe('')
      expect(formatMetadata(undefined as unknown as LogMetadata)).toBe('')
    })

    it('オブジェクトを先頭スペース付きでJSONシリアライズする', () => {
      const result = formatMetadata({ key: 'value', num: 123 })
      expect(result).toBe(' {"key":"value","num":123}')
    })

    it('ネストされたオブジェクトを処理する', () => {
      const metadata = {
        level1: {
          level2: 'nested',
        },
        array: [1, 2, 3],
      }
      const result = formatMetadata(metadata)
      expect(result).toBe(' {"level1":{"level2":"nested"},"array":[1,2,3]}')
    })

    it('様々なデータ型を処理する', () => {
      const metadata = {
        string: 'text',
        number: 42,
        boolean: true,
        nullValue: null,
      }
      const result = formatMetadata(metadata)
      expect(result).toContain('"string":"text"')
      expect(result).toContain('"number":42')
      expect(result).toContain('"boolean":true')
      expect(result).toContain('"nullValue":null')
    })

    it('シリアライズ不可能なオブジェクト（循環参照）を処理する', () => {
      const circular: { a: number; self?: unknown } = { a: 1 }
      circular.self = circular
      const result = formatMetadata(circular as LogMetadata)
      expect(result).toBe(' {"metadata":"[unserializable]"}')
    })
  })
})

describe('NitroLogger', () => {
  let mockWrite: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockWrite = vi.fn()
  })

  describe('レベルフィルタリング', () => {
    it('minLevel が INFO の場合、DEBUG を出力しない', () => {
      const logger = NitroLogger.create({ minLevel: 'INFO' }, mockWrite)
      logger.debug('debug message')
      expect(mockWrite).not.toHaveBeenCalled()
    })

    it('minLevel が INFO の場合、INFO 以上を出力する', () => {
      const logger = NitroLogger.create({ minLevel: 'INFO' }, mockWrite)

      logger.info('info message')
      logger.warn('warn message')
      logger.error('error message')
      logger.fatal('fatal message')

      expect(mockWrite).toHaveBeenCalledTimes(4)
    })

    it('minLevel が ERROR の場合、WARN を出力しない', () => {
      const logger = NitroLogger.create({ minLevel: 'ERROR' }, mockWrite)

      logger.debug('debug message')
      logger.info('info message')
      logger.warn('warn message')

      expect(mockWrite).not.toHaveBeenCalled()
    })

    it('minLevel が ERROR の場合、ERROR と FATAL を出力する', () => {
      const logger = NitroLogger.create({ minLevel: 'ERROR' }, mockWrite)

      logger.error('error message')
      logger.fatal('fatal message')

      expect(mockWrite).toHaveBeenCalledTimes(2)
    })

    it('minLevel が DEBUG の場合、全てのレベルを出力する', () => {
      const logger = NitroLogger.create({ minLevel: 'DEBUG' }, mockWrite)

      logger.debug('debug message')
      logger.info('info message')
      logger.warn('warn message')
      logger.error('error message')
      logger.fatal('fatal message')

      expect(mockWrite).toHaveBeenCalledTimes(5)
    })

    it('レベル優先度を尊重する', () => {
      // Verify that LEVEL_PRIORITY is correctly ordered
      expect(LEVEL_PRIORITY.DEBUG).toBeLessThan(LEVEL_PRIORITY.INFO)
      expect(LEVEL_PRIORITY.INFO).toBeLessThan(LEVEL_PRIORITY.WARN)
      expect(LEVEL_PRIORITY.WARN).toBeLessThan(LEVEL_PRIORITY.ERROR)
      expect(LEVEL_PRIORITY.ERROR).toBeLessThan(LEVEL_PRIORITY.FATAL)
    })
  })

  describe('ログフォーマット', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-11-07T12:34:56+09:00'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('正しい構造でログをフォーマットする', () => {
      const logger = NitroLogger.create({ minLevel: 'DEBUG' }, mockWrite)

      logger.info('test message')

      expect(mockWrite).toHaveBeenCalledTimes(1)
      const [line, level] = mockWrite.mock.calls[0]

      // [timestamp] [level] [category] message
      expect(line).toMatch(/^\[2025-11-07T12:34:56\+09:00\] \[INFO\] \[SYSTEM\] test message$/)
      expect(level).toBe('INFO')
    })

    it('ログ行にメタデータを含める', () => {
      const logger = NitroLogger.create({ minLevel: 'DEBUG' }, mockWrite)

      logger.info('test message', { key: 'value' })

      const [line] = mockWrite.mock.calls[0]
      expect(line).toContain('[INFO]')
      expect(line).toContain('test message')
      expect(line).toContain(' {"key":"value"}')
    })

    it('出力でカテゴリを大文字にする', () => {
      const logger = NitroLogger.create({ minLevel: 'DEBUG' }, mockWrite)

      logger.info('test')

      const [line] = mockWrite.mock.calls[0]
      expect(line).toContain('[SYSTEM]')
    })

    it('全てのログレベルを正しくフォーマットする', () => {
      const logger = NitroLogger.create({ minLevel: 'DEBUG' }, mockWrite)

      const levels: Array<{ method: keyof NitroLogger; level: LogLevel }> = [
        { method: 'debug', level: 'DEBUG' },
        { method: 'info', level: 'INFO' },
        { method: 'warn', level: 'WARN' },
        { method: 'error', level: 'ERROR' },
        { method: 'fatal', level: 'FATAL' },
      ]

      levels.forEach(({ method, level }) => {
        mockWrite.mockClear()
        ;(logger[method] as (message: string) => void)('test')

        const [line, callLevel] = mockWrite.mock.calls[0]
        expect(line).toContain(`[${level}]`)
        expect(callLevel).toBe(level)
      })
    })
  })

  describe('withCategory()', () => {
    it('異なるカテゴリで新しいロガーを作成する', () => {
      const baseLogger = NitroLogger.create({ minLevel: 'DEBUG' }, mockWrite)
      const apiLogger = baseLogger.withCategory('API')

      apiLogger.info('api log')

      const [line] = mockWrite.mock.calls[0]
      expect(line).toContain('[API]')
      expect(line).not.toContain('[SYSTEM]')
    })

    it('カテゴリを大文字にする', () => {
      const logger = NitroLogger.create({ minLevel: 'DEBUG' }, mockWrite)
      const customLogger = logger.withCategory('custom')

      customLogger.info('test')

      const [line] = mockWrite.mock.calls[0]
      expect(line).toContain('[CUSTOM]')
    })

    it('元のロガーに影響を与えない', () => {
      const baseLogger = NitroLogger.create({ minLevel: 'DEBUG' }, mockWrite)
      const _apiLogger = baseLogger.withCategory('API')

      // Use original logger
      baseLogger.info('base log')

      const [line] = mockWrite.mock.calls[0]
      expect(line).toContain('[SYSTEM]')
      expect(line).not.toContain('[API]')
    })

    it('他のメソッドとチェーンできる', () => {
      const logger = NitroLogger.create({ minLevel: 'DEBUG' }, mockWrite)

      logger.withCategory('SSR').withCategory('API').info('chained')

      const [line] = mockWrite.mock.calls[0]
      expect(line).toContain('[API]')
    })

    it('minLevel フィルタリングを保持する', () => {
      const logger = NitroLogger.create({ minLevel: 'INFO' }, mockWrite)
      const apiLogger = logger.withCategory('API')

      apiLogger.debug('should not log')
      expect(mockWrite).not.toHaveBeenCalled()

      apiLogger.info('should log')
      expect(mockWrite).toHaveBeenCalledTimes(1)
    })
  })

  describe('withMetadata()', () => {
    it('メタデータをマージする', () => {
      const logger = NitroLogger.create({ minLevel: 'DEBUG' }, mockWrite).withMetadata({
        base: 'value',
      })

      logger.info('test', { additional: 'data' })

      const [line] = mockWrite.mock.calls[0]
      expect(line).toContain('"base":"value"')
      expect(line).toContain('"additional":"data"')
    })

    it('元のロガーに影響を与えない', () => {
      const baseLogger = NitroLogger.create({ minLevel: 'DEBUG' }, mockWrite)
      const _extendedLogger = baseLogger.withMetadata({ extra: 'value' })

      baseLogger.info('test')

      const [line] = mockWrite.mock.calls[0]
      expect(line).not.toContain('extra')
    })

    it('複数の withMetadata 呼び出しをチェーンできる', () => {
      const logger = NitroLogger.create({ minLevel: 'DEBUG' }, mockWrite)
        .withMetadata({ key1: 'value1' })
        .withMetadata({ key2: 'value2' })

      logger.info('test')

      const [line] = mockWrite.mock.calls[0]
      expect(line).toContain('"key1":"value1"')
      expect(line).toContain('"key2":"value2"')
    })

    it('同じキーのメタデータを上書きする', () => {
      const logger = NitroLogger.create({ minLevel: 'DEBUG' }, mockWrite)
        .withMetadata({ key: 'original' })
        .withMetadata({ key: 'overridden' })

      logger.info('test')

      const [line] = mockWrite.mock.calls[0]
      expect(line).toContain('"key":"overridden"')
      expect(line).not.toContain('"key":"original"')
    })

    it('コンテキストメタデータと呼び出し時メタデータをマージする', () => {
      const logger = NitroLogger.create({ minLevel: 'DEBUG' }, mockWrite).withMetadata({
        context: 'value',
      })

      logger.info('test', { callTime: 'data' })

      const [line] = mockWrite.mock.calls[0]
      expect(line).toContain('"context":"value"')
      expect(line).toContain('"callTime":"data"')
    })

    it('同じキーの場合、呼び出し時メタデータをコンテキストメタデータより優先する', () => {
      const logger = NitroLogger.create({ minLevel: 'DEBUG' }, mockWrite).withMetadata({
        key: 'context',
      })

      logger.info('test', { key: 'callTime' })

      const [line] = mockWrite.mock.calls[0]
      expect(line).toContain('"key":"callTime"')
    })

    it('withCategory とチェーンできる', () => {
      const logger = NitroLogger.create({ minLevel: 'DEBUG' }, mockWrite)
        .withCategory('API')
        .withMetadata({ requestId: '123' })

      logger.info('test')

      const [line] = mockWrite.mock.calls[0]
      expect(line).toContain('[API]')
      expect(line).toContain('"requestId":"123"')
    })
  })
})
