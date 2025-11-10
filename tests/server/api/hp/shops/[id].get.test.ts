// @vitest-environment nuxt
import { beforeEach, describe, expect, it, vi } from 'vitest'
import handler from '../../../../../server/api/hp/shops/[id].get'
import { createTestEvent } from '../../../../utils/createTestEvent'
import { createFailureResult, createSuccessResult } from '../../../../../server/types/api'
import { toShopDetail } from '../../../../../server/utils/hp-transformers'
import { mockHpSearchResults } from '../../../../fixtures/hotpepper'
import { mockApiError } from '../../../../fixtures/errors'
import type { HotpepperClient } from '../../../../../server/utils/hotpepper-client'
import { createHotpepperClient } from '../../../../../server/utils/hotpepper-client'

vi.mock('../../../../../server/utils/hotpepper-client', () => ({
  createHotpepperClient: vi.fn(),
}))

describe('HP-02 詳細 API', () => {
  const mockCreateClient = vi.mocked(createHotpepperClient)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const setupClient = () => {
    const getShopDetail = vi.fn()
    mockCreateClient.mockReturnValue({ getShopDetail } as unknown as HotpepperClient)
    return { getShopDetail }
  }

  it('ID指定で店舗詳細を返す', async () => {
    const { getShopDetail } = setupClient()
    getShopDetail.mockResolvedValue(createSuccessResult(mockHpSearchResults))

    const event = createTestEvent({
      path: '/api/hp/shops/J001234567',
      params: { id: 'J001234567' },
    })

    const result = await handler(event)

    expect(getShopDetail).toHaveBeenCalledWith('J001234567')
    const firstShop = mockHpSearchResults.shop?.[0]
    expect(firstShop).toBeDefined()
    if (!firstShop) {
      throw new Error('mock shop data is missing')
    }
    const expectedShop = toShopDetail(firstShop)
    expect(result).toEqual(createSuccessResult({ shop: expectedShop }))
    expect(event.node.res.statusCode).toBe(200)
  })

  it('NOT_FOUND エラーは404+notFound=trueを返す', async () => {
    const { getShopDetail } = setupClient()
    getShopDetail.mockResolvedValue(
      createFailureResult({ ...mockApiError.error, code: 'NOT_FOUND', statusCode: 404 }),
    )

    const event = createTestEvent({ path: '/api/hp/shops/notfound', params: { id: 'notfound' } })
    const result = await handler(event)

    expect(result).toEqual(createSuccessResult({ notFound: true }))
    expect(event.node.res.statusCode).toBe(404)
  })

  it('成功しても配列が空なら404を返す', async () => {
    const { getShopDetail } = setupClient()
    getShopDetail.mockResolvedValue(createSuccessResult({ ...mockHpSearchResults, shop: [] }))

    const event = createTestEvent({ path: '/api/hp/shops/empty', params: { id: 'empty' } })
    const result = await handler(event)

    expect(result).toEqual(createSuccessResult({ notFound: true }))
    expect(event.node.res.statusCode).toBe(404)
  })

  it('その他のエラーはrespondWithUpstreamErrorを返す', async () => {
    const { getShopDetail } = setupClient()
    getShopDetail.mockResolvedValue(
      createFailureResult({ ...mockApiError.error, code: 'UPSTREAM_ERROR', statusCode: 502 }),
    )

    const event = createTestEvent({ path: '/api/hp/shops/error', params: { id: 'error' } })
    const result = await handler(event)

    expect(result).toEqual(
      createFailureResult({ ...mockApiError.error, code: 'UPSTREAM_ERROR', statusCode: 502 }),
    )
    expect(event.node.res.statusCode).toBe(502)
  })

  it('ID が未指定ならバリデーションエラー', async () => {
    const event = createTestEvent({ path: '/api/hp/shops/' })

    const result = await handler(event)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe('VALIDATION_ERROR')
    }
    expect(event.node.res.statusCode).toBe(400)
    expect(createHotpepperClient).not.toHaveBeenCalled()
  })
})
