// @vitest-environment nuxt
import { beforeEach, describe, expect, it, vi } from 'vitest'
import handler from '../../../../../server/api/hp/shops/search.get'
import { createTestEvent } from '../../../../utils/createTestEvent'
import { createFailureResult, createSuccessResult } from '../../../../../server/types/api'
import { toSearchResponse } from '../../../../../server/utils/hp-transformers'
import { mockHpSearchResults, mockHpSearchResultsEmpty } from '../../../../fixtures/hotpepper'
import { mockApiError } from '../../../../fixtures/errors'
import type { HotpepperClient } from '../../../../../server/utils/hotpepper-client'

import { createHotpepperClient } from '../../../../../server/utils/hotpepper-client'

vi.mock('../../../../../server/utils/hotpepper-client', () => ({
  createHotpepperClient: vi.fn(),
}))

describe('HP-01 検索 API', () => {
  const mockCreateClient = vi.mocked(createHotpepperClient)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const setupClient = () => {
    const searchShops = vi.fn()
    mockCreateClient.mockReturnValue({ searchShops } as unknown as HotpepperClient)
    return { searchShops }
  }

  it('複合条件を正規化して検索できる', async () => {
    const { searchShops } = setupClient()
    searchShops.mockResolvedValue(createSuccessResult(mockHpSearchResults))

    const event = createTestEvent({
      path: '/api/hp/shops/search',
      query: {
        q: '  焼肉  ',
        genres: ['G001', 'G001,G002'],
        'areas.large': ['Z011', 'Z012'],
        'areas.middle': ['Y005, Y006'],
        'areas.small': ['X010', 'X011'],
        page: 2,
        perPage: 10,
        order: 1,
      },
    })

    const result = await handler(event)

    expect(result).toEqual(createSuccessResult(toSearchResponse(mockHpSearchResults)))
    expect(event.node.res.statusCode).toBe(200)
  })

  it('位置検索が正しく動作する', async () => {
    const { searchShops } = setupClient()
    searchShops.mockResolvedValue(createSuccessResult(mockHpSearchResults))

    const event = createTestEvent({
      path: '/api/hp/shops/search',
      query: {
        lat: 35.6,
        lng: 139.7,
        range: 2,
        order: 1,
      },
    })

    const result = await handler(event)

    expect(result).toEqual(createSuccessResult(toSearchResponse(mockHpSearchResults)))
    expect(event.node.res.statusCode).toBe(200)
  })

  it('latとlngの片方だけの場合は400を返す', async () => {
    const event = createTestEvent({
      path: '/api/hp/shops/search',
      query: {
        lat: 35.6,
      },
    })

    const result = await handler(event)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe('VALIDATION_ERROR')
    }
    expect(event.node.res.statusCode).toBe(400)
    expect(createHotpepperClient).not.toHaveBeenCalled()
  })

  it('rangeのみ指定してもバリデーションエラーになる', async () => {
    const event = createTestEvent({
      path: '/api/hp/shops/search',
      query: {
        range: 2,
      },
    })

    const result = await handler(event)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe('VALIDATION_ERROR')
    }
    expect(event.node.res.statusCode).toBe(400)
  })

  it('HotPepperクライアントのエラーを透過する', async () => {
    const { searchShops } = setupClient()
    searchShops.mockResolvedValue(createFailureResult({ ...mockApiError.error, statusCode: 503 }))

    const event = createTestEvent({ path: '/api/hp/shops/search' })
    const result = await handler(event)

    expect(result).toEqual(createFailureResult({ ...mockApiError.error, statusCode: 503 }))
    expect(event.node.res.statusCode).toBe(503)
  })

  it('0件レスポンスでもsuccessを維持する', async () => {
    const { searchShops } = setupClient()
    searchShops.mockResolvedValue(createSuccessResult(mockHpSearchResultsEmpty))

    const event = createTestEvent({ path: '/api/hp/shops/search', query: { q: 'empty' } })
    const result = await handler(event)

    expect(result).toEqual(createSuccessResult(toSearchResponse(mockHpSearchResultsEmpty)))
  })
})
