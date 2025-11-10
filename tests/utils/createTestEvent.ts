import { type IncomingHttpHeaders, IncomingMessage, ServerResponse } from 'node:http'
import { Socket } from 'node:net'
import { URL } from 'node:url'
import { type H3Event, createEvent } from 'h3'

export interface TestEventOptions {
  method?: string
  path?: string
  query?: Record<string, string | number | boolean | Array<string | number | boolean> | undefined>
  params?: Record<string, string>
  headers?: IncomingHttpHeaders
  context?: Partial<H3Event['context']>
}

/**
 * H3 イベント生成ヘルパー
 * Nitro ハンドラを直接呼び出すための最低限の request/response を構築する。
 */
export const createTestEvent = ({
  method = 'GET',
  path = '/api/test',
  query,
  params,
  headers,
  context,
}: TestEventOptions = {}) => {
  const socket = new Socket()
  const req = new IncomingMessage(socket)
  const res = new ServerResponse(req)

  req.method = method
  req.headers = { host: 'localhost', ...headers }
  req.url = buildUrl(path, query)

  const event = createEvent(req, res)
  event.context.params = params ?? {}
  if (context) {
    Object.assign(event.context, context)
  }
  return event
}

const buildUrl = (
  path: string,
  query?: Record<string, string | number | boolean | Array<string | number | boolean> | undefined>,
) => {
  if (!query) {
    return path
  }
  const url = new URL('http://localhost' + path)
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) {
      continue
    }
    const values = Array.isArray(value) ? value : [value]
    for (const item of values) {
      url.searchParams.append(key, String(item))
    }
  }
  return url.pathname + (url.search ? `?${url.searchParams.toString()}` : '')
}
