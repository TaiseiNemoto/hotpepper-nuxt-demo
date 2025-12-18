// @vitest-environment nuxt
import { beforeEach, describe, expect, it, vi } from 'vitest'
import handler from '../../../../../server/api/hp/areas/middle.get'
import { createTestEvent } from '../../../../utils/createTestEvent'
import { createFailureResult, createSuccessResult } from '../../../../../server/types/api'
import { mockHpMiddleAreaResults } from '../../../../fixtures/hotpepper'
import { mockApiError } from '../../../../fixtures/errors'
import type { HotpepperClient } from '../../../../../server/utils/hotpepper-client'
import { createHotpepperClient } from '../../../../../server/utils/hotpepper-client'

vi.mock('../../../../../server/utils/hotpepper-client', () => ({
  createHotpepperClient: vi.fn(),
}))

describe('HP-05 中エリア API', () => {
  const mockCreateClient = vi.mocked(createHotpepperClient)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const setupClient = () => {
    const getMiddleAreas = vi.fn()
    mockCreateClient.mockReturnValue({ getMiddleAreas } as unknown as HotpepperClient)
    return { getMiddleAreas }
  }

  it('largeAreaCode が無い場合は空の配列を返す', async () => {
    const { getMiddleAreas } = setupClient()

    const event = createTestEvent({ path: '/api/hp/areas/middle' })
    const result = await handler(event)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.areas).toEqual([])
    }
    expect(getMiddleAreas).not.toHaveBeenCalled()
  })

  it('largeAreaCode 指定時は引数を付与する', async () => {
    const { getMiddleAreas } = setupClient()
    getMiddleAreas.mockResolvedValue(createSuccessResult(mockHpMiddleAreaResults))

    const event = createTestEvent({
      path: '/api/hp/areas/middle',
      query: { largeAreaCode: 'Z011' },
    })
    await handler(event)

    expect(getMiddleAreas).toHaveBeenCalledWith({ large_area: 'Z011' })
  })

  it('largeAreaCode の形式が不正なら400', async () => {
    const { getMiddleAreas } = setupClient()

    const event = createTestEvent({
      path: '/api/hp/areas/middle',
      query: { largeAreaCode: ['Z011', 'Z012'] },
    })

    const result = await handler(event)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe('VALIDATION_ERROR')
    }
    expect(event.node.res.statusCode).toBe(400)
    expect(getMiddleAreas).not.toHaveBeenCalled()
  })

  it('取得エラーは502を返す', async () => {
    const { getMiddleAreas } = setupClient()
    getMiddleAreas.mockResolvedValue(createFailureResult(mockApiError.error))

    const event = createTestEvent({
      path: '/api/hp/areas/middle',
      query: { largeAreaCode: 'Z011', testError: 'true' },
    })
    const result = await handler(event)

    expect(result).toEqual(createFailureResult(mockApiError.error))
    expect(event.node.res.statusCode).toBe(502)
  })
})
