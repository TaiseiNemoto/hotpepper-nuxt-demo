import { defineEventHandler, getQuery } from 'h3'
import { createHotpepperClient } from '../../../utils/hotpepper-client'
import { respondWithUpstreamError } from '../../../utils/api-response'
import { createSuccessResult } from '../../../types/api'
import { toSmallAreasResponse } from '../../../utils/hp-transformers'
import { normalizeCode, toRecord } from '../../../utils/validation'

// HP-06 小エリアマスタ取得API
// middleAreaCodeが未指定の場合は空の配列を返す（初期ロード時の400エラーを回避）

export default defineEventHandler(async (event) => {
  const raw = getQuery(event)
  const record = toRecord(raw)
  const middleAreaCode = normalizeCode(record.middleAreaCode, 'middleAreaCode', false)

  // middleAreaCodeが未指定の場合は空の配列を返す
  if (!middleAreaCode) {
    return createSuccessResult({ areas: [] })
  }

  const client = createHotpepperClient(event)
  const result = await client.getSmallAreas({ middle_area: middleAreaCode })
  if (!result.success) {
    return respondWithUpstreamError(event, result.error)
  }
  return createSuccessResult(toSmallAreasResponse(result.data))
})
