import { defineEventHandler, getValidatedQuery } from 'h3'
import { createHotpepperClient } from '../../../utils/hotpepper-client'
import {
  ValidationError,
  respondWithUpstreamError,
  respondWithValidationError,
} from '../../../utils/api-response'
import { createSuccessResult } from '../../../types/api'
import { toMiddleAreasResponse } from '../../../utils/hp-transformers'
import { normalizeCode, toRecord } from '../../../utils/validation'

// HP-05 中エリアマスタ取得API（大エリアコード任意）

export default defineEventHandler(async (event) => {
  let query: { largeAreaCode?: string }
  try {
    query = await getValidatedQuery<{ largeAreaCode?: string }>(event, (raw) =>
      parseMiddleAreaQuery(raw),
    )
  } catch (error) {
    if (error instanceof ValidationError) {
      return respondWithValidationError(event, error)
    }
    throw error
  }

  const client = createHotpepperClient(event)
  const params = query.largeAreaCode ? { large_area: query.largeAreaCode } : undefined
  const result = await client.getMiddleAreas(params)
  if (!result.success) {
    return respondWithUpstreamError(event, result.error)
  }
  return createSuccessResult(toMiddleAreasResponse(result.data))
})

// 大エリアコードは任意指定なのでundefinedを許容
const parseMiddleAreaQuery = (raw: unknown) => {
  const record = toRecord(raw)
  return {
    largeAreaCode: normalizeCode(record.largeAreaCode, 'largeAreaCode', false),
  }
}
