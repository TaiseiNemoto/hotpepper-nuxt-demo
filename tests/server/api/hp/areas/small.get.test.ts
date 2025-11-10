// @vitest-environment nuxt
import { beforeEach, describe, expect, it, vi } from 'vitest'
import handler from '../../../../../server/api/hp/areas/small.get'
import { createTestEvent } from '../../../../utils/createTestEvent'
import { createFailureResult, createSuccessResult } from '../../../../../server/types/api'
import { toSmallAreasResponse } from '../../../../../server/utils/hp-transformers'
import { mockHpSmallAreaResults } from '../../../../fixtures/hotpepper'
import { mockApiError } from '../../../../fixtures/errors'
import type { HotpepperClient } from '../../../../../server/utils/hotpepper-client'
import { createHotpepperClient } from '../../../../../server/utils/hotpepper-client'

vi.mock('../../../../../server/utils/hotpepper-client', () => ({
  createHotpepperClient: vi.fn(),
}))

describe('HP-06 小エリア API', () => {
  const mockCreateClient = vi.mocked(createHotpepperClient)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const setupClient = () => {
    const getSmallAreas = vi.fn()
    mockCreateClient.mockReturnValue({ getSmallAreas } as unknown as HotpepperClient)
    return { getSmallAreas }
  }

  it('middleAreaCode を必須パラメータとして呼び出す', async () => {
    const { getSmallAreas } = setupClient()
    getSmallAreas.mockResolvedValue(createSuccessResult(mockHpSmallAreaResults))

    const event = createTestEvent({
      path: '/api/hp/areas/small',
      query: { middleAreaCode: 'Y005' },
    })
    const result = await handler(event)

    expect(getSmallAreas).toHaveBeenCalledWith({ middle_area: 'Y005' })
    expect(result).toEqual(createSuccessResult(toSmallAreasResponse(mockHpSmallAreaResults)))
  })

  it('middleAreaCode が無い場合は400', async () => {
    const { getSmallAreas } = setupClient()

    const event = createTestEvent({ path: '/api/hp/areas/small' })
    const result = await handler(event)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe('VALIDATION_ERROR')
    }
    expect(event.node.res.statusCode).toBe(400)
    expect(getSmallAreas).not.toHaveBeenCalled()
  })

  it('HotPepper 側のエラーを透過する', async () => {
    const { getSmallAreas } = setupClient()
    getSmallAreas.mockResolvedValue(createFailureResult(mockApiError.error))

    const event = createTestEvent({
      path: '/api/hp/areas/small',
      query: { middleAreaCode: 'Y005', testError: 'true' },
    })
    const result = await handler(event)

    expect(result).toEqual(createFailureResult(mockApiError.error))
    expect(event.node.res.statusCode).toBe(502)
  })
})
