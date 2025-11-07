import { defineEventHandler, getValidatedRouterParams, setResponseStatus } from 'h3'
import { createHotpepperClient } from '../../../utils/hotpepper-client'
import {
  ValidationError,
  respondWithUpstreamError,
  respondWithValidationError,
} from '../../../utils/api-response'
import { createSuccessResult } from '../../../types/api'
import { toShopDetail } from '../../../utils/hp-transformers'

// HP-02 店舗詳細API: IDバリデーションとHotPepper呼び出し結果の整形

export default defineEventHandler(async (event) => {
  let params: { id: string }
  try {
    params = await getValidatedRouterParams<{ id: string }>(event, (routerParams) =>
      normalizeRouterParams(routerParams),
    )
  } catch (error) {
    if (error instanceof ValidationError) {
      return respondWithValidationError(event, error)
    }
    throw error
  }

  const client = createHotpepperClient(event)
  const result = await client.getShopDetail(params.id)

  if (!result.success) {
    if (result.error.code === 'NOT_FOUND') {
      setResponseStatus(event, 404)
      return createSuccessResult({ notFound: true })
    }
    return respondWithUpstreamError(event, result.error)
  }

  const shop = (result.data.shop ?? [])[0]
  if (!shop) {
    setResponseStatus(event, 404)
    return createSuccessResult({ notFound: true })
  }

  return createSuccessResult({ shop: toShopDetail(shop) })
})

// ルーターパラメータを安全に抽出
const normalizeRouterParams = (params: unknown) => {
  const record =
    params && typeof params === 'object' ? (params as Record<string, string | undefined>) : {}
  const id = typeof record.id === 'string' ? record.id.trim() : ''
  if (!id) {
    throw new ValidationError('店舗IDは必須です')
  }
  return { id }
}
