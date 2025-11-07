export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL'
export type LogCategory = 'ACCESS' | 'SSR' | 'API' | 'SYSTEM' | string
export type LogMetadata = Record<string, unknown>

export const LEVEL_PRIORITY: Record<LogLevel, number> = {
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

export function resolveLogLevel(value: unknown): LogLevel {
  if (!value && value !== 0) {
    return 'INFO'
  }

  const normalized = String(value).toUpperCase()
  return normalized in LEVEL_PRIORITY ? (normalized as LogLevel) : 'INFO'
}

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

export function formatTimestampJst(date: Date) {
  const parts = JST_FORMATTER.formatToParts(date).reduce<Record<string, string>>((acc, part) => {
    if (part.type !== 'literal') {
      acc[part.type] = part.value
    }
    return acc
  }, {})

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}${JST_OFFSET}`
}

export function formatMetadata(metadata: LogMetadata) {
  if (!metadata || Object.keys(metadata).length === 0) {
    return ''
  }

  try {
    return ` ${JSON.stringify(metadata)}`
  } catch {
    return ' {"metadata":"[unserializable]"}'
  }
}
