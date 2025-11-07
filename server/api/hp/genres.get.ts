import { defineEventHandler } from 'h3'
import { createHotpepperClient } from '../../utils/hotpepper-client'
import { respondWithUpstreamError } from '../../utils/api-response'
import { createSuccessResult } from '../../types/api'
import { toGenresResponse } from '../../utils/hp-transformers'

// HP-03 ジャンルマスタ取得API

export default defineEventHandler(async (event) => {
  const client = createHotpepperClient(event)
  const result = await client.getGenres()
  if (!result.success) {
    return respondWithUpstreamError(event, result.error)
  }
  return createSuccessResult(toGenresResponse(result.data))
})
