import { defineEventHandler } from 'h3'
import { createHotpepperClient } from '../../../utils/hotpepper-client'
import { respondWithUpstreamError } from '../../../utils/api-response'
import { createSuccessResult } from '../../../types/api'
import { toLargeAreasResponse } from '../../../utils/hp-transformers'

// HP-04 大エリアマスタ取得API

export default defineEventHandler(async (event) => {
  const client = createHotpepperClient(event)
  const result = await client.getLargeAreas()
  if (!result.success) {
    return respondWithUpstreamError(event, result.error)
  }
  return createSuccessResult(toLargeAreasResponse(result.data))
})
