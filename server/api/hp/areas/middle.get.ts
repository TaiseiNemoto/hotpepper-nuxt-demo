import { defineEventHandler, getValidatedQuery } from 'h3'
import { createHotpepperClient } from '../../../utils/hotpepper-client'
import {
  extractValidationError,
  respondWithUpstreamError,
  respondWithValidationError,
} from '../../../utils/api-response'
import { createSuccessResult } from '../../../types/api'
import { toMiddleAreasResponse } from '../../../utils/hp-transformers'
import { normalizeCode, toRecord } from '../../../utils/validation'

// HP-05 中エリアマスタ取得API
// largeAreaCodeが未指定の場合は空の配列を返す（初期ロード時の400エラーを回避）

export default defineEventHandler(async (event) => {
  let query: { largeAreaCode?: string }
  try {
    query = await getValidatedQuery<{ largeAreaCode?: string }>(event, (raw) =>
      parseMiddleAreaQuery(raw),
    )
  } catch (error) {
    const validationError = extractValidationError(error)
    if (validationError) {
      return respondWithValidationError(event, validationError)
    }
    throw error
  }

  // largeAreaCodeが未指定の場合は空の配列を返す
  if (!query.largeAreaCode) {
    return createSuccessResult({ areas: [] })
  }

  const client = createHotpepperClient(event)
  const result = await client.getMiddleAreas({ large_area: query.largeAreaCode })
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
