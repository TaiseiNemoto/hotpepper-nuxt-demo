import { defineEventHandler, getValidatedQuery } from 'h3'
import { createHotpepperClient } from '../../../utils/hotpepper-client'
import {
  ValidationError,
  respondWithUpstreamError,
  respondWithValidationError,
} from '../../../utils/api-response'
import { createSuccessResult } from '../../../types/api'
import { toSmallAreasResponse } from '../../../utils/hp-transformers'
import { normalizeCode, toRecord } from '../../../utils/validation'

// HP-06 小エリアマスタ取得API（中エリアコード必須）

export default defineEventHandler(async (event) => {
  let query: { middleAreaCode: string }
  try {
    query = await getValidatedQuery<{ middleAreaCode: string }>(event, (raw) =>
      parseSmallAreaQuery(raw),
    )
  } catch (error) {
    if (error instanceof ValidationError) {
      return respondWithValidationError(event, error)
    }
    throw error
  }

  const client = createHotpepperClient(event)
  const result = await client.getSmallAreas({ middle_area: query.middleAreaCode })
  if (!result.success) {
    return respondWithUpstreamError(event, result.error)
  }
  return createSuccessResult(toSmallAreasResponse(result.data))
})

// 中エリアコードは必須なのでここで検証
const parseSmallAreaQuery = (raw: unknown) => {
  const record = toRecord(raw)
  const middleAreaCode = normalizeCode(record.middleAreaCode, 'middleAreaCode', true)
  if (!middleAreaCode) {
    throw new ValidationError('middleAreaCodeを指定してください')
  }
  return {
    middleAreaCode,
  }
}
