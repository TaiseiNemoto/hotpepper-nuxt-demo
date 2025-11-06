import { defineNitroPlugin, useRuntimeConfig } from '#imports'
import type { NitroApp } from 'nitropack'
import type { H3Event } from 'h3'
import { getRequestIP } from 'h3'

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL'
type LogCategory = 'ACCESS' | 'SSR' | 'API' | 'SYSTEM' | string
type LogMetadata = Record<string, unknown>

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  DEBUG: 10,
  INFO: 20,
  WARN: 30,
  ERROR: 40,
  FATAL: 50,
}

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

const JST_OFFSET = '+09:00'

interface LoggerConfig {
  minLevel: LogLevel
}

interface LoggerContext {
  category: LogCategory
  metadata: LogMetadata
}

export class NitroLogger {
  constructor(
    private readonly config: LoggerConfig,
    private readonly context: LoggerContext,
    private readonly write: (line: string, level: LogLevel) => void,
  ) {}

  static create(initialConfig: LoggerConfig, writer: (line: string, level: LogLevel) => void) {
    return new NitroLogger(initialConfig, { category: 'SYSTEM', metadata: {} }, writer)
  }

  debug(message: string, metadata?: LogMetadata) {
    this.log('DEBUG', message, metadata)
  }

  info(message: string, metadata?: LogMetadata) {
    this.log('INFO', message, metadata)
  }

  warn(message: string, metadata?: LogMetadata) {
    this.log('WARN', message, metadata)
  }

  error(message: string, metadata?: LogMetadata) {
    this.log('ERROR', message, metadata)
  }

  fatal(message: string, metadata?: LogMetadata) {
    this.log('FATAL', message, metadata)
  }

  withCategory(category: LogCategory) {
    return new NitroLogger(
      this.config,
      { ...this.context, category: category.toUpperCase() },
      this.write,
    )
  }

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

  private shouldLog(level: LogLevel) {
    return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[this.config.minLevel]
  }
}

declare module 'h3' {
  interface H3EventContext {
    logger?: NitroLogger
  }
}

const ACCESS_CATEGORY = 'ACCESS'
const SSR_CATEGORY = 'SSR'
const SYSTEM_CATEGORY = 'SYSTEM'

interface NitroBeforeResponsePayload {
  statusCode?: number
  headers?: Record<string, string | string[]> | Headers
  body?: unknown
}

export default defineNitroPlugin((nitroApp: NitroApp) => {
  nitroApp.hooks.hook('request', (event: H3Event) => {
    const logSettings = getLogSettings(event)
    const baseLogger = createBaseLogger(event)

    const requestLogger = baseLogger.withMetadata({
      method: event.node.req.method,
      path: event.path,
      ip: getRequestIP(event),
    })
    event.context.logger = requestLogger

    if (logSettings.accessLoggingEnabled) {
      requestLogger.withCategory(ACCESS_CATEGORY).info(`${event.node.req.method} ${event.path}`)
    }
  })

  nitroApp.hooks.hook('beforeResponse', (event: H3Event, response: NitroBeforeResponsePayload) => {
    const requestLogger = ensureRequestLogger(event, () => createBaseLogger(event))
    const statusCode = response.statusCode ?? event.node.res.statusCode
    if (isSsrResponse(response)) {
      requestLogger.withCategory(SSR_CATEGORY).debug('SSR response dispatched', {
        statusCode,
      })
    }
  })

  nitroApp.hooks.hook('error', (error: unknown, context?: { event?: H3Event }) => {
    const requestLogger = context?.event
      ? ensureRequestLogger(context.event, () => createBaseLogger(context.event))
      : createBaseLogger()

    const systemLogger = requestLogger.withCategory(SYSTEM_CATEGORY)
    if (error instanceof Error) {
      systemLogger.error(error.message, serializeErrorMetadata(error, context?.event))
    } else {
      systemLogger.error('Non-error exception captured', { error })
    }
  })
})

function getLogSettings(event?: H3Event) {
  const runtimeConfig = useRuntimeConfig(event)

  return {
    minLevel: resolveLogLevel(runtimeConfig.logLevel),
    accessLoggingEnabled: resolveBoolean(runtimeConfig.logEnableAccess, true),
  }
}

function createBaseLogger(event?: H3Event) {
  const { minLevel } = getLogSettings(event)
  return NitroLogger.create({ minLevel }, writeLine)
}

function resolveLogLevel(value: unknown): LogLevel {
  if (!value && value !== 0) {
    return 'INFO'
  }

  const normalized = String(value).toUpperCase()
  return normalized in LEVEL_PRIORITY ? (normalized as LogLevel) : 'INFO'
}

function resolveBoolean(value: unknown, fallback: boolean) {
  if (value === undefined || value === null) {
    return fallback
  }
  if (typeof value === 'boolean') {
    return value
  }
  const normalized = String(value).trim().toLowerCase()
  return ['1', 'true', 'yes', 'on'].includes(normalized)
}

function formatTimestampJst(date: Date) {
  const parts = JST_FORMATTER.formatToParts(date).reduce<Record<string, string>>((acc, part) => {
    if (part.type !== 'literal') {
      acc[part.type] = part.value
    }
    return acc
  }, {})

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}${JST_OFFSET}`
}

function formatMetadata(metadata: LogMetadata) {
  if (!metadata || Object.keys(metadata).length === 0) {
    return ''
  }

  try {
    return ` ${JSON.stringify(metadata)}`
  } catch {
    return ' {"metadata":"[unserializable]"}'
  }
}

function writeLine(line: string, level: LogLevel) {
  const target = level === 'ERROR' || level === 'FATAL' ? process.stderr : process.stdout

  target.write(`${line}\n`)
}

function ensureRequestLogger(event: H3Event, factory: () => NitroLogger) {
  if (event.context.logger) {
    return event.context.logger
  }
  const synthesized = factory().withMetadata({
    method: event.node.req.method,
    path: event.path,
  })
  event.context.logger = synthesized
  return synthesized
}

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

function normalizeHeaderValues(headers: Record<string, string | string[]>) {
  return Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [
      key.toLowerCase(),
      Array.isArray(value) ? value.join(', ') : value,
    ]),
  )
}

function serializeErrorMetadata(error: unknown, event?: H3Event): LogMetadata {
  if (!(error instanceof Error)) {
    return { error }
  }

  const metadata: LogMetadata = {
    name: error.name,
    stack: error.stack,
  }

  const statusCode = (error as { statusCode?: number }).statusCode
  if (typeof statusCode === 'number') {
    metadata.statusCode = statusCode
  }
  if (event) {
    metadata.method = event.node.req.method
    metadata.path = event.path
  }

  return metadata
}
