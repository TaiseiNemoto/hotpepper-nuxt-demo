// @vitest-environment nuxt
import { beforeEach, describe, expect, it, vi } from 'vitest'
import handler from '../../../../server/api/hp/genres.get'
import { createTestEvent } from '../../../utils/createTestEvent'
import { createFailureResult, createSuccessResult } from '../../../../server/types/api'
import { toGenresResponse } from '../../../../server/utils/hp-transformers'
import { mockHpGenreResults } from '../../../fixtures/hotpepper'
import { mockApiError } from '../../../fixtures/errors'
import type { HotpepperClient } from '../../../../server/utils/hotpepper-client'
import { createHotpepperClient } from '../../../../server/utils/hotpepper-client'

vi.mock('../../../../server/utils/hotpepper-client', () => ({
  createHotpepperClient: vi.fn(),
}))

describe('HP-03 ジャンル API', () => {
  const mockCreateClient = vi.mocked(createHotpepperClient)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const setupClient = () => {
    const getGenres = vi.fn()
    mockCreateClient.mockReturnValue({ getGenres } as unknown as HotpepperClient)
    return { getGenres }
  }

  it('ジャンル一覧を取得できる', async () => {
    const { getGenres } = setupClient()
    getGenres.mockResolvedValue(createSuccessResult(mockHpGenreResults))

    const event = createTestEvent({ path: '/api/hp/genres' })
    const result = await handler(event)

    expect(result).toEqual(createSuccessResult(toGenresResponse(mockHpGenreResults)))
  })

  it('失敗時は502を返す', async () => {
    const { getGenres } = setupClient()
    getGenres.mockResolvedValue(createFailureResult(mockApiError.error))

    const event = createTestEvent({ path: '/api/hp/genres', query: { testError: 'true' } })
    const result = await handler(event)

    expect(result).toEqual(createFailureResult(mockApiError.error))
    expect(event.node.res.statusCode).toBe(502)
  })
})
