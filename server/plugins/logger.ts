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
