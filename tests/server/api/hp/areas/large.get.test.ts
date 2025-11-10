// @vitest-environment nuxt
import { beforeEach, describe, expect, it, vi } from 'vitest'
import handler from '../../../../../server/api/hp/areas/large.get'
import { createTestEvent } from '../../../../utils/createTestEvent'
import { createFailureResult, createSuccessResult } from '../../../../../server/types/api'
import { toLargeAreasResponse } from '../../../../../server/utils/hp-transformers'
import { mockHpLargeAreaResults } from '../../../../fixtures/hotpepper'
import { mockApiError } from '../../../../fixtures/errors'
import type { HotpepperClient } from '../../../../../server/utils/hotpepper-client'

import { createHotpepperClient } from '../../../../../server/utils/hotpepper-client'

vi.mock('../../../../../server/utils/hotpepper-client', () => ({
  createHotpepperClient: vi.fn(),
}))

describe('HP-04 大エリア API', () => {
  const mockCreateClient = vi.mocked(createHotpepperClient)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const setupClient = () => {
    const getLargeAreas = vi.fn()
    mockCreateClient.mockReturnValue({ getLargeAreas } as unknown as HotpepperClient)
    return { getLargeAreas }
  }

  it('大エリア一覧を返す', async () => {
    const { getLargeAreas } = setupClient()
    getLargeAreas.mockResolvedValue(createSuccessResult(mockHpLargeAreaResults))

    const event = createTestEvent({ path: '/api/hp/areas/large' })
    const result = await handler(event)

    expect(result).toEqual(createSuccessResult(toLargeAreasResponse(mockHpLargeAreaResults)))
  })

  it('取得失敗時は502を返す', async () => {
    const { getLargeAreas } = setupClient()
    getLargeAreas.mockResolvedValue(createFailureResult(mockApiError.error))

    const event = createTestEvent({ path: '/api/hp/areas/large', query: { testError: 'true' } })
    const result = await handler(event)

    expect(result).toEqual(createFailureResult(mockApiError.error))
    expect(event.node.res.statusCode).toBe(502)
  })
})
